# 🌊 Bot de sargazo automático

Genera cada día un reporte del estado del sargazo en Playa del Carmen usando
**Gemini + Google Search** y lo publica en el sitio automáticamente.

## Cómo funciona

```
GitHub Actions (cron diario 10:00 hora QR)
        │
        ▼
scripts/sargazo/update_sargazo.py
   · Gemini busca en internet el estado del sargazo de hoy
   · Redacta estado por zona + resumen en ES/EN
        │
        ▼
src/data/sargazo-report.json   ← se hace commit automático
        │
        ▼
Vercel detecta el push y redepliega → el componente <BeachStatus /> se actualiza
```

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

| Variable         | Por defecto          | Descripción                                  |
| ---------------- | -------------------- | -------------------------------------------- |
| `GEMINI_API_KEY` | —                    | **Obligatoria.** API key de Google AI Studio |
| `GEMINI_MODEL`   | `gemini-2.5-flash`   | Modelo de Gemini a usar                      |
| `SARGAZO_ZONES`  | 5 zonas de PDC       | Zonas separadas por coma                     |

## Notas

- El archivo `src/data/sargazo-report.json` incluido es una **semilla** para que
  el sitio compile antes del primer reporte real. El bot lo sobrescribe.
- Si Gemini no devuelve un JSON válido, el script falla **sin** sobrescribir el
  archivo, así nunca se publica un reporte corrupto.
- Costo: el plan gratuito de Gemini suele cubrir 1 ejecución diaria sin costo.
