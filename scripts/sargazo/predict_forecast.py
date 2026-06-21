"""
predict_forecast.py — RivieraMayaPass (Fase 2: predicción en producción)
========================================================================
Paso OPCIONAL del bot diario. Lee el reporte ya generado
(src/data/sargazo-report.json), toma el pronóstico de viento/temperatura
(forecastDays) y, con el modelo entrenado con tu semáforo verificado, predice el
estado de sargazo de los próximos días. Escribe el resultado en el campo
"prediction" del mismo JSON.

Filosofía: NO debe romper nada. Si falta el modelo, faltan dependencias o el
pronóstico viene vacío, sale en VERDE sin tocar el JSON (el reporte de HOY ya
está publicado por update_sargazo.py). La predicción es un agregado, no el plato
principal.

Cómo se usa (después de update_sargazo.py):
  python scripts/sargazo/predict_forecast.py
"""

from __future__ import annotations

import json
import math
import sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parents[1]
REPORT_PATH = REPO_ROOT / "src" / "data" / "sargazo-report.json"
MODEL_PATH = HERE / "sargazo_verificado_model.joblib"

ONSHORE_DIRS = {"NE", "E", "SE", "S"}

# Umbrales de "score de sargazo" (0 = limpio, 1 = con sargazo) → nivel mostrado.
# Cómodos para 2 clases: el modelo da P(con sargazo).
LEVEL_SEAWEED = 0.65   # ≥ esto: rojo
LEVEL_MODERATE = 0.45  # entre medias: amarillo (incierto); por debajo: verde


def _ok(msg: str) -> int:
    print(msg)
    return 0


def features_for_day(day: dict, feature_names: list[str]) -> list[float] | None:
    """Arma el vector de features de un día del pronóstico, en el orden del modelo."""
    try:
        doy = date.fromisoformat(day["date"]).timetuple().tm_yday
        mes = int(day["date"][5:7])
    except Exception:  # noqa: BLE001
        return None
    card = str(day.get("dir_cardinal", ""))
    available = {
        "estacion_sin": math.sin(2 * math.pi * doy / 365.25),
        "estacion_cos": math.cos(2 * math.pi * doy / 365.25),
        "mes": float(mes),
        "onshore": 1.0 if (day.get("onshore") or card in ONSHORE_DIRS) else 0.0,
        "viento_kmh": day.get("speed_kmh"),
        "rafagas_kmh": day.get("gust_kmh"),
        "temp_max_c": day.get("temp_max_c"),
    }
    vec = []
    for name in feature_names:
        val = available.get(name)
        if val is None:  # falta una feature que el modelo necesita: no predecir
            return None
        vec.append(float(val))
    return vec


def score_to_level(score: float) -> str:
    if score >= LEVEL_SEAWEED:
        return "seaweed"
    if score >= LEVEL_MODERATE:
        return "moderate"
    return "clean"


def score_to_confidence(score: float) -> str:
    d = abs(score - 0.5)
    if d >= 0.30:
        return "high"
    if d >= 0.15:
        return "medium"
    return "low"


def sargazo_score(model, clases: int, proba_row) -> float:
    """Convierte las probabilidades del modelo en un score 0..1 de 'cuánto sargazo'."""
    classes = list(model.classes_)
    if clases == 2:
        j = classes.index(1) if 1 in classes else len(classes) - 1
        return float(proba_row[j])
    # 3 clases: severidad ponderada (limpio 0, moderado 0.5, sargazo 1).
    sev = {0: 0.0, 1: 0.5, 2: 1.0}
    return float(sum(proba_row[i] * sev.get(c, 0.0) for i, c in enumerate(classes)))


def main() -> int:
    if not REPORT_PATH.exists():
        return _ok("No existe el reporte; nada que predecir (se omite).")
    if not MODEL_PATH.exists():
        return _ok("No hay modelo entrenado todavía; se omite la predicción.")

    try:
        import joblib  # noqa: F401
    except ImportError:
        return _ok("Falta joblib/scikit-learn; se omite la predicción (no es crítico).")

    report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
    days = report.get("forecastDays") or []
    if not days:
        return _ok("El reporte no trae pronóstico por día; se omite la predicción.")

    try:
        import joblib

        md = joblib.load(MODEL_PATH)
        model = md["model"]
        feature_names = md["features"]
        clases = int(md.get("clases", 2))
    except Exception as exc:  # noqa: BLE001
        return _ok(f"No se pudo cargar el modelo ({exc}); se omite la predicción.")

    pred_days = []
    for day in days:
        vec = features_for_day(day, feature_names)
        if vec is None:
            continue
        try:
            proba = model.predict_proba([vec])[0]
        except Exception as exc:  # noqa: BLE001
            print(f"AVISO: no se pudo predecir {day.get('date')} ({exc}).", file=sys.stderr)
            continue
        score = sargazo_score(model, clases, proba)
        pred_days.append(
            {
                "date": day["date"],
                "level": score_to_level(score),
                "score": round(score, 3),
                "confidence": score_to_confidence(score),
            }
        )

    if not pred_days:
        return _ok("No se pudo predecir ningún día; se omite (reporte intacto).")

    report["prediction"] = {
        "model": f"verificado-{clases}clases",
        "accuracy": md.get("accuracy"),
        "baseline": md.get("baseline"),
        "trainedFrom": md.get("date_min"),
        "trainedTo": md.get("date_max"),
        "nObs": md.get("n_obs"),
        "days": pred_days,
    }
    REPORT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return _ok(f"Predicción agregada para {len(pred_days)} días. ✅")


if __name__ == "__main__":
    raise SystemExit(main())
