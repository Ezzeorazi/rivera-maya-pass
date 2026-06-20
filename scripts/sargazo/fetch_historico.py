"""
fetch_historico.py — RivieraMayaPass (utilidad de Fase 2, NO es el bot diario)
==============================================================================
Baja el histórico de VIENTO + TEMPERATURA (Open-Meteo Historical / ERA5, gratis
y sin API key) para las 10 zonas que monitorea el bot, y arma un archivo listo
para análisis y como base de FEATURES del modelo de ML.

⚠️ IMPORTANTE — esto es la "pregunta", no la "respuesta":
  El histórico te da viento/clima/estacionalidad con años de datos. Pero NO
  contiene la etiqueta "playa X estuvo limpia/moderada/con sargazo" (ese dato
  histórico no existe estructurado en internet). La columna `sargazo_estado`
  queda VACÍA a propósito: es la etiqueta que se llena con el dato verificado.

  Por eso este archivo se mantiene SEPARADO del histórico que recolecta el bot
  (Supabase / sargazo-history.csv). Se unen recién al entrenar (join por
  fecha+zona). Ver scripts/sargazo/README.md.

Salidas:
  historico_clima.csv   (amigable para git / pandas)
  historico_clima.xlsx  (para revisar/llenar a mano la etiqueta)

Cómo correrlo:
  pip install -r scripts/sargazo/requirements-historico.txt
  python scripts/sargazo/fetch_historico.py
  (o desde GitHub Actions: workflow "Histórico de clima (Fase 2)")

Variables de entorno opcionales: HIST_START, HIST_END (YYYY-MM-DD).
Fuente: Open-Meteo Historical Weather API (ERA5). Datos CC BY 4.0.
"""

from __future__ import annotations

import math
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import json
import csv
from datetime import date, timedelta
from pathlib import Path

# `or` cubre el caso de variable PRESENTE pero VACÍA (default vacío del workflow);
# get(k, default) NO lo cubre y dejaría end_date="" → la API responde 400.
START_DATE = os.environ.get("HIST_START") or "2021-01-01"
# Vacío = hasta hace 5 días: el archivo ERA5 tiene ~5 días de retraso, pedir
# "hoy" o el futuro también devuelve 400.
END_DATE = os.environ.get("HIST_END") or (date.today() - timedelta(days=5)).isoformat()
TIMEZONE = "America/Cancun"

OUT_DIR = Path(__file__).resolve().parent
CSV_OUT = OUT_DIR / "historico_clima.csv"
XLSX_OUT = OUT_DIR / "historico_clima.xlsx"

# Zonas (las mismas del bot) con coordenadas aproximadas por zona.
ZONES = {
    # Playa del Carmen
    "Zona Norte": (20.6450, -87.0650),
    "Mamitas": (20.6320, -87.0700),
    "Centro": (20.6296, -87.0739),
    "Playacar": (20.6180, -87.0790),
    "Xcalacoco": (20.6800, -87.0500),
    # Región ("¿dónde está limpio hoy?")
    "Holbox": (21.5220, -87.3790),
    "Isla Mujeres": (21.2310, -86.7310),
    "Puerto Morelos": (20.8480, -86.8750),
    "Cancún": (21.1610, -86.8510),
    "Tulum": (20.2110, -87.4290),
}

# onshore (empuja sargazo a la costa, que mira al este): viento DESDE el NE..S.
# 22.5°–202.5°. Coincide con ONSHORE_DIRS del bot {NE,E,SE,S}.
DIRS_8 = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"]


def es_onshore(grados):
    if grados is None:
        return None
    return 1 if 22.5 <= float(grados) <= 202.5 else 0


def cardinal(grados):
    if grados is None:
        return None
    return DIRS_8[int((float(grados) % 360) / 45 + 0.5) % 8]


def _get_with_retry(url, attempts=4):
    """GET con reintentos ante hipos de red (timeouts SSL, URLError, 5xx).

    Los errores 4xx (salvo 429) son permanentes —la petición está mal— así que
    NO se reintentan: fallan rápido para que el problema real sea evidente.
    """
    delay = 6
    for i in range(1, attempts + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "rivieramayapass-historico"})
            with urllib.request.urlopen(req, timeout=90) as resp:
                return resp.read().decode("utf-8")
        except urllib.error.HTTPError as exc:
            if exc.code != 429 and 400 <= exc.code < 500:
                raise  # error de cliente: no reintentar
            if i == attempts:
                raise
            print(f"  reintento {i}/{attempts} (HTTP {exc.code})...", file=sys.stderr)
            time.sleep(delay)
            delay *= 2
        except Exception as exc:  # noqa: BLE001
            if i == attempts:
                raise
            print(f"  reintento {i}/{attempts} ({exc})...", file=sys.stderr)
            time.sleep(delay)
            delay *= 2


def fetch_zone(name, lat, lon):
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": START_DATE,
        "end_date": END_DATE,
        "daily": ",".join(
            [
                "wind_speed_10m_max",
                "wind_gusts_10m_max",
                "wind_direction_10m_dominant",
                "temperature_2m_max",
                "temperature_2m_min",
            ]
        ),
        "timezone": TIMEZONE,
        "wind_speed_unit": "kmh",
    }
    url = "https://archive-api.open-meteo.com/v1/archive?" + urllib.parse.urlencode(params)
    return json.loads(_get_with_retry(url))["daily"]


def main() -> int:
    rows = []
    fallidas = []
    for name, (lat, lon) in ZONES.items():
        print(f"Bajando {name}...", flush=True)
        try:
            daily = fetch_zone(name, lat, lon)
        except Exception as exc:  # noqa: BLE001
            print(f"  AVISO: falló {name} ({exc}); se omite.", file=sys.stderr)
            fallidas.append(name)
            continue
        dates = daily.get("time", [])
        for i, fecha in enumerate(dates):
            deg = daily["wind_direction_10m_dominant"][i]
            doy = (
                __import__("datetime").date.fromisoformat(fecha).timetuple().tm_yday
            )
            rows.append(
                {
                    "fecha": fecha,
                    "anio": int(fecha[:4]),
                    "mes": int(fecha[5:7]),
                    "dia_del_anio": doy,
                    "zona": name,
                    "viento_dir_grados": deg,
                    "viento_cardinal": cardinal(deg),
                    "onshore": es_onshore(deg),
                    "viento_kmh": daily["wind_speed_10m_max"][i],
                    "rafagas_kmh": daily["wind_gusts_10m_max"][i],
                    "temp_max_c": daily["temperature_2m_max"][i],
                    "temp_min_c": daily["temperature_2m_min"][i],
                    "estacion_sin": round(math.sin(2 * math.pi * doy / 365), 4),
                    "estacion_cos": round(math.cos(2 * math.pi * doy / 365), 4),
                    "sargazo_estado": "",  # ← etiqueta a llenar con dato verificado
                }
            )
        time.sleep(1)  # cortesía con el servidor gratuito

    if not rows:
        print("ERROR: ninguna zona se pudo bajar.", file=sys.stderr)
        return 1
    if fallidas:
        print(f"AVISO: zonas omitidas por error de red: {', '.join(fallidas)}", file=sys.stderr)

    fields = list(rows[0].keys())
    with CSV_OUT.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    print(f"CSV: {CSV_OUT} ({len(rows):,} filas)")

    # Excel opcional (si openpyxl está disponible).
    try:
        import pandas as pd

        df = pd.DataFrame(rows)
        with pd.ExcelWriter(XLSX_OUT, engine="openpyxl") as xl:
            df.to_excel(xl, sheet_name="historico", index=False)
            resumen = (
                df.assign(onshore=df["onshore"].fillna(0))
                .groupby(["zona", "anio", "mes"])
                .agg(
                    dias=("fecha", "count"),
                    dias_onshore=("onshore", "sum"),
                    viento_prom=("viento_kmh", "mean"),
                    temp_prom=("temp_max_c", "mean"),
                )
                .reset_index()
            )
            resumen["pct_onshore"] = (resumen["dias_onshore"] / resumen["dias"]).round(2)
            resumen.to_excel(xl, sheet_name="resumen_mensual", index=False)
        print(f"Excel: {XLSX_OUT}")
    except ImportError:
        print("(openpyxl/pandas no instalados: se omite el Excel; el CSV ya está.)")

    print("\nSiguiente: la columna 'sargazo_estado' se llena con datos VERIFICADOS")
    print("(semáforo oficial). El histórico aporta features, no las etiquetas.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
