"""
Generador automático del reporte de sargazo de RivieraMayaPass.

Usa la API de Gemini con Google Search grounding para buscar el estado del
sargazo del día en Playa del Carmen / Riviera Maya y redactar un reporte
estructurado (estado por zona + resumen en español e inglés).

El resultado se escribe en src/data/sargazo-report.json, que consume el
componente <BeachStatus /> del sitio Next.js.

Variables de entorno:
  GEMINI_API_KEY   (obligatoria)  -> clave de Google AI Studio.
  GEMINI_MODEL     (opcional)     -> por defecto "gemini-2.5-flash".
  SARGAZO_ZONES    (opcional)     -> zonas separadas por coma.

Uso:
  python update_sargazo.py
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from google import genai
from google.genai import types

# --- Configuración ---------------------------------------------------------

# Zonas de playa que reporta el semáforo. Se pueden sobreescribir con la
# variable de entorno SARGAZO_ZONES (separadas por coma).
DEFAULT_ZONES = ["Zona Norte", "Mamitas", "Centro", "Playacar", "Xcalacoco"]

VALID_STATUSES = {"clean", "moderate", "seaweed"}

# src/data/sargazo-report.json relativo a la raíz del repo.
OUTPUT_PATH = (
    Path(__file__).resolve().parents[2] / "src" / "data" / "sargazo-report.json"
)


def get_zones() -> list[str]:
    raw = os.environ.get("SARGAZO_ZONES", "").strip()
    if raw:
        zones = [z.strip() for z in raw.split(",") if z.strip()]
        if zones:
            return zones
    return DEFAULT_ZONES


def build_prompt(zones: list[str], today: str) -> str:
    zones_list = ", ".join(zones)
    return f"""Eres un reportero local experto en las condiciones de playa de la
Riviera Maya. Hoy es {today}.

Busca en internet la información MÁS RECIENTE (de hoy o de los últimos 2 días)
sobre el estado del SARGAZO en las playas de Playa del Carmen, Quintana Roo,
México. Apóyate en fuentes confiables como la Red de Monitoreo del Sargazo de
Quintana Roo, reportes de Cancún/Playa del Carmen y noticias locales.

Debes clasificar el estado de CADA una de estas zonas de Playa del Carmen:
{zones_list}

Usa exactamente uno de estos valores de estado para cada zona:
- "clean"    -> playa limpia, sin sargazo o cantidades mínimas.
- "moderate" -> presencia moderada de sargazo.
- "seaweed"  -> sargazo abundante / playa muy afectada.

Si no encuentras un dato específico de una zona, estima de forma conservadora
con base en la tendencia general de Playa del Carmen ese día.

Responde ÚNICAMENTE con un objeto JSON válido (sin texto adicional, sin
explicaciones, sin bloques de código markdown) con esta forma EXACTA:

{{
  "zones": [
    {{ "name": "<nombre exacto de la zona>", "status": "clean|moderate|seaweed" }}
  ],
  "summary": {{
    "es": "<resumen claro, amigable y útil de 2-3 frases sobre el estado del sargazo hoy en Playa del Carmen>",
    "en": "<same summary translated to natural English>"
  }}
}}

Incluye en "zones" exactamente estas zonas y en este orden: {zones_list}.
"""


def extract_json(text: str) -> dict:
    """Extrae el primer objeto JSON del texto (tolera fences ```json)."""
    cleaned = text.strip()
    # Quita fences tipo ```json ... ```
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
    if fence:
        cleaned = fence.group(1)
    else:
        # Toma desde la primera { hasta la última }.
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start : end + 1]
    return json.loads(cleaned)


def normalize_status(value: str) -> str:
    v = (value or "").strip().lower()
    if v in VALID_STATUSES:
        return v
    # Sinónimos comunes que la IA podría devolver.
    if v in {"clear", "limpia", "limpio", "green"}:
        return "clean"
    if v in {"moderado", "moderada", "medium", "yellow", "low"}:
        return "moderate"
    if v in {"sargazo", "high", "red", "heavy", "abundante"}:
        return "seaweed"
    return "moderate"  # fallback seguro


def validate_and_build(data: dict, zones: list[str]) -> dict:
    raw_zones = {
        str(z.get("name", "")).strip(): normalize_status(str(z.get("status", "")))
        for z in data.get("zones", [])
        if isinstance(z, dict)
    }

    out_zones = []
    for name in zones:
        status = raw_zones.get(name)
        if status is None:
            # Coincidencia laxa por si la IA cambió mayúsculas/acentos.
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
        en = es  # peor caso: usa el español.

    return {
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "ai",
        "zones": out_zones,
        "summary": {"es": es, "en": en},
    }


def main() -> int:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: falta la variable de entorno GEMINI_API_KEY", file=sys.stderr)
        return 1

    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    zones = get_zones()
    today = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d")

    client = genai.Client(api_key=api_key)
    prompt = build_prompt(zones, today)

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
        report = validate_and_build(data, zones)
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
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
