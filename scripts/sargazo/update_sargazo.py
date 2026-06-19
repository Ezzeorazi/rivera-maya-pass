"""
Generador automático del reporte de sargazo de RivieraMayaPass.

Fase 1: combina datos REALES de viento (Open-Meteo, gratis y sin API key) con
la API de Gemini + Google Search grounding para producir un reporte del estado
del sargazo del día en Playa del Carmen / Riviera Maya.

Salidas:
  - src/data/sargazo-report.json   -> lo consume el componente <BeachStatus />.
  - scripts/sargazo/sargazo-history.csv -> una fila por día (dataset para ML).

¿Por qué el viento? El sargazo ya flota en el Caribe; el viento local decide a
qué playa llega. Viento del E/SE/S empuja el sargazo hacia la costa de la
Riviera Maya; viento del O/NO lo aleja. Por eso se lo damos a la IA como dato
duro y lo registramos cada día para entrenar un modelo predictivo más adelante.

Variables de entorno:
  GEMINI_API_KEY   (obligatoria)  -> clave de Google AI Studio.
  GEMINI_MODEL     (opcional)     -> por defecto "gemini-2.5-flash".
  SARGAZO_ZONES    (opcional)     -> zonas separadas por coma.

Uso:
  python update_sargazo.py
"""

from __future__ import annotations

import csv
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from google import genai
from google.genai import types

# --- Configuración ---------------------------------------------------------

# Zonas de playa que reporta el semáforo. Se pueden sobreescribir con la
# variable de entorno SARGAZO_ZONES (separadas por coma).
DEFAULT_ZONES = ["Zona Norte", "Mamitas", "Centro", "Playacar", "Xcalacoco"]

VALID_STATUSES = {"clean", "moderate", "seaweed"}
STATUS_SEVERITY = {"clean": 0, "moderate": 1, "seaweed": 2}

# Coordenadas de Playa del Carmen para la consulta de viento.
LATITUDE = 20.6296
LONGITUDE = -87.0739

REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_PATH = REPO_ROOT / "src" / "data" / "sargazo-report.json"
HISTORY_PATH = Path(__file__).resolve().parent / "sargazo-history.csv"


def get_zones() -> list[str]:
    raw = os.environ.get("SARGAZO_ZONES", "").strip()
    if raw:
        zones = [z.strip() for z in raw.split(",") if z.strip()]
        if zones:
            return zones
    return DEFAULT_ZONES


# --- Viento (Open-Meteo) ---------------------------------------------------


def degrees_to_cardinal(deg: float | None) -> str:
    if deg is None:
        return "?"
    dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"]
    idx = int((deg % 360) / 45 + 0.5) % 8
    return dirs[idx]


def fetch_wind() -> dict | None:
    """Consulta Open-Meteo (gratis, sin API key). Devuelve None si falla."""
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "current": "wind_speed_10m,wind_direction_10m,wind_gusts_10m",
        "daily": "wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant",
        "wind_speed_unit": "kmh",
        "timezone": "America/Cancun",
        "forecast_days": 1,
    }
    url = "https://api.open-meteo.com/v1/forecast?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception as exc:  # noqa: BLE001 - degradamos con gracia
        print(f"AVISO: no se pudo obtener el viento ({exc}). Se continúa sin él.", file=sys.stderr)
        return None

    current = data.get("current", {})
    daily = data.get("daily", {})

    def first(seq):
        return seq[0] if isinstance(seq, list) and seq else None

    deg = current.get("wind_direction_10m")
    if deg is None:
        deg = first(daily.get("wind_direction_10m_dominant"))

    speed = current.get("wind_speed_10m")
    if speed is None:
        speed = first(daily.get("wind_speed_10m_max"))

    gust = current.get("wind_gusts_10m")
    if gust is None:
        gust = first(daily.get("wind_gusts_10m_max"))

    return {
        "speed_kmh": speed,
        "gust_kmh": gust,
        "dir_deg": deg,
        "dir_cardinal": degrees_to_cardinal(deg),
    }


def describe_wind(wind: dict | None) -> str:
    if not wind:
        return "No hay datos de viento disponibles hoy."
    onshore = {"E", "SE", "S", "NE"}  # direcciones que empujan sargazo a la costa
    card = wind.get("dir_cardinal", "?")
    tendency = (
        "Este viento sopla DESDE el mar hacia la costa, lo que favorece el arribo de sargazo."
        if card in onshore
        else "Este viento tiende a alejar el sargazo de la costa o a mantenerlo a raya."
    )
    return (
        f"Viento actual en Playa del Carmen: dirección {card} ({wind.get('dir_deg')}°), "
        f"velocidad {wind.get('speed_kmh')} km/h, ráfagas {wind.get('gust_kmh')} km/h. "
        f"{tendency}"
    )


# --- Gemini ----------------------------------------------------------------


def build_prompt(zones: list[str], today: str, wind: dict | None) -> str:
    zones_list = ", ".join(zones)
    wind_block = describe_wind(wind)
    return f"""Eres un reportero local experto en las condiciones de playa de la
Riviera Maya. Hoy es {today}.

DATO DURO DE VIENTO (medido hoy, úsalo en tu análisis):
{wind_block}
Recuerda: el sargazo flota en el Caribe y el viento local determina a qué playa
llega. Viento del E/SE/S/NE empuja el sargazo hacia la costa de la Riviera Maya;
viento del O/NO/N lo aleja.

Busca en internet la información MÁS RECIENTE (de hoy o de los últimos 2 días)
sobre el estado del SARGAZO en las playas de Playa del Carmen, Quintana Roo,
México. Apóyate en fuentes confiables como la Red de Monitoreo del Sargazo de
Quintana Roo, reportes de Cancún/Playa del Carmen y noticias locales. Cruza esa
información con el dato de viento de arriba.

Debes clasificar el estado de CADA una de estas zonas de Playa del Carmen:
{zones_list}

Usa exactamente uno de estos valores de estado para cada zona:
- "clean"    -> playa limpia, sin sargazo o cantidades mínimas.
- "moderate" -> presencia moderada de sargazo.
- "seaweed"  -> sargazo abundante / playa muy afectada.

Si no encuentras un dato específico de una zona, estima de forma conservadora
con base en la tendencia general de Playa del Carmen y la dirección del viento.

Responde ÚNICAMENTE con un objeto JSON válido (sin texto adicional, sin
explicaciones, sin bloques de código markdown) con esta forma EXACTA:

{{
  "zones": [
    {{ "name": "<nombre exacto de la zona>", "status": "clean|moderate|seaweed" }}
  ],
  "summary": {{
    "es": "<resumen claro, amigable y útil de 2-3 frases sobre el estado del sargazo hoy en Playa del Carmen; menciona el viento si es relevante>",
    "en": "<same summary translated to natural English>"
  }}
}}

Incluye en "zones" exactamente estas zonas y en este orden: {zones_list}.
"""


def extract_json(text: str) -> dict:
    """Extrae el primer objeto JSON del texto (tolera fences ```json)."""
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
    return "moderate"  # fallback seguro


def validate_and_build(data: dict, zones: list[str], wind: dict | None) -> dict:
    raw_zones = {
        str(z.get("name", "")).strip(): normalize_status(str(z.get("status", "")))
        for z in data.get("zones", [])
        if isinstance(z, dict)
    }

    out_zones = []
    for name in zones:
        status = raw_zones.get(name)
        if status is None:
            for k, v in raw_zones.items():
                if k.lower() == name.lower():
                    status = v
                    break
        out_zones.append({"name": name, "status": status or "moderate"})

    summary = data.get("summary", {})
    es = str(summary.get("es", "")).strip()
    en = str(summary.get("en", "")).strip()
    if not es:
        raise ValueError("La IA no devolvió un resumen en español.")
    if not en:
        en = es

    report = {
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "ai",
        "zones": out_zones,
        "summary": {"es": es, "en": en},
    }
    if wind:
        report["wind"] = wind
    return report


# --- Historial CSV (dataset para ML futuro) --------------------------------

CSV_FIELDS = [
    "date",
    "captured_at_utc",
    "source",
    "wind_dir_cardinal",
    "wind_dir_deg",
    "wind_speed_kmh",
    "wind_gust_kmh",
    "worst_status",
    "zones_json",
]


def append_history(report: dict, wind: dict | None) -> None:
    """Agrega una fila por día. Idempotente: reemplaza la fila si ya existe hoy."""
    today = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d")
    worst = max(
        (z["status"] for z in report["zones"]),
        key=lambda s: STATUS_SEVERITY.get(s, 0),
        default="clean",
    )
    row = {
        "date": today,
        "captured_at_utc": report["updatedAt"],
        "source": report["source"],
        "wind_dir_cardinal": (wind or {}).get("dir_cardinal", ""),
        "wind_dir_deg": (wind or {}).get("dir_deg", ""),
        "wind_speed_kmh": (wind or {}).get("speed_kmh", ""),
        "wind_gust_kmh": (wind or {}).get("gust_kmh", ""),
        "worst_status": worst,
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


def main() -> int:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: falta la variable de entorno GEMINI_API_KEY", file=sys.stderr)
        return 1

    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    zones = get_zones()
    today = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d")

    print("Obteniendo viento de Open-Meteo...")
    wind = fetch_wind()
    print(f"  {describe_wind(wind)}")

    client = genai.Client(api_key=api_key)
    prompt = build_prompt(zones, today, wind)

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
        report = validate_and_build(data, zones, wind)
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"ERROR al parsear la respuesta: {exc}", file=sys.stderr)
        print("--- Respuesta cruda ---", file=sys.stderr)
        print(text, file=sys.stderr)
        return 1

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Reporte escrito en {OUTPUT_PATH}")

    append_history(report, wind)

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
