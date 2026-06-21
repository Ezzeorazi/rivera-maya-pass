"""
train_verified_model.py — RivieraMayaPass (Fase 2: modelo con DATO VERIFICADO)
==============================================================================
Entrena un modelo que predice el ESTADO REAL de playa (limpio / moderado /
sargazo) usando como etiqueta el SEMÁFORO OFICIAL que cargaste a mano en el
admin (tabla sargazo_history, filas verificadas). Es la "verdad de oro":
mientras el AFAI satelital es una señal regional aproximada, tu semáforo es el
estado real playa-por-playa, que es justo lo que se le muestra al turista.

Cómo arma el dataset (join por fecha + zona):
  clima (viento, temp, estacionalidad)  +  AFAI satelital (señal regional)
  →  features
  tu semáforo verificado                →  etiqueta (clean/moderate/seaweed)

Fuentes de datos (las tres se unen por fecha+zona):
  - Supabase sargazo_history: filas verificadas (source=official-map / overridden).
  - historico_clima.csv  (lo baja fetch_historico.py).
  - afai_historico.csv   (lo baja fetch_afai.py; OPCIONAL: si falta, entrena solo
    con clima).

Salidas:
  sargazo_verificado_model.joblib
  reporte_modelo_verificado.md

Cómo correrlo:
  pip install -r scripts/sargazo/requirements-ml.txt
  SUPABASE_URL=... SUPABASE_KEY=... python scripts/sargazo/train_verified_model.py
  (o desde GitHub Actions: workflow "Entrenar con datos verificados")
"""

from __future__ import annotations

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
CLIMA_CSV = HERE / "historico_clima.csv"
AFAI_CSV = HERE / "afai_historico.csv"
MODEL_PATH = HERE / "sargazo_verificado_model.joblib"
REPORT_PATH = HERE / "reporte_modelo_verificado.md"

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
SUPABASE_TABLE = os.environ.get("SUPABASE_TABLE", "sargazo_history")

STATUS_ORDER = {"clean": 0, "moderate": 1, "seaweed": 2}
STATUS_LABEL = {0: "limpio", 1: "moderado", 2: "sargazo"}

# Cuántas clases predecir: 3 = limpio/moderado/sargazo · 2 = limpio / con sargazo
# (fusiona moderado+sargazo). 2 suele dar más exactitud y es más accionable.
CLASES = 2 if os.environ.get("CLASES", "3").strip() == "2" else 3

# Mínimo de observaciones (fecha×zona) etiquetadas para intentar entrenar.
MIN_ROWS = 80


def fetch_verified_labels():
    """Lee de Supabase las filas verificadas y las explota a (fecha, zona, estado)."""
    if not (SUPABASE_URL and SUPABASE_KEY):
        print("ERROR: faltan SUPABASE_URL / SUPABASE_KEY.", file=sys.stderr)
        return None

    params = {"select": "date,zones,region,source,overridden", "order": "date.asc"}
    url = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(
        url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        rows = json.loads(resp.read().decode("utf-8"))

    out = []
    for r in rows:
        # Solo días verificados a mano (semáforo oficial), no las estimaciones del bot.
        verified = r.get("overridden") is True or r.get("source") == "official-map"
        if not verified:
            continue
        fecha = r.get("date")
        for bucket in ("zones", "region"):
            for z in r.get(bucket) or []:
                estado = z.get("status")
                if estado in STATUS_ORDER:  # ignora "unknown"
                    out.append({"fecha": fecha, "zona": z.get("name"), "estado": estado})
    return out


def load_features():
    """Une clima + AFAI por (fecha, zona) y arma las columnas de entrada."""
    import numpy as np
    import pandas as pd

    if not CLIMA_CSV.exists():
        print(f"ERROR: falta {CLIMA_CSV.name}. Corré el histórico de clima.", file=sys.stderr)
        return None

    clima = pd.read_csv(CLIMA_CSV)
    clima["fecha"] = pd.to_datetime(clima["fecha"])
    for col in ("viento_kmh", "rafagas_kmh", "temp_max_c", "temp_min_c"):
        if col in clima.columns:
            clima[col] = pd.to_numeric(clima[col], errors="coerce")
    clima["onshore"] = pd.to_numeric(clima.get("onshore"), errors="coerce").fillna(0).astype(int)

    if "estacion_sin" not in clima.columns:
        doy = clima["fecha"].dt.dayofyear
        clima["estacion_sin"] = np.sin(2 * np.pi * doy / 365.25)
        clima["estacion_cos"] = np.cos(2 * np.pi * doy / 365.25)

    # AFAI es opcional: si está, lo sumamos como feature (con lags).
    has_afai = AFAI_CSV.exists()
    if has_afai:
        afai = pd.read_csv(AFAI_CSV)
        afai["fecha"] = pd.to_datetime(afai["fecha"])
        afai["afai_7d"] = pd.to_numeric(afai["afai_7d"], errors="coerce")
        daily = []
        for zona, g in afai.sort_values(["zona", "fecha"]).groupby("zona"):
            g = g.set_index("fecha").asfreq("D")
            g["afai_7d"] = g["afai_7d"].ffill(limit=7)
            g["afai_lag7"] = g["afai_7d"].shift(7)
            g["zona"] = zona
            daily.append(g.reset_index())
        afai = pd.concat(daily, ignore_index=True)
        clima = clima.merge(
            afai[["fecha", "zona", "afai_7d", "afai_lag7"]], on=["fecha", "zona"], how="left"
        )

    return clima, has_afai


def write_report(lines):
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nReporte guardado en {REPORT_PATH}")


def main() -> int:
    try:
        import joblib
        import numpy as np
        import pandas as pd
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import accuracy_score, classification_report
        from sklearn.model_selection import StratifiedKFold, cross_val_predict
    except ImportError:
        print(
            "Faltan dependencias de ML. Instalá:\n"
            "  pip install -r scripts/sargazo/requirements-ml.txt",
            file=sys.stderr,
        )
        return 1

    labels = fetch_verified_labels()
    if labels is None:
        return 1
    labels_df = pd.DataFrame(labels)
    print(f"Etiquetas verificadas (fecha×zona): {len(labels_df)}")

    feats = load_features()
    if feats is None:
        return 1
    clima, has_afai = feats

    labels_df["fecha"] = pd.to_datetime(labels_df["fecha"])
    df = labels_df.merge(clima, on=["fecha", "zona"], how="inner")

    modo = "2 clases (limpio / con sargazo)" if CLASES == 2 else "3 clases (limpio / moderado / sargazo)"
    report = ["# Reporte del modelo con dato verificado (Fase 2)", ""]
    report.append(f"- Modalidad: **{modo}**")
    report.append(f"- Etiquetas verificadas cargadas: **{len(labels_df)}**")
    report.append(f"- Tras unir con clima{'+AFAI' if has_afai else ''}: **{len(df)}** observaciones")
    if len(df):
        report.append(
            f"- Rango: {df['fecha'].min().date()} → {df['fecha'].max().date()} · "
            f"{df['zona'].nunique()} zonas"
        )

    # Selección ROBUSTA de features: una columna sin datos (p. ej. el AFAI si no
    # tuvo cobertura en el rango) NO debe borrar todo el dataset. Descartamos las
    # columnas con <50% de datos e imputamos el resto con la mediana.
    candidate = [
        "estacion_sin", "estacion_cos", "mes", "onshore",
        "viento_kmh", "rafagas_kmh", "temp_max_c", "afai_7d", "afai_lag7",
    ]
    feature_cols = []
    dropped = []
    for c in candidate:
        if c not in df.columns:
            continue
        col = pd.to_numeric(df[c], errors="coerce")
        if col.notna().mean() < 0.5:  # casi vacía: no sirve como feature
            dropped.append(c)
            continue
        df[c] = col.fillna(col.median())  # rellena huecos sueltos
        feature_cols.append(c)

    if dropped:
        report.append(f"- Features descartadas por falta de datos: {', '.join(dropped)}")
        print(f"Features descartadas (sin datos): {', '.join(dropped)}")

    df = df.dropna(subset=feature_cols)

    # Objetivo según la modalidad. En 2 clases se fusiona moderado+sargazo en
    # "con sargazo" (lo contrario de "limpio"): más fácil y más accionable.
    if CLASES == 2:
        df["y"] = (df["estado"] != "clean").astype(int)
        df["clase"] = df["y"].map({0: "limpio", 1: "con sargazo"})
        label_names = {0: "limpio", 1: "con sargazo"}
    else:
        df["y"] = df["estado"].map(STATUS_ORDER)
        df["clase"] = df["estado"].map({"clean": "limpio", "moderate": "moderado", "seaweed": "sargazo"})
        label_names = STATUS_LABEL

    if len(df) < MIN_ROWS:
        msg = (
            f"Solo hay {len(df)} observaciones utilizables; se necesitan ~{MIN_ROWS}. "
            "Cargá más días verificados en el admin y reintentá."
        )
        print(msg)
        report += ["", f"> ⚠️ {msg}"]
        write_report(report)
        return 0

    # Distribución de clases (clave para entender el desbalance de temporada).
    dist = df["clase"].value_counts()
    report += ["", "## Distribución de tus etiquetas", ""]
    for clase, n in dist.items():
        report.append(f"- {clase}: {n} ({n / len(df):.0%})")
    n_classes = df["y"].nunique()
    if n_classes < 2:
        report += [
            "",
            "> ⚠️ Todas tus etiquetas son del mismo estado (temporada alta). El "
            "modelo no puede aprender a distinguir todavía: cargá días de otras "
            "épocas (limpios) para que tenga contraste.",
        ]
        write_report(report)
        print("Una sola clase: no se entrena (falta contraste).")
        return 0

    X = df[feature_cols].values
    y = df["y"].astype(int).values

    # Validación cruzada estratificada (mantiene la proporción de clases).
    n_splits = min(5, int(dist.min()))
    n_splits = max(2, n_splits)
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    model = RandomForestClassifier(
        n_estimators=400, random_state=42, n_jobs=-1, class_weight="balanced", min_samples_leaf=2
    )
    pred = cross_val_predict(model, X, y, cv=skf)
    acc = accuracy_score(y, pred)

    # Línea base: predecir siempre la clase mayoritaria.
    base = accuracy_score(y, np.full_like(y, df["y"].mode()[0]))

    print(f"\nExactitud CV: {acc:.1%}")
    print(f"Línea base (clase mayoritaria): {base:.1%}")

    report += [
        "",
        "## Qué tan bien predice el estado real",
        "",
        f"- **Exactitud (validación cruzada):** {acc:.1%}",
        f"- **Línea base** (adivinar siempre la más común): {base:.1%}",
        f"- **Mejora sobre la línea base:** {(acc - base) * 100:+.1f} puntos",
        "",
        "> El modelo aporta si su exactitud supera claramente a la línea base. "
        "Con etiquetas de una sola temporada, la línea base ya es alta (casi "
        "siempre el mismo estado): es esperable y mejora al sumar otras épocas.",
        "",
        "### Detalle por clase",
        "```",
        classification_report(
            y, pred, target_names=[label_names[i] for i in sorted(df["y"].unique())],
            zero_division=0,
        ),
        "```",
    ]

    # Modelo final con todos los datos.
    final = RandomForestClassifier(
        n_estimators=400, random_state=42, n_jobs=-1, class_weight="balanced", min_samples_leaf=2
    )
    final.fit(X, y)

    report += ["", "## Qué variables pesan más", ""]
    print("\nImportancia de variables:")
    for name, imp in sorted(zip(feature_cols, final.feature_importances_), key=lambda t: -t[1]):
        print(f"  {name:14s} {imp:.3f}")
        report.append(f"- `{name}` — {imp:.1%}")

    joblib.dump(
        {
            "model": final,
            "features": feature_cols,
            "clases": CLASES,
            "labels": label_names,
            # Metadatos para mostrar en la web (transparencia) y para el bot.
            "accuracy": round(float(acc), 3),
            "baseline": round(float(base), 3),
            "n_obs": int(len(df)),
            "date_min": str(df["fecha"].min().date()),
            "date_max": str(df["fecha"].max().date()),
        },
        MODEL_PATH,
    )
    print(f"\nModelo guardado en {MODEL_PATH}")

    report += [
        "",
        "_Modelo entrenado con tu semáforo verificado. Reentrenalo a medida que "
        "cargues más días (sobre todo de temporada baja) para que distinga épocas._",
    ]
    write_report(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
