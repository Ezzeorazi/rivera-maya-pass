# 🌊 Bot de sargazo automático — RivieraMayaPass

Sistema que **cada día** publica el estado del sargazo en Playa del Carmen y la
Riviera Maya, enfocado en ayudar al visitante a decidir **a dónde ir hoy**.
Combina datos reales (viento, pronóstico, alertas de tormenta) con IA que busca
en internet, y alimenta el componente `<BeachStatus />` del sitio Next.js.

Costo: prácticamente **$0** (GitHub Actions + Open-Meteo + NOAA gratis; Gemini en
plan gratuito suele cubrir 1 ejecución diaria).

---

## 1. Cómo funciona (arquitectura)

```
   ⏰ GitHub Actions — cron diario 10:00 hora Quintana Roo
        │
        ▼
   scripts/sargazo/update_sargazo.py  (el "cerebro")
   ├─ 🌬️  Open-Meteo  → viento de hoy + pronóstico 3 días (sin API key)
   ├─ 🌀  NOAA NHC     → tormentas/huracanes activos en el Caribe (sin API key)
   ├─ 🧭  overrides.json → correcciones manuales (opcional)
   └─ 🧠  Gemini + Google Search → busca el sargazo y CRUZA todos esos datos
        │
        │   produce un reporte estructurado (estado por zona + región +
        │   resumen + recomendación + pronóstico + confianza + fuentes)
        ▼
   ├─► src/data/sargazo-report.json   → lo muestra la WEB (estático, rápido)
   ├─► scripts/sargazo/sargazo-history.csv → 1 fila/día (dataset para ML)
   └─► Supabase (opcional)            → mismo dato, consultable
        │
        ▼
   git commit + push  →  Vercel redepliega  →  🌐 sitio actualizado
```

No hay servidor propio ni base de datos en el camino crítico: el "estado" del
sitio vive en un JSON versionado en el repo, y Vercel redepliega solo con cada push.

---

## 2. Qué contiene el reporte (`sargazo-report.json`)

| Campo            | Qué es |
| ---------------- | ------ |
| `updatedAt`      | Fecha/hora ISO de generación (UTC) |
| `source`         | `ai`, `ai+manual` (corregido a mano) o `seed` |
| `confidence`     | `high` / `medium` / `low` — qué tan sólido es el dato |
| `zones`          | Estado por zona de **Playa del Carmen** |
| `regionZones`    | Estado en puntos de referencia regionales (ver §5) |
| `summary`        | Resumen 2-3 frases (ES/EN) |
| `recommendation` | Consejo práctico: dónde ir / plan alternativo (ES/EN) |
| `forecast`       | Tendencia próximos 2-3 días (ES/EN) |
| `forecastDays`   | Pronóstico de viento por día (dir, velocidad, onshore) |
| `hurricaneAlert` | Aviso si hay tormenta del Atlántico < 1500 km |
| `wind`           | Viento medido hoy |
| `sources`        | Páginas que Gemini consultó (grounding) |
| `overrideNote`   | Nota si hubo corrección manual |

**Estados de zona:** `clean` (limpia) · `moderate` (moderado) · `seaweed`
(abundante) · `unknown` (sin dato — preferimos esto a adivinar).

---

## 3. Fuentes de datos

- **🌬️ Viento, temperatura + pronóstico — [Open-Meteo](https://open-meteo.com/)**:
  gratis, sin API key. Da el viento y la **temperatura** de hoy, más el
  pronóstico a 3 días (viento + temp máx/mín). Clave porque el sargazo flota en
  el Caribe y **el viento decide a qué playa llega** (E/SE/S/NE lo empuja a la
  costa; O/NO/N lo aleja). La temperatura **no necesita otra API**: viene en la
  misma llamada.
- **🌀 Tormentas — [NOAA NHC](https://www.nhc.noaa.gov/CurrentStorms.json)**:
  gratis. Filtramos a la cuenca del Atlántico y a < 1500 km de Playa del Carmen.
- **🧠 Estado del sargazo — Gemini con Google Search**: el modelo busca en
  fuentes locales (Red de Monitoreo de QR, noticias) y lo cruza con el viento.

---

## 4. Confiabilidad (anti-riesgo de marca)

El bot puede equivocarse; estas defensas reducen el riesgo de "quemar" la marca:

- **Honestidad por zona:** si no hay dato concreto de una playa → `unknown`, no
  se inventa. El prompt prohíbe pintar todas las zonas iguales sin evidencia.
- **Confianza calibrada:** `high` SOLO con dato playa-por-playa (p. ej. el
  semáforo oficial); con panorama general es `medium`; con pura tendencia + viento, `low`.
- **Fuentes visibles:** se muestran las páginas consultadas → genera confianza.
- **Disclaimer** en la web: "verifica siempre en el lugar".
- **`overrides.json` (tu interruptor manual):** ver §6.

---

## 5. "¿Dónde está limpio hoy?" (zonas regionales)

Además de Playa del Carmen, el bot clasifica el sargazo en puntos de referencia
de la región (`REGION_ZONES`): **Holbox, Isla Mujeres, Puerto Morelos, Cancún,
Tulum**. Cuando PDC está afectada, la web puede decir **a dónde SÍ ir** — esas
zonas suelen escapar al cinturón de sargazo por su orientación norte o
protección de arrecife. La UI las ordena con las limpias primero.

---

## 6. `overrides.json` — correcciones manuales

Editá `scripts/sargazo/overrides.json` y hacé push (o editalo desde GitHub web):

```jsonc
{
  "paused": false,                 // true = NO publica hoy (mantiene el anterior)
  "zones": { "Mamitas": "clean" }, // fuerza el estado real de una zona
  "note": { "es": "Corregido a mano", "en": "Manually corrected" }
}
```

- Si la IA se equivoca feo → `"paused": true` congela el último reporte bueno.
- Para corregir una playa → agregала en `zones` (`clean`|`moderate`|`seaweed`|`unknown`).
- Con corrección, `source` pasa a `ai+manual` y se muestra tu nota en la web.

---

## 7. Puesta en marcha (una sola vez)

1. **Subir el proyecto a GitHub** (ya hecho: `github.com/Ezzeorazi/rivera-maya-pass`).
2. **API key de Gemini** (gratis): https://aistudio.google.com/app/apikey
3. **Secret en GitHub** (`Settings → Secrets and variables → Actions → New secret`):
   - `GEMINI_API_KEY` = tu API key.
4. **(Opcional) Supabase** — ver §8.
5. **(Opcional) Desplegar en Vercel** — https://vercel.com/new → importar el repo
   → Deploy. No necesita variables de entorno. Cada push redepliega solo.
6. **Probar:** pestaña `Actions` → "Reporte de sargazo diario" → `Run workflow`.

A partir de ahí corre solo todos los días a las 10:00 hora de Quintana Roo.

### Probar en local

```bash
pip install -r scripts/sargazo/requirements.txt
export GEMINI_API_KEY="tu-api-key"     # PowerShell: $env:GEMINI_API_KEY="..."
python scripts/sargazo/update_sargazo.py
```

### Variables de entorno

| Variable         | Por defecto        | Descripción |
| ---------------- | ------------------ | ----------- |
| `GEMINI_API_KEY` | —                  | **Obligatoria.** API key de Google AI Studio |
| `GEMINI_MODEL`   | `gemini-2.5-flash` | Modelo de Gemini |
| `GEMINI_FALLBACK_MODEL` | `gemini-2.0-flash` | Modelo de respaldo si el principal está saturado |
| `SARGAZO_ZONES`  | 5 zonas de PDC     | Zonas separadas por coma |
| `SUPABASE_URL`   | —                  | (Opcional) URL del proyecto Supabase |
| `SUPABASE_KEY`   | —                  | (Opcional) service_role key |
| `SUPABASE_TABLE` | `sargazo_history`  | (Opcional) nombre de la tabla |

---

## 8. Base de datos Supabase (opcional)

El histórico se guarda **siempre** en `sargazo-history.csv`. Si además configurás
Supabase, cada día se hace **upsert** de la fila en una tabla Postgres
consultable (dataset para el modelo de la Fase 2).

> La **web** sigue leyendo el JSON estático; Supabase es solo el **almacén de
> datos histórico**, no sirve la web.

1. Crear proyecto gratis en https://supabase.com
2. `SQL Editor` → ejecutar `scripts/sargazo/supabase_schema.sql` (es idempotente:
   trae nuevas columnas con `ADD COLUMN IF NOT EXISTS`, seguro re-correrlo).
3. `Project Settings → API`: copiar **Project URL** y la **`service_role`** key.
4. En GitHub, agregar secrets `SUPABASE_URL` y `SUPABASE_KEY`.

> ⚠️ La `service_role` key omite RLS: solo en GitHub Secrets, **nunca** en el frontend.

---

## 9. Estructura de archivos

```
scripts/sargazo/
├── update_sargazo.py      # el bot diario
├── requirements.txt       # deps del bot (google-genai, tzdata)
├── overrides.json         # correcciones manuales
├── supabase_schema.sql    # esquema de la tabla histórica
├── sargazo-history.csv    # dataset acumulado (1 fila/día)
├── train_model.py         # [Fase 2 — borrador] entrenador del modelo ML
├── requirements-ml.txt    # deps SOLO de la Fase 2
└── README.md              # este archivo
.github/workflows/sargazo.yml   # el cron diario
src/data/sargazo-report.json    # salida que consume la web
src/lib/sargazo.ts              # tipos + loader
src/components/BeachStatus.tsx  # UI
```

---

## 10. 🔮 Próximamente (roadmap)

### Fase 2 — Modelo predictivo (ML)

Hoy el bot hace un **nowcast** (estado de hoy) más una previsión **heurística**
por viento. La Fase 2 agrega una **predicción aprendida** a 48-72h.

- **Cuándo:** necesita datos. `train_model.py` se niega a entrenar con menos de
  ~60 días de histórico. Con ~2-3 meses empieza a ser útil; con una temporada
  completa (pico mar-ago) captura la estacionalidad.
- **Cómo:** lee de Supabase/CSV y arma características — viento (onshore/velocidad),
  estacionalidad (seno-coseno del día del año) y *lags* (estado de días previos).
  Entrena un RandomForest con validación temporal y lo compara contra una **línea
  base de persistencia** (predecir que mañana será como hoy). El modelo solo se
  adopta si **supera** esa base.
- **Ejecutar (cuando haya datos):**
  ```bash
  pip install -r scripts/sargazo/requirements-ml.txt
  python scripts/sargazo/train_model.py
  ```
- **Después:** se programaría un reentrenamiento mensual para que mejore con el
  tiempo, y la predicción a varios días de verdad llegaría sumando datos
  **satelitales** (AFAI/Copernicus), que ven las manchas en el Atlántico días
  antes de llegar a la costa.

### Histórico de clima (base de features) — `fetch_historico.py`

Utilidad **separada del bot diario** que baja años de viento + temperatura
(Open-Meteo / ERA5, gratis) para las 10 zonas, con las mismas features
(onshore/offshore, estacionalidad seno/coseno).

> **Por qué está separado:** el histórico te da las *preguntas* (clima,
> estacionalidad) con años de datos, pero **no las etiquetas** ("playa X estuvo
> con sargazo el día Y") — ese dato histórico no existe estructurado. Las
> etiquetas las acumula el bot a diario (Supabase) + tu verificación con el
> semáforo oficial. Los dos se **unen al entrenar** (join por fecha+zona), no se
> mezclan en la misma tabla.
>
> Sirve para: arrancar con features listas, analizar estacionalidad y hacer
> contenido. NO reemplaza la recolección diaria de etiquetas.

Cómo correrlo: pestaña **Actions → "Histórico de clima (Fase 2)" → Run workflow**.
Deja un **artifact descargable** (CSV + Excel); no toca el repo. La columna
`sargazo_estado` queda vacía a propósito (es la etiqueta a llenar con dato
verificado).

### Visión sobre el mapa oficial (Red de Monitoreo de QR)

El **Mapa Semáforo del Sargazo** de la SEMA/Red de Monitoreo de QR es la fuente
**más precisa** que existe: clasifica ~140 playas, una por una, con colores. Hoy
el bot no lo usa porque vive como **imagen en Facebook**.

**El reto real — horario inconsistente.** El mapa no se publica a una hora fija:
a veces a la mañana, a veces a la tarde. Por eso **no se puede atar a un cron
fijo** ni asumir que "a las 10:00 ya está disponible".

**Diseño propuesto — el mapa como capa de MEJORA, no como disparador:**

1. **Baseline siempre:** el reporte diario por texto (10:00) corre igual, pase lo
   que pase. Si el mapa nunca aparece ese día, igual hay reporte.
2. **Upgrade oportunista:** cuando el mapa del día está disponible, una pasada de
   **visión** (Gemini lee la imagen) extrae el estado playa-por-playa, lo agrega
   a nuestras zonas (PDC + región) y **mejora** el reporte de ese día:
   - reemplaza los estados estimados por los **oficiales**,
   - sube `confidence` a `high`,
   - marca `source` como `official-map`.
3. **Cómo llega la imagen (dos opciones, por la inconsistencia de horario):**
   - **Drop manual (recomendado):** alguien deja la imagen del día en una carpeta
     del repo cuando la ve publicada → la más confiable, no depende de Facebook.
   - **Sondeo:** un workflow que corre varias veces al día y, si detecta un mapa
     nuevo, lo procesa. Más automático pero frágil (Facebook bloquea scraping).

Así, el horario caótico deja de ser un problema: el sitio nunca queda sin dato
(baseline), y cuando llega el mapa, simplemente **sube de calidad** a confianza alta.

---

## 11. Notas

- `src/data/sargazo-report.json` incluye una **semilla** para que el sitio
  compile antes del primer reporte real; el bot lo sobrescribe.
- **JSON robusto:** la IA a veces mete comillas dobles sin escapar dentro de un
  texto (ej. `..."excessive" accumulation...`), lo que rompería el JSON. El bot
  (1) le pide no usar comillas dobles internas, (2) si igual viene roto lo repara
  con `json-repair`, y (3) si ni así se puede, **mantiene el reporte anterior**
  (sale en verde) en vez de publicar algo corrupto o romper el sitio.
- **Resiliencia ante caídas de Gemini:** si el modelo da un error transitorio
  (503 "high demand", 429, 5xx), el bot **reintenta con espera creciente** y, si
  sigue, prueba el **modelo de respaldo**. Si aun así no responde, el workflow
  sale en **verde** sin tocar nada: la web mantiene el reporte del día anterior y
  al día siguiente se reintenta. Así un hipo temporal de Google no rompe el sitio
  ni deja el historial en rojo.
- La fecha del dataset usa **zona horaria de Quintana Roo** (no la del runner UTC),
  así el `date` del CSV/Supabase siempre coincide con la fecha local real.
