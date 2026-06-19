"""
[FASE 2 — BORRADOR] Entrenador del modelo predictivo de sargazo.

⚠️ Este script todavía NO está en producción. Es el esqueleto que usaremos
cuando la tabla histórica tenga datos suficientes (idealmente 2-3 meses, ~60+
días). Antes de eso, un modelo no tiene de qué aprender y daría resultados sin
valor; por eso el script se niega a entrenar con pocos datos.

Qué hace:
  1. Carga el histórico (Supabase si está configurado; si no, el CSV).
  2. Ingeniería de características: viento (onshore/velocidad), estacionalidad
     (mes / día del año con seno-coseno) y lags (estado de días anteriores).
  3. Define el objetivo: el estado de MAÑANA (worst_status desplazado).
  4. Entrena un RandomForest con validación respetando el orden temporal.
  5. Reporta exactitud vs. una línea base e imprime importancia de variables.
  6. Guarda el modelo entrenado (sargazo_model.joblib).

Uso (cuando haya datos):
  pip install -r scripts/sargazo/requirements-ml.txt
  python scripts/sargazo/train_model.py

Dependencias: ver requirements-ml.txt (pandas, scikit-learn, joblib).
"""

from __future__ import annotations

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

# Mínimo de filas para intentar entrenar algo medianamente serio.
MIN_ROWS = 60

HISTORY_CSV = Path(__file__).resolve().parent / "sargazo-history.csv"
MODEL_PATH = Path(__file__).resolve().parent / "sargazo_model.joblib"

STATUS_ORDER = {"clean": 0, "moderate": 1, "seaweed": 2}
ONSHORE_DIRS = {"NE", "E", "SE", "S"}

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
SUPABASE_TABLE = os.environ.get("SUPABASE_TABLE", "sargazo_history")


def load_dataframe():
    import pandas as pd

    if SUPABASE_URL and SUPABASE_KEY:
        print("Cargando histórico desde Supabase...")
        params = {"select": "*", "order": "date.asc"}
        url = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(
            url,
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
            },
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
        df = pd.DataFrame(rows)
    else:
        print(f"Cargando histórico desde {HISTORY_CSV}...")
        df = pd.read_csv(HISTORY_CSV)

    df["date"] = pd.to_datetime(df["date"])
    return df.sort_values("date").reset_index(drop=True)


def build_features(df):
    import numpy as np
    import pandas as pd

    df = df.copy()

    # Estacionalidad: el sargazo es fuertemente estacional (pico mar-ago).
    doy = df["date"].dt.dayofyear
    df["season_sin"] = np.sin(2 * np.pi * doy / 365.25)
    df["season_cos"] = np.cos(2 * np.pi * doy / 365.25)
    df["month"] = df["date"].dt.month

    # Viento.
    df["wind_onshore"] = df["wind_dir_cardinal"].isin(ONSHORE_DIRS).astype(int)
    df["wind_speed_kmh"] = pd.to_numeric(df["wind_speed_kmh"], errors="coerce")
    df["wind_gust_kmh"] = pd.to_numeric(df["wind_gust_kmh"], errors="coerce")
    if "hurricane_active" in df.columns:
        df["hurricane_active"] = df["hurricane_active"].astype(str).str.lower().isin(
            ["true", "1", "t"]
        ).astype(int)
    else:
        df["hurricane_active"] = 0

    # Objetivo numérico de HOY.
    df["status_today"] = df["worst_status"].map(STATUS_ORDER)

    # Lags: el estado y el viento de días previos influyen en el de mañana.
    for lag in (1, 2, 3):
        df[f"status_lag{lag}"] = df["status_today"].shift(lag)
        df[f"onshore_lag{lag}"] = df["wind_onshore"].shift(lag)

    # Objetivo: el estado de MAÑANA (lo que queremos predecir).
    df["target"] = df["status_today"].shift(-1)

    feature_cols = [
        "season_sin",
        "season_cos",
        "month",
        "wind_onshore",
        "wind_speed_kmh",
        "wind_gust_kmh",
        "hurricane_active",
        "status_today",
        "status_lag1",
        "status_lag2",
        "status_lag3",
        "onshore_lag1",
        "onshore_lag2",
        "onshore_lag3",
    ]
    df = df.dropna(subset=feature_cols + ["target"])
    return df, feature_cols


def main() -> int:
    try:
        import joblib
        import numpy as np  # noqa: F401
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import accuracy_score, classification_report
        from sklearn.model_selection import TimeSeriesSplit
    except ImportError:
        print(
            "Faltan dependencias de ML. Instala:\n"
            "  pip install -r scripts/sargazo/requirements-ml.txt",
            file=sys.stderr,
        )
        return 1

    df = load_dataframe()
    if len(df) < MIN_ROWS:
        print(
            f"Solo hay {len(df)} filas; se necesitan al menos {MIN_ROWS} para "
            f"entrenar algo confiable. Sigue acumulando datos (1/día). 🌊"
        )
        return 0

    data, feature_cols = build_features(df)
    if len(data) < MIN_ROWS:
        print(f"Tras limpiar lags quedan {len(data)} filas; aún insuficientes.")
        return 0

    X = data[feature_cols].values
    y = data["target"].astype(int).values

    # Validación temporal (sin barajar: respeta el orden de los días).
    tscv = TimeSeriesSplit(n_splits=4)
    accs = []
    for train_idx, test_idx in tscv.split(X):
        model = RandomForestClassifier(n_estimators=300, random_state=42, class_weight="balanced")
        model.fit(X[train_idx], y[train_idx])
        accs.append(accuracy_score(y[test_idx], model.predict(X[test_idx])))

    # Línea base: predecir siempre "lo mismo que hoy" (persistencia).
    persistence = accuracy_score(y[1:], data["status_today"].astype(int).values[1:])

    print(f"\nExactitud CV (media): {sum(accs) / len(accs):.1%}")
    print(f"Línea base (persistencia): {persistence:.1%}")
    print("(El modelo solo aporta si supera claramente a la persistencia.)\n")

    # Modelo final entrenado con todo.
    final = RandomForestClassifier(n_estimators=300, random_state=42, class_weight="balanced")
    final.fit(X, y)
    print("Importancia de variables:")
    for name, imp in sorted(
        zip(feature_cols, final.feature_importances_), key=lambda t: -t[1]
    ):
        print(f"  {name:16s} {imp:.3f}")

    print("\n" + classification_report(y, final.predict(X), zero_division=0))

    joblib.dump({"model": final, "features": feature_cols}, MODEL_PATH)
    print(f"Modelo guardado en {MODEL_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
