"""
fetch_afai.py — RivieraMayaPass (Fase 2.5, utilidad — NO es el bot diario)
==========================================================================
Baja el histórico del índice satelital de sargazo **AFAI** (Alternative Floating
Algae Index) de NOAA CoastWatch / USF, para puntos mar adentro frente a cada
zona. Es la señal de "cuánto sargazo viene flotando" — la mejor ETIQUETA
regional aproximada para el modelo de ML.

Fuente: NOAA CoastWatch Caribbean & Gulf node — ERDDAP.
  Dataset: noaa_aoml_atlantic_oceanwatch_AFAI_7D (USF AFAI, 7 días acumulados)
  Histórico desde 2016-06-18. Gratis, sin API key.
  https://cwcgom.aoml.noaa.gov/erddap/griddap/noaa_aoml_atlantic_oceanwatch_AFAI_7D.html

Qué produce:
  afai_historico.csv — una fila por (fecha, zona) con el valor AFAI mar adentro.
  Se mantiene SEPARADO del dataset del bot; se une al entrenar (join fecha+zona).

¿Por qué AFAI sirve de etiqueta? Mide la reflectancia de la clorofila del
sargazo flotando: AFAI alto = mucho sargazo en el agua. A diferencia del estado
playa-por-playa (que no existe histórico), esta señal regional SÍ tiene años de
historia y anticipa el arribo (el satélite ve la mancha antes de que toque tierra).

Cómo correrlo:
  python scripts/sargazo/fetch_afai.py
  (o desde GitHub Actions: workflow "AFAI satelital (Fase 2.5)")

Variables de entorno opcionales: AFAI_START, AFAI_END (YYYY-MM-DD).
"""

from __future__ import annotations

import csv
import io
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta
from pathlib import Path

ERDDAP = "https://cwcgom.aoml.noaa.gov/erddap/griddap/noaa_aoml_atlantic_oceanwatch_AFAI_7D.csv"

# `or` cubre el caso de variable presente pero vacía (default del workflow).
START_DATE = os.environ.get("AFAI_START") or "2021-01-01"
END_DATE = os.environ.get("AFAI_END") or date.today().isoformat()

OUT = Path(__file__).resolve().parent / "afai_historico.csv"

# Para cada zona, un punto MAR ADENTRO (corrido al este, hacia el Caribe abierto,
# donde flota el sargazo) — así el AFAI mide el agua, no la tierra.
# (lat, lon) ya desplazados a aguas abiertas.
OFFSHORE = {
    "Zona Norte": (20.6450, -86.9300),
    "Mamitas": (20.6320, -86.9300),
    "Centro": (20.6296, -86.9300),
    "Playacar": (20.6180, -86.9400),
    "Xcalacoco": (20.6800, -86.9100),
    "Holbox": (21.5500, -87.2000),
    "Isla Mujeres": (21.2310, -86.6500),
    "Puerto Morelos": (20.8480, -86.7500),
    "Cancún": (21.1610, -86.7400),
    "Tulum": (20.2110, -87.3500),
}


def _get_with_retry(url, attempts=4):
    """GET con reintentos ante hipos de red (timeouts SSL, URLError, 5xx).

    Los errores 4xx (salvo 429) son permanentes —la petición está mal— así que
    NO se reintentan: fallan rápido para que el problema real sea evidente.
    """
    delay = 6
    for i in range(1, attempts + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "rivieramayapass-afai"})
            with urllib.request.urlopen(req, timeout=120) as resp:
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


def _date_chunks(start_iso: str, end_iso: str, days: int = 120):
    """Parte [start, end] en ventanas de `days` días (inclusive)."""
    start = date.fromisoformat(start_iso)
    end = date.fromisoformat(end_iso)
    cur = start
    while cur <= end:
        chunk_end = min(cur + timedelta(days=days - 1), end)
        yield cur.isoformat(), chunk_end.isoformat()
        cur = chunk_end + timedelta(days=1)


def _parse_csv(text: str) -> list[tuple[str, str]]:
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if len(rows) < 3:  # 0=nombres, 1=unidades, luego datos
        return []
    header = rows[0]
    try:
        t_idx = header.index("time")
        a_idx = header.index("AFAI")
    except ValueError:
        return []
    out = []
    for r in rows[2:]:
        if len(r) <= max(t_idx, a_idx):
            continue
        out.append((r[t_idx][:10], r[a_idx]))  # (YYYY-MM-DD, valor)
    return out


def fetch_point(lat: float, lon: float) -> list[tuple[str, str]]:
    """Serie temporal de AFAI en el punto más cercano. Devuelve [(fecha, valor)].

    El servidor de NOAA se cae con rangos largos en una sola petición, así que
    se pide por ventanas de ~4 meses y se concatena. Si una ventana falla, se
    omite y se sigue con las demás (no se pierde todo el histórico por un hueco).
    """
    out: list[tuple[str, str]] = []
    for s, e in _date_chunks(START_DATE, END_DATE):
        query = f"AFAI[({s}T12:00:00Z):({e}T12:00:00Z)][({lat}):({lat})][({lon}):({lon})]"
        url = f"{ERDDAP}?{urllib.parse.quote(query, safe='()[]:.,-')}"
        try:
            out.extend(_parse_csv(_get_with_retry(url)))
        except Exception as exc:  # noqa: BLE001
            print(f"    ventana {s}..{e} omitida ({exc})", file=sys.stderr)
        time.sleep(0.5)  # cortesía con el servidor
    return out


def main() -> int:
    all_rows = []
    for name, (lat, lon) in OFFSHORE.items():
        print(f"Bajando AFAI de {name} ({lat}, {lon})...")
        try:
            series = fetch_point(lat, lon)
        except Exception as exc:  # noqa: BLE001
            print(f"  AVISO: falló {name} ({exc}).", file=sys.stderr)
            series = []
        valid = sum(1 for _, v in series if v not in ("", "NaN"))
        print(f"  {len(series)} fechas ({valid} con dato).")
        for fecha, valor in series:
            all_rows.append(
                {
                    "fecha": fecha,
                    "zona": name,
                    "afai_7d": "" if valor in ("", "NaN") else valor,
                }
            )
        time.sleep(1)  # cortesía con el servidor

    if not all_rows:
        print("ERROR: no se obtuvo ningún dato de AFAI.", file=sys.stderr)
        return 1

    all_rows.sort(key=lambda r: (r["zona"], r["fecha"]))
    with OUT.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=["fecha", "zona", "afai_7d"])
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"\nListo: {OUT} ({len(all_rows):,} filas)")
    print("Es una ETIQUETA regional aproximada (AFAI alto = más sargazo).")
    print("Se une al histórico de clima y al dataset del bot por (fecha, zona).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
