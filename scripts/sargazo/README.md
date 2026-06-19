# 🌊 Bot de sargazo automático

Genera cada día un reporte del estado del sargazo en Playa del Carmen usando
**Gemini + Google Search** y lo publica en el sitio automáticamente.

## Cómo funciona

```
GitHub Actions (cron diario 10:00 hora QR)
        │
        ▼
scripts/sargazo/update_sargazo.py
   · Open-Meteo: viento de hoy + pronóstico a 3 días (sin API key)
   · NOAA NHC: tormentas/huracanes activos cerca del Caribe (sin API key)
   · Gemini busca el sargazo y CRUZA viento + pronóstico + tormentas
   · Redacta: estado por zona + resumen + recomendación + tendencia (ES/EN)
        │
        ├─► src/data/sargazo-report.json        ← lo muestra el sitio
        └─► scripts/sargazo/sargazo-history.csv  ← 1 fila/día (dataset para ML futuro)
        │
        ▼
Vercel detecta el push y redepliega → el componente <BeachStatus /> se actualiza
```

### ¿Por qué el viento? (Fase 1)

El sargazo ya flota en el Caribe; **el viento local decide a qué playa llega**.
Viento del **E/SE/S/NE** lo empuja hacia la costa de la Riviera Maya; viento del
**O/NO/N** lo aleja. Por eso le pasamos a Gemini el dato medido como "dato duro"
y además lo **registramos cada día** en `sargazo-history.csv`. Ese historial es
la semilla del modelo predictivo (Fase 2): cuando haya unos meses de datos
(viento → estado real), un clasificador podrá estimar el arribo a 48-72h.

No necesita servidor propio ni base de datos. El "estado" del sitio vive en un
simple archivo JSON versionado en el repo.

## Puesta en marcha (una sola vez)

1. **Subir el proyecto a GitHub** (si aún no está):

   ```bash
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
   git push -u origin main
   ```

2. **Obtener una API key de Gemini** (gratis):
   - Entra a https://aistudio.google.com/app/apikey
   - Crea una API key.

3. **Guardar la key como secret en GitHub**:
   - En tu repo: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`
   - Nombre: `GEMINI_API_KEY`
   - Valor: tu API key.

4. **Probar manualmente**:
   - Pestaña `Actions` → workflow **"Reporte de sargazo diario"** → `Run workflow`.
   - Revisa que haga commit de `src/data/sargazo-report.json`.

5. **Listo.** A partir de ahí corre solo todos los días a las 10:00 (hora de
   Quintana Roo). Vercel redepliega automáticamente con cada commit del bot.

## Probar en local

```bash
pip install -r scripts/sargazo/requirements.txt
export GEMINI_API_KEY="tu-api-key"     # PowerShell: $env:GEMINI_API_KEY="..."
python scripts/sargazo/update_sargazo.py
```

## Configuración opcional (variables de entorno)

| Variable         | Por defecto          | Descripción                                       |
| ---------------- | -------------------- | ------------------------------------------------- |
| `GEMINI_API_KEY` | —                    | **Obligatoria.** API key de Google AI Studio      |
| `GEMINI_MODEL`   | `gemini-2.5-flash`   | Modelo de Gemini a usar                           |
| `SARGAZO_ZONES`  | 5 zonas de PDC       | Zonas separadas por coma                          |
| `SUPABASE_URL`   | —                    | (Opcional) URL del proyecto Supabase              |
| `SUPABASE_KEY`   | —                    | (Opcional) service_role key de Supabase           |
| `SUPABASE_TABLE` | `sargazo_history`    | (Opcional) nombre de la tabla                     |

## Base de datos Supabase (opcional, recomendado)

El histórico se guarda **siempre** en `sargazo-history.csv`. Si además
configuras Supabase, cada día se hace **upsert** de la fila en una tabla
Postgres consultable (ideal como dataset para el modelo de la Fase 2).

> Arquitectura: la **web** sigue leyendo el JSON estático (rápido, sin DB en
> runtime). Supabase es solo el **almacén de datos histórico**, no sirve la web.

> 🔄 **Si ya creaste la tabla antes:** vuelve a ejecutar
> `scripts/sargazo/supabase_schema.sql` en el SQL Editor. Trae columnas nuevas
> (`hurricane_active`, `recommendation_*`, `forecast_*`) con `ADD COLUMN IF NOT
> EXISTS`, así que es seguro re-correrlo: no borra nada.

Pasos (una vez):

1. Crea un proyecto gratis en https://supabase.com
2. `SQL Editor` → pega y ejecuta `scripts/sargazo/supabase_schema.sql`
3. `Project Settings` → `API`: copia el **Project URL** y la **`service_role`**
   key (la secreta, no la `anon`).
4. En GitHub, añade dos secrets más (`Settings → Secrets → Actions`):
   - `SUPABASE_URL` = el Project URL
   - `SUPABASE_KEY` = la service_role key

> ⚠️ La `service_role` key es secreta y omite RLS. Solo va en GitHub Secrets,
> **nunca** en el código del frontend.

## Desplegar la web en Vercel

El sitio **no necesita ninguna variable de entorno** para desplegar (las keys
viven en GitHub Actions, no en la web).

1. Entra a https://vercel.com/new
2. Importa el repo de GitHub.
3. Framework: Next.js (autodetectado) → `Deploy`.
4. Listo: obtienes una URL pública y **cada push redepliega solo**.

## Fase 2 — modelo predictivo (futuro, aún NO en producción)

`train_model.py` es el **borrador** del modelo que predecirá el sargazo a
48-72h. Necesita datos: se niega a entrenar con menos de ~60 días de histórico.

```bash
pip install -r scripts/sargazo/requirements-ml.txt
python scripts/sargazo/train_model.py
```

- Lee de Supabase (o del CSV) y arma características: viento (onshore/velocidad),
  estacionalidad (el sargazo tiene pico mar-ago) y lags de días anteriores.
- Entrena un RandomForest con validación temporal y lo compara contra una línea
  base de "persistencia" (predecir que mañana será como hoy). El modelo solo
  vale si **supera** esa línea base.
- Hasta tener ~2-3 meses de datos, seguimos con la predicción heurística (viento
  + pronóstico) que ya hace el bot. La predicción a varios días de verdad llegará
  con datos satelitales (AFAI/Copernicus) en una fase posterior.

## Confiabilidad y correcciones manuales (anti-riesgo de marca)

El bot puede equivocarse. Estas defensas reducen el riesgo:

- **Honestidad por zona:** si la IA no tiene dato concreto de una playa, la marca
  como `unknown` ("Sin dato") en vez de inventar. El prompt le prohíbe pintar
  todas las zonas iguales sin evidencia.
- **Nivel de confianza:** cada reporte trae `confidence` (high/medium/low), que
  se muestra en la web.
- **Fuentes:** se guardan y muestran las páginas que Gemini consultó.
- **Disclaimer** visible en la web.

### ¿Dónde está limpio hoy? (zonas regionales)

Además de las zonas de Playa del Carmen, el bot clasifica el sargazo en puntos
de referencia de la región (`REGION_ZONES`: Holbox, Isla Mujeres, Puerto Morelos,
Cancún, Tulum). Así, cuando PDC está afectada, la web puede decirle al visitante
**a dónde SÍ ir** — esas zonas suelen escapar al cinturón de sargazo por su
orientación norte o protección de arrecife.

### `overrides.json` — tu interruptor manual

Editá `scripts/sargazo/overrides.json` y hacé push (o editalo desde GitHub web):

```jsonc
{
  "paused": false,                 // true = NO publica hoy (mantiene el anterior)
  "zones": { "Mamitas": "clean" }, // fuerza el estado real de una zona
  "note": { "es": "Corregido a mano", "en": "Manually corrected" }
}
```

- Si la IA se equivoca feo, poné `"paused": true` y se congela el último reporte.
- Para corregir una sola playa, agregала en `zones` con su estado real
  (`clean` | `moderate` | `seaweed` | `unknown`). Las demás quedan como la IA.
- Cuando hay corrección, el `source` pasa a `ai+manual` y se muestra tu nota.

## Notas

- El archivo `src/data/sargazo-report.json` incluido es una **semilla** para que
  el sitio compile antes del primer reporte real. El bot lo sobrescribe.
- Si Gemini no devuelve un JSON válido, el script falla **sin** sobrescribir el
  archivo, así nunca se publica un reporte corrupto.
- Costo: el plan gratuito de Gemini suele cubrir 1 ejecución diaria sin costo.
