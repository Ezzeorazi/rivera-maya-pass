"""
train_afai_model.py — RivieraMayaPass (Fase 2: PRIMER modelo real)
==================================================================
Entrena el primer modelo predictivo de sargazo usando AÑOS de datos históricos,
sin esperar a que el bot acumule etiquetas propias.

Idea central:
  - El histórico de CLIMA (historico_clima.csv) son las "preguntas": viento,
    temperatura y estacionalidad por (fecha, zona), desde 2021.
  - El histórico de AFAI satelital (afai_historico.csv) es la "respuesta": cuánto
    sargazo viene flotando frente a cada zona (índice satelital regional).

  Se unen por (fecha, zona) y se entrena un modelo que, dado el clima/estación y
  el AFAI reciente, PREDICE el AFAI de dentro de HORIZON días (por defecto 7).
  Es decir: anticipa el arribo regional de sargazo una semana antes.

Por qué AFAI como objetivo (y no el estado playa-por-playa):
  No existe histórico estructurado de "playa X estuvo limpia/con sargazo" años
  atrás. El AFAI sí tiene años de historia y es la mejor señal regional. Cuando
  el bot acumule meses de etiquetas verificadas (semáforo oficial), se podrá
  calibrar de AFAI → estado playa. Mientras tanto, AFAI es el objetivo honesto.

Qué produce:
  sargazo_afai_model.joblib  — el modelo entrenado (+ metadatos de features).
  reporte_modelo.md          — reporte legible: qué tan bien predice y por qué.

Cómo correrlo:
  pip install -r scripts/sargazo/requirements-ml.txt
  python scripts/sargazo/train_afai_model.py
  (o desde GitHub Actions: workflow "Entrenar modelo (Fase 2)")

Dependencias: pandas, scikit-learn, joblib (ver requirements-ml.txt).
Necesita historico_clima.csv y afai_historico.csv en esta misma carpeta.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CLIMA_CSV = HERE / "historico_clima.csv"
AFAI_CSV = HERE / "afai_historico.csv"
MODEL_PATH = HERE / "sargazo_afai_model.joblib"
REPORT_PATH = HERE / "reporte_modelo.md"

# Días hacia adelante que queremos anticipar (el AFAI "de la próxima semana").
HORIZON = int(os.environ.get("HORIZON_DIAS", "7"))

# Mínimo de filas tras unir y limpiar para entrenar algo medianamente serio.
MIN_ROWS = 200

# Umbrales para traducir AFAI → semáforo (orientativos, se calibran con el bot).
# AFAI suele ser muy chico (~1e-4..1e-3); usamos cuantiles, no valores fijos.
SEMAFORO = [
    (0.33, "limpio (verde)"),
    (0.66, "moderado (amarillo)"),
    (1.01, "con sargazo (rojo)"),
]


def load_and_join():
    import pandas as pd

    if not CLIMA_CSV.exists():
        print(f"ERROR: falta {CLIMA_CSV.name}. Corré primero el histórico de clima.", file=sys.stderr)
        return None
    if not AFAI_CSV.exists():
        print(f"ERROR: falta {AFAI_CSV.name}. Corré primero el AFAI satelital.", file=sys.stderr)
        return None

    clima = pd.read_csv(CLIMA_CSV)
    afai = pd.read_csv(AFAI_CSV)

    clima["fecha"] = pd.to_datetime(clima["fecha"])
    afai["fecha"] = pd.to_datetime(afai["fecha"])
    afai["afai_7d"] = pd.to_numeric(afai["afai_7d"], errors="coerce")

    # AFAI es un compuesto de 7 días y tiene huecos por nubes: lo llevamos a
    # diario por zona y rellenamos hacia adelante hasta 7 días (vida útil del dato).
    afai = afai.sort_values(["zona", "fecha"])
    afai_daily = []
    for zona, g in afai.groupby("zona"):
        g = g.set_index("fecha").asfreq("D")
        g["afai_7d"] = g["afai_7d"].ffill(limit=7)
        g["zona"] = zona
        afai_daily.append(g.reset_index())
    afai = pd.concat(afai_daily, ignore_index=True)

    df = clima.merge(afai[["fecha", "zona", "afai_7d"]], on=["fecha", "zona"], how="inner")
    df = df.sort_values(["zona", "fecha"]).reset_index(drop=True)
    return df


def build_features(df):
    import numpy as np
    import pandas as pd

    df = df.copy()

    # Numéricos del clima.
    for col in ("viento_kmh", "rafagas_kmh", "temp_max_c", "temp_min_c", "afai_7d"):
        df[col] = pd.to_numeric(df.get(col), errors="coerce")
    df["onshore"] = pd.to_numeric(df.get("onshore"), errors="coerce").fillna(0).astype(int)

    # Estacionalidad ya viene (estacion_sin/cos); si no, la recalculamos.
    if "estacion_sin" not in df.columns:
        doy = df["fecha"].dt.dayofyear
        df["estacion_sin"] = np.sin(2 * np.pi * doy / 365.25)
        df["estacion_cos"] = np.cos(2 * np.pi * doy / 365.25)

    # Lags y objetivo se calculan POR ZONA (no mezclar series de zonas distintas).
    pieces = []
    for _, g in df.groupby("zona", sort=False):
        g = g.sort_values("fecha").copy()
        # AFAI reciente: el dato de hoy y de semanas previas (fuerte autocorrelación).
        g["afai_hoy"] = g["afai_7d"]
        g["afai_lag7"] = g["afai_7d"].shift(7)
        g["afai_lag14"] = g["afai_7d"].shift(14)
        # Tendencia reciente del AFAI (subiendo o bajando).
        g["afai_tendencia"] = g["afai_7d"] - g["afai_7d"].shift(7)
        # Viento onshore acumulado de la última semana (empuja sargazo a la costa).
        g["onshore_7d"] = g["onshore"].rolling(7, min_periods=1).mean()
        # OBJETIVO: el AFAI dentro de HORIZON días.
        g["target"] = g["afai_7d"].shift(-HORIZON)
        pieces.append(g)
    df = pd.concat(pieces, ignore_index=True)

    feature_cols = [
        "estacion_sin",
        "estacion_cos",
        "mes",
        "onshore",
        "onshore_7d",
        "viento_kmh",
        "rafagas_kmh",
        "temp_max_c",
        "afai_hoy",
        "afai_lag7",
        "afai_lag14",
        "afai_tendencia",
    ]
    feature_cols = [c for c in feature_cols if c in df.columns]
    df = df.dropna(subset=feature_cols + ["target"])
    return df, feature_cols


def write_report(lines):
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nReporte guardado en {REPORT_PATH}")


def main() -> int:
    try:
        import joblib
        import numpy as np
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.metrics import mean_absolute_error, r2_score
        from sklearn.model_selection import TimeSeriesSplit
    except ImportError:
        print(
            "Faltan dependencias de ML. Instalá:\n"
            "  pip install -r scripts/sargazo/requirements-ml.txt",
            file=sys.stderr,
        )
        return 1

    df = load_and_join()
    if df is None:
        return 1

    report = ["# Reporte del modelo de sargazo (Fase 2)", ""]
    report.append(f"- Filas tras unir clima + AFAI: **{len(df):,}**")
    report.append(f"- Zonas: {df['zona'].nunique()} · rango {df['fecha'].min().date()} → {df['fecha'].max().date()}")
    report.append(f"- Objetivo: predecir el AFAI dentro de **{HORIZON} días**.")
    report.append("")

    data, feature_cols = build_features(df)
    print(f"Filas entrenables tras features/lags: {len(data):,}")
    report.append(f"- Filas entrenables (con lags completos): **{len(data):,}**")

    if len(data) < MIN_ROWS:
        msg = (
            f"Solo hay {len(data)} filas entrenables; se necesitan ~{MIN_ROWS}. "
            "Ampliá el rango de fechas del histórico (clima y AFAI) y reintentá."
        )
        print(msg)
        report += ["", f"> ⚠️ {msg}"]
        write_report(report)
        return 0

    X = data[feature_cols].values
    y = data["target"].values

    # Validación temporal: respeta el orden de los días (no hace trampa con el futuro).
    tscv = TimeSeriesSplit(n_splits=5)
    maes, r2s, base_maes = [], [], []
    for tr, te in tscv.split(X):
        model = RandomForestRegressor(
            n_estimators=400, random_state=42, n_jobs=-1, min_samples_leaf=3
        )
        model.fit(X[tr], y[tr])
        pred = model.predict(X[te])
        maes.append(mean_absolute_error(y[te], pred))
        r2s.append(r2_score(y[te], pred))
        # Línea base = persistencia: "el AFAI de dentro de N días ≈ el de hoy".
        base = data["afai_hoy"].values[te]
        base_maes.append(mean_absolute_error(y[te], base))

    mae = float(np.mean(maes))
    base_mae = float(np.mean(base_maes))
    r2 = float(np.mean(r2s))
    mejora = (1 - mae / base_mae) * 100 if base_mae else 0.0

    print(f"\nMAE modelo:      {mae:.6f}")
    print(f"MAE persistencia: {base_mae:.6f}")
    print(f"R² (CV media):    {r2:.3f}")
    print(f"Mejora vs base:   {mejora:+.1f}%")

    report += [
        "",
        "## Qué tan bien predice",
        "",
        f"- **Error del modelo (MAE):** {mae:.6f}",
        f"- **Error de la línea base** (persistencia: \"igual que hoy\"): {base_mae:.6f}",
        f"- **R² (validación temporal):** {r2:.3f}",
        f"- **Mejora del modelo sobre la línea base:** {mejora:+.1f}%",
        "",
        "> El modelo solo vale la pena si su error es **menor** que el de la "
        "línea base. Un R² cercano a 1 es perfecto; cercano a 0 no aporta.",
    ]

    # Modelo final con todos los datos.
    final = RandomForestRegressor(
        n_estimators=400, random_state=42, n_jobs=-1, min_samples_leaf=3
    )
    final.fit(X, y)

    report += ["", "## Qué variables pesan más", ""]
    print("\nImportancia de variables:")
    for name, imp in sorted(
        zip(feature_cols, final.feature_importances_), key=lambda t: -t[1]
    ):
        print(f"  {name:16s} {imp:.3f}")
        report.append(f"- `{name}` — {imp:.1%}")

    joblib.dump(
        {"model": final, "features": feature_cols, "horizon": HORIZON},
        MODEL_PATH,
    )
    print(f"\nModelo guardado en {MODEL_PATH}")

    report += [
        "",
        "## Interpretación rápida",
        "",
        "- Si `afai_hoy` / `afai_lag7` dominan: el sargazo es muy **inercial** "
        "(lo que hay hoy predice lo de la semana que viene). Esperable.",
        "- Si `estacion_*` / `mes` pesan: el modelo capta el **patrón estacional** "
        "(pico marzo-agosto, baja en otoño/invierno).",
        "- Si `onshore_7d` / `viento` pesan: el **viento** explica cuánto llega a la costa.",
        "",
        "_Modelo y rango de datos generados automáticamente. Es un primer test; "
        "se reentrenará al ampliar datos y al sumar las etiquetas verificadas del bot._",
    ]
    write_report(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
