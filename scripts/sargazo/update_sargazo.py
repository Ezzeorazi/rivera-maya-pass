"""
Generador automático del reporte de sargazo de RivieraMayaPass.

Combina datos REALES (viento de hoy + pronóstico de viento a varios días vía
Open-Meteo, y alertas de huracán/tormenta vía NOAA NHC) con la API de Gemini +
Google Search grounding para producir un reporte enfocado en la CALIDAD DE LA
PLAYA y en ayudar al visitante a decidir a dónde ir.

Salidas:
  - src/data/sargazo-report.json   -> lo consume el componente <BeachStatus />.
  - scripts/sargazo/sargazo-history.csv -> una fila por día (dataset para ML).
  - Supabase (opcional)            -> mismo dato, consultable.

Variables de entorno:
  GEMINI_API_KEY   (obligatoria)  -> clave de Google AI Studio.
  GEMINI_MODEL     (opcional)     -> por defecto "gemini-2.5-flash".
  SARGAZO_ZONES    (opcional)     -> zonas separadas por coma.
  SUPABASE_URL / SUPABASE_KEY     -> (opcional) almacén histórico.

Uso:
  python update_sargazo.py
"""

from __future__ import annotations

import csv
import json
import math
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from google import genai
from google.genai import types

# --- Configuración ---------------------------------------------------------

DEFAULT_ZONES = ["Zona Norte", "Mamitas", "Centro", "Playacar", "Xcalacoco"]

# Puntos de referencia regionales para responder "¿dónde SÍ está limpio hoy?"
# cuando Playa del Carmen está afectada. Suelen ser zonas protegidas (norte /
# arrecife) que escapan al cinturón de sargazo.
REGION_ZONES = ["Holbox", "Isla Mujeres", "Puerto Morelos", "Cancún", "Tulum"]

# "unknown" = no hay datos confiables de esa zona; preferimos ser honestos
# antes que adivinar (evita el "pintar todo igual").
VALID_STATUSES = {"clean", "moderate", "seaweed", "unknown"}
STATUS_SEVERITY = {"clean": 0, "moderate": 1, "seaweed": 2}

OVERRIDES_PATH = Path(__file__).resolve().parent / "overrides.json"

# Coordenadas de Playa del Carmen.
LATITUDE = 20.6296
LONGITUDE = -87.0739

# Zona horaria de Quintana Roo (UTC-5 todo el año, sin horario de verano).
CANCUN_TZ = ZoneInfo("America/Cancun")

# Direcciones de viento que empujan el sargazo HACIA la costa (mar -> playa).
# La costa de la Riviera Maya mira al este, así que el viento del E/SE/S/NE
# es "onshore" (favorece el arribo).
ONSHORE_DIRS = {"NE", "E", "SE", "S"}

# Cuántos días de pronóstico de viento pedir (además de hoy).
FORECAST_DAYS = 3

# Distancia (km) por debajo de la cual una tormenta del Atlántico se considera
# relevante para la Riviera Maya.
STORM_RELEVANT_KM = 1500

REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_PATH = REPO_ROOT / "src" / "data" / "sargazo-report.json"
HISTORY_PATH = Path(__file__).resolve().parent / "sargazo-history.csv"

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
SUPABASE_TABLE = os.environ.get("SUPABASE_TABLE", "sargazo_history")


def get_zones() -> list[str]:
    raw = os.environ.get("SARGAZO_ZONES", "").strip()
    if raw:
        zones = [z.strip() for z in raw.split(",") if z.strip()]
        if zones:
            return zones
    return DEFAULT_ZONES


def local_date() -> str:
    """Fecha actual en Quintana Roo (no la del runner/UTC)."""
    return datetime.now(CANCUN_TZ).strftime("%Y-%m-%d")


def degrees_to_cardinal(deg: float | None) -> str:
    if deg is None:
        return "?"
    dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"]
    return dirs[int((deg % 360) / 45 + 0.5) % 8]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _http_get_json(url: str, timeout: int = 20) -> dict | list | None:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "rivieramayapass-sargazo-bot"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as exc:  # noqa: BLE001 - degradamos con gracia
        print(f"AVISO: fallo al consultar {url} ({exc}).", file=sys.stderr)
        return None


# --- Viento: hoy + pronóstico (Open-Meteo) ---------------------------------


def fetch_weather() -> tuple[dict | None, list[dict]]:
    """Devuelve (viento_de_hoy, pronostico_por_dia). Degrada a (None, [])."""
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "current": "wind_speed_10m,wind_direction_10m,wind_gusts_10m",
        "daily": "wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant",
        "wind_speed_unit": "kmh",
        "timezone": "America/Cancun",
        "forecast_days": FORECAST_DAYS + 1,
    }
    url = "https://api.open-meteo.com/v1/forecast?" + urllib.parse.urlencode(params)
    data = _http_get_json(url)
    if not data:
        return None, []

    current = data.get("current", {})
    deg = current.get("wind_direction_10m")
    wind_today = {
        "speed_kmh": current.get("wind_speed_10m"),
        "gust_kmh": current.get("wind_gusts_10m"),
        "dir_deg": deg,
        "dir_cardinal": degrees_to_cardinal(deg),
    }

    daily = data.get("daily", {})
    dates = daily.get("time", []) or []
    speeds = daily.get("wind_speed_10m_max", []) or []
    gusts = daily.get("wind_gusts_10m_max", []) or []
    dirs = daily.get("wind_direction_10m_dominant", []) or []

    forecast: list[dict] = []
    # El índice 0 es hoy; tomamos los siguientes días como pronóstico.
    for i in range(1, len(dates)):
        d_deg = dirs[i] if i < len(dirs) else None
        card = degrees_to_cardinal(d_deg)
        forecast.append(
            {
                "date": dates[i],
                "dir_deg": d_deg,
                "dir_cardinal": card,
                "speed_kmh": speeds[i] if i < len(speeds) else None,
                "gust_kmh": gusts[i] if i < len(gusts) else None,
                "onshore": card in ONSHORE_DIRS,
            }
        )
    return wind_today, forecast


def describe_wind(wind: dict | None) -> str:
    if not wind:
        return "No hay datos de viento disponibles hoy."
    card = wind.get("dir_cardinal", "?")
    tendency = (
        "Sopla DESDE el mar hacia la costa: favorece el arribo de sargazo."
        if card in ONSHORE_DIRS
        else "Tiende a alejar el sargazo de la costa o a mantenerlo a raya."
    )
    return (
        f"Viento hoy: {card} ({wind.get('dir_deg')}°), {wind.get('speed_kmh')} km/h, "
        f"ráfagas {wind.get('gust_kmh')} km/h. {tendency}"
    )


def describe_forecast(forecast: list[dict]) -> str:
    if not forecast:
        return "Sin pronóstico de viento disponible."
    lines = []
    for f in forecast:
        flag = "onshore (empuja sargazo a la playa)" if f["onshore"] else "offshore (lo aleja)"
        lines.append(
            f"  {f['date']}: viento {f['dir_cardinal']} {f['speed_kmh']} km/h -> {flag}"
        )
    return "Pronóstico de viento próximos días:\n" + "\n".join(lines)


# --- Alertas de huracán / tormenta (NOAA NHC) ------------------------------


def fetch_storm_alerts() -> list[dict]:
    """Tormentas activas del Atlántico cercanas a la Riviera Maya. [] si no hay."""
    data = _http_get_json("https://www.nhc.noaa.gov/CurrentStorms.json")
    if not data or not isinstance(data, dict):
        return []

    relevant: list[dict] = []
    for storm in data.get("activeStorms", []):
        if not isinstance(storm, dict):
            continue
        sid = str(storm.get("id", "")).lower()
        # Solo cuenca del Atlántico (los ids del Atlántico empiezan por "al").
        if not sid.startswith("al"):
            continue
        try:
            lat = float(storm.get("latitudeNumeric"))
            lon = float(storm.get("longitudeNumeric"))
        except (TypeError, ValueError):
            continue
        dist = haversine_km(LATITUDE, LONGITUDE, lat, lon)
        if dist > STORM_RELEVANT_KM:
            continue
        relevant.append(
            {
                "name": storm.get("name", "Sistema tropical"),
                "classification": storm.get("classification", ""),
                "distance_km": round(dist),
                "movement": storm.get("movementDir", ""),
            }
        )
    relevant.sort(key=lambda s: s["distance_km"])
    return relevant


def build_hurricane_alert(storms: list[dict]) -> dict:
    if not storms:
        return {"active": False}
    main = storms[0]
    es = (
        f"⚠️ {main['classification']} {main['name']} activa en el Caribe "
        f"(~{main['distance_km']} km). Posible oleaje fuerte y cambios rápidos en "
        f"las playas; revisa avisos locales antes de ir."
    )
    en = (
        f"⚠️ {main['classification']} {main['name']} active in the Caribbean "
        f"(~{main['distance_km']} km). Possible heavy surf and fast-changing beach "
        f"conditions; check local advisories before going."
    )
    return {"active": True, "headline": {"es": es, "en": en}, "storms": storms}


def describe_storms(storms: list[dict]) -> str:
    if not storms:
        return "No hay tormentas/huracanes activos relevantes en el Caribe hoy."
    parts = [
        f"{s['classification']} {s['name']} a ~{s['distance_km']} km (rumbo {s['movement']})"
        for s in storms
    ]
    return "ALERTA: sistemas tropicales activos cerca: " + "; ".join(parts) + "."


# --- Gemini ----------------------------------------------------------------


def build_prompt(
    zones: list[str],
    today: str,
    wind: dict | None,
    forecast: list[dict],
    storms: list[dict],
) -> str:
    zones_list = ", ".join(zones)
    region_list = ", ".join(REGION_ZONES)
    return f"""Eres un reportero local experto en condiciones de playa de la
Riviera Maya. Tu objetivo es ayudar a un visitante a decidir A DÓNDE IR HOY,
enfocándote en la CALIDAD de la playa. Hoy es {today}.

DATOS DUROS DE HOY (úsalos en tu análisis):
- {describe_wind(wind)}
- {describe_storms(storms)}
{describe_forecast(forecast)}

Recuerda: el sargazo flota en el Caribe y el viento local decide a qué playa
llega. Viento del E/SE/S/NE lo empuja a la costa; del O/NO/N lo aleja.

Busca en internet la información MÁS RECIENTE (hoy o últimos 2 días) sobre el
SARGAZO en las playas de Playa del Carmen, Quintana Roo, México (Red de
Monitoreo del Sargazo de QR, noticias locales). Cruza esa info con los datos de
arriba.

Clasifica el estado de CADA zona de Playa del Carmen: {zones_list}
Estados válidos:
- "clean" (limpia), "moderate" (moderado), "seaweed" (abundante)
- "unknown" (SIN DATO): úsalo cuando NO tengas información específica y
  confiable de esa zona. Es preferible "unknown" antes que adivinar.

Además, clasifica el estado del sargazo HOY en estos puntos de referencia de la
región (mismo set de estados), para poder decirle al visitante DÓNDE SÍ está
limpio si Playa del Carmen está afectada: {region_list}
Estas zonas (Holbox, Isla Mujeres, Puerto Morelos, partes de Cancún) suelen
estar más limpias por su orientación norte o protección de arrecife.

REGLAS IMPORTANTES (afectan la credibilidad del sitio):
1. NO marques todas las zonas con el mismo estado salvo que la evidencia lo
   respalde de verdad. Las condiciones suelen VARIAR por zona; algunas (p. ej.
   Mamitas o la zona norte) pueden diferir del centro. Refleja esa variación
   cuando haya base para ello.
2. Si solo tienes una tendencia general (sin detalle por playa), marca como
   "unknown" las zonas de las que no tengas dato concreto, en vez de asumir el
   peor caso para todas.
3. Reporta tu nivel de confianza global en "confidence":
   - "high" SOLO si encontraste un dato PLAYA POR PLAYA reciente (p. ej. el
     mapa-semáforo de la Red de Monitoreo del Sargazo de QR, o un reporte
     detallado por zona de hoy/ayer).
   - "medium" si tienes el panorama general reciente pero NO el detalle por zona.
   - "low" si te basas sobre todo en la tendencia general y el viento.
   Ojo: tener noticias del panorama general NO es "high". "high" exige detalle
   por playa.

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto extra)
con esta forma EXACTA:

{{
  "confidence": "high|medium|low",
  "zones": [
    {{ "name": "<zona>", "status": "clean|moderate|seaweed|unknown" }}
  ],
  "region": [
    {{ "name": "<punto de referencia>", "status": "clean|moderate|seaweed|unknown" }}
  ],
  "summary": {{
    "es": "<2-3 frases sobre el estado del sargazo hoy; menciona viento o tormenta si es relevante>",
    "en": "<same in natural English>"
  }},
  "recommendation": {{
    "es": "<1-2 frases PRÁCTICAS: si hay zonas limpias, di cuál es la mejor para ir hoy; si todo está afectado, sugiere un plan alternativo como un día de alberca o beach club. Enfócate en que el visitante no pierda el día.>",
    "en": "<same in natural English>"
  }},
  "forecast": {{
    "es": "<1-2 frases sobre la tendencia de los próximos 2-3 días según el pronóstico de viento: ¿mejora, empeora o se mantiene?>",
    "en": "<same in natural English>"
  }}
}}

Incluye en "zones" exactamente estas zonas y en este orden: {zones_list}.
Incluye en "region" exactamente estos puntos y en este orden: {region_list}.
"""


def extract_json(text: str) -> dict:
    cleaned = text.strip()
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
    if fence:
        cleaned = fence.group(1)
    else:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start : end + 1]
    return json.loads(cleaned)


def normalize_status(value: str) -> str:
    v = (value or "").strip().lower()
    if v in VALID_STATUSES:
        return v
    if v in {"clear", "limpia", "limpio", "green"}:
        return "clean"
    if v in {"moderado", "moderada", "medium", "yellow", "low"}:
        return "moderate"
    if v in {"sargazo", "high", "red", "heavy", "abundante"}:
        return "seaweed"
    if v in {"sin dato", "sin datos", "n/a", "na", "desconocido", "no data", "gray", "grey"}:
        return "unknown"
    # Si no se reconoce, preferimos "sin dato" antes que inventar un estado.
    return "unknown"


def normalize_confidence(value: str) -> str:
    v = (value or "").strip().lower()
    if v in {"high", "alta", "alto"}:
        return "high"
    if v in {"low", "baja", "bajo"}:
        return "low"
    return "medium"


def _match_zones(raw_list, names: list[str]) -> list[dict]:
    """Mapea la lista de la IA a los nombres esperados, en orden. Sin dato -> unknown."""
    raw = {
        str(z.get("name", "")).strip(): normalize_status(str(z.get("status", "")))
        for z in raw_list
        if isinstance(z, dict)
    }
    out = []
    for name in names:
        status = raw.get(name)
        if status is None:
            for k, v in raw.items():
                if k.lower() == name.lower():
                    status = v
                    break
        out.append({"name": name, "status": status or "unknown"})
    return out


def _bilingual(data: dict, key: str, fallback_es: str = "", fallback_en: str = "") -> dict | None:
    obj = data.get(key) or {}
    es = str(obj.get("es", "")).strip() or fallback_es
    en = str(obj.get("en", "")).strip() or fallback_en or es
    if not es:
        return None
    return {"es": es, "en": en}


def validate_and_build(
    data: dict,
    zones: list[str],
    wind: dict | None,
    forecast: list[dict],
    storms: list[dict],
) -> dict:
    out_zones = _match_zones(data.get("zones", []), zones)
    region_zones = _match_zones(data.get("region", []), REGION_ZONES)

    summary = _bilingual(data, "summary")
    if not summary:
        raise ValueError("La IA no devolvió un resumen.")

    report = {
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "ai",
        "confidence": normalize_confidence(str(data.get("confidence", ""))),
        "zones": out_zones,
        "regionZones": region_zones,
        "summary": summary,
    }
    rec = _bilingual(data, "recommendation")
    if rec:
        report["recommendation"] = rec
    fc = _bilingual(data, "forecast")
    if fc:
        report["forecast"] = fc
    if forecast:
        report["forecastDays"] = forecast
    if wind:
        report["wind"] = wind
    report["hurricaneAlert"] = build_hurricane_alert(storms)
    return report


# --- Historial (dataset para ML futuro) ------------------------------------


def worst_status(report: dict) -> str:
    known = [z["status"] for z in report["zones"] if z["status"] in STATUS_SEVERITY]
    if not known:
        return "unknown"
    return max(known, key=lambda s: STATUS_SEVERITY[s])


CSV_FIELDS = [
    "date",
    "captured_at_utc",
    "source",
    "confidence",
    "wind_dir_cardinal",
    "wind_dir_deg",
    "wind_speed_kmh",
    "wind_gust_kmh",
    "worst_status",
    "hurricane_active",
    "zones_json",
]


def append_history(report: dict, wind: dict | None) -> None:
    """Agrega una fila por día. Idempotente: reemplaza la fila si ya existe hoy."""
    today = local_date()
    row = {
        "date": today,
        "captured_at_utc": report["updatedAt"],
        "source": report["source"],
        "confidence": report.get("confidence", ""),
        "wind_dir_cardinal": (wind or {}).get("dir_cardinal", ""),
        "wind_dir_deg": (wind or {}).get("dir_deg", ""),
        "wind_speed_kmh": (wind or {}).get("speed_kmh", ""),
        "wind_gust_kmh": (wind or {}).get("gust_kmh", ""),
        "worst_status": worst_status(report),
        "hurricane_active": report.get("hurricaneAlert", {}).get("active", False),
        "zones_json": json.dumps(report["zones"], ensure_ascii=False),
    }

    existing: list[dict] = []
    if HISTORY_PATH.exists():
        with HISTORY_PATH.open("r", encoding="utf-8", newline="") as fh:
            existing = [r for r in csv.DictReader(fh) if r.get("date") != today]

    existing.append(row)
    with HISTORY_PATH.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(existing)
    print(f"Historial actualizado en {HISTORY_PATH} ({len(existing)} filas)")


def upsert_supabase(report: dict, wind: dict | None) -> None:
    """Inserta/actualiza la fila de hoy en Supabase. No-op si no está configurado."""
    if not (SUPABASE_URL and SUPABASE_KEY):
        print("Supabase no configurado (SUPABASE_URL/SUPABASE_KEY ausentes); se omite.")
        return

    alert = report.get("hurricaneAlert", {})
    payload = {
        "date": local_date(),
        "captured_at": report["updatedAt"],
        "source": report["source"],
        "wind_dir_cardinal": (wind or {}).get("dir_cardinal"),
        "wind_dir_deg": (wind or {}).get("dir_deg"),
        "wind_speed_kmh": (wind or {}).get("speed_kmh"),
        "wind_gust_kmh": (wind or {}).get("gust_kmh"),
        "worst_status": worst_status(report),
        "hurricane_active": alert.get("active", False),
        "confidence": report.get("confidence"),
        "overridden": report["source"] == "ai+manual",
        "zones": report["zones"],
        "region": report.get("regionZones", []),
        "sources": report.get("sources", []),
        "summary_es": report["summary"]["es"],
        "summary_en": report["summary"]["en"],
        "recommendation_es": report.get("recommendation", {}).get("es"),
        "recommendation_en": report.get("recommendation", {}).get("en"),
        "forecast_es": report.get("forecast", {}).get("es"),
        "forecast_en": report.get("forecast", {}).get("en"),
    }

    url = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            print(f"Supabase upsert OK (HTTP {resp.status})")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")
        print(f"AVISO: fallo upsert Supabase (HTTP {exc.code}): {body}", file=sys.stderr)
    except Exception as exc:  # noqa: BLE001
        print(f"AVISO: fallo upsert Supabase: {exc}", file=sys.stderr)


def extract_sources(response) -> list[dict]:
    """Saca las fuentes que Gemini usó (grounding). [] si no hay/falla."""
    sources: list[dict] = []
    try:
        candidate = response.candidates[0]
        meta = getattr(candidate, "grounding_metadata", None)
        chunks = getattr(meta, "grounding_chunks", None) or []
        seen = set()
        for ch in chunks:
            web = getattr(ch, "web", None)
            if not web:
                continue
            uri = getattr(web, "uri", None)
            title = getattr(web, "title", None)
            if not uri or uri in seen:
                continue
            seen.add(uri)
            sources.append({"title": title or uri, "url": uri})
            if len(sources) >= 5:
                break
    except Exception as exc:  # noqa: BLE001
        print(f"AVISO: no se pudieron extraer fuentes ({exc}).", file=sys.stderr)
    return sources


def load_overrides() -> dict:
    """Lee overrides.json si existe. Permite forzar zonas o pausar la publicación."""
    if not OVERRIDES_PATH.exists():
        return {}
    try:
        return json.loads(OVERRIDES_PATH.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        print(f"AVISO: overrides.json inválido ({exc}); se ignora.", file=sys.stderr)
        return {}


def apply_overrides(report: dict, overrides: dict) -> None:
    """Aplica correcciones manuales por zona sobre el reporte ya generado."""
    forced = overrides.get("zones") or {}
    if not isinstance(forced, dict) or not forced:
        return
    forced_lower = {k.lower(): v for k, v in forced.items()}
    changed = False
    for zone in report["zones"]:
        key = zone["name"].lower()
        if key in forced_lower:
            new_status = normalize_status(str(forced_lower[key]))
            if new_status != zone["status"]:
                zone["status"] = new_status
                changed = True
    if changed:
        report["source"] = "ai+manual"
        note = overrides.get("note")
        if isinstance(note, dict) and note.get("es"):
            report["overrideNote"] = {"es": note.get("es", ""), "en": note.get("en", note.get("es", ""))}
        print("Override manual aplicado a una o más zonas.")


def main() -> int:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: falta la variable de entorno GEMINI_API_KEY", file=sys.stderr)
        return 1

    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    zones = get_zones()
    today = local_date()

    overrides = load_overrides()
    if overrides.get("paused"):
        print("PAUSADO por overrides.json: no se publica reporte hoy. Se mantiene el anterior.")
        return 0

    print("Obteniendo clima (Open-Meteo)...")
    wind, forecast = fetch_weather()
    print(f"  {describe_wind(wind)}")

    print("Obteniendo alertas de tormenta (NOAA NHC)...")
    storms = fetch_storm_alerts()
    print(f"  {describe_storms(storms)}")

    client = genai.Client(api_key=api_key)
    prompt = build_prompt(zones, today, wind, forecast, storms)

    print(f"Consultando {model} con Google Search grounding...")
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())],
            temperature=0.3,
        ),
    )

    text = response.text or ""
    if not text.strip():
        print("ERROR: respuesta vacía del modelo", file=sys.stderr)
        return 1

    try:
        data = extract_json(text)
        report = validate_and_build(data, zones, wind, forecast, storms)
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"ERROR al parsear la respuesta: {exc}", file=sys.stderr)
        print("--- Respuesta cruda ---", file=sys.stderr)
        print(text, file=sys.stderr)
        return 1

    sources = extract_sources(response)
    if sources:
        report["sources"] = sources
        print(f"Fuentes capturadas: {len(sources)}")
    apply_overrides(report, overrides)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Reporte escrito en {OUTPUT_PATH}")

    append_history(report, wind)
    upsert_supabase(report, wind)

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
