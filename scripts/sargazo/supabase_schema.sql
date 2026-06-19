-- Esquema de la tabla histórica de sargazo para RivieraMayaPass.
-- Ejecútalo una sola vez en Supabase: Dashboard -> SQL Editor -> pega esto -> Run.

create table if not exists public.sargazo_history (
  date              date primary key,           -- 1 fila por día (clave para upsert)
  captured_at       timestamptz not null default now(),
  source            text,                        -- "ai" | "seed"
  wind_dir_cardinal text,                        -- N, NE, E, SE, S, SO, O, NO
  wind_dir_deg      double precision,
  wind_speed_kmh    double precision,
  wind_gust_kmh     double precision,
  worst_status      text,                        -- peor zona del día: clean|moderate|seaweed|unknown
  hurricane_active  boolean,                     -- tormenta/huracán relevante activo
  confidence        text,                        -- high | medium | low
  overridden        boolean,                     -- true si hubo corrección manual
  zones             jsonb,                       -- estado por zona (Playa del Carmen)
  region            jsonb,                       -- estado en puntos de referencia regionales
  sources           jsonb,                       -- fuentes usadas (grounding)
  summary_es        text,
  summary_en        text,
  recommendation_es text,                        -- recomendación práctica (playa/alternativa)
  recommendation_en text,
  forecast_es       text,                        -- tendencia próximos días
  forecast_en       text
);

-- Si la tabla ya existía (versión previa), estas columnas la actualizan.
-- Es seguro re-ejecutar todo el archivo: nada se borra.
alter table public.sargazo_history add column if not exists hurricane_active  boolean;
alter table public.sargazo_history add column if not exists confidence        text;
alter table public.sargazo_history add column if not exists overridden        boolean;
alter table public.sargazo_history add column if not exists sources           jsonb;
alter table public.sargazo_history add column if not exists region            jsonb;
alter table public.sargazo_history add column if not exists recommendation_es text;
alter table public.sargazo_history add column if not exists recommendation_en text;
alter table public.sargazo_history add column if not exists forecast_es       text;
alter table public.sargazo_history add column if not exists forecast_en       text;

-- Seguridad: dejamos la tabla privada (RLS activado, sin políticas públicas).
-- El bot escribe con la service_role key (que ignora RLS), así que NO se
-- necesita ninguna política para que funcione el upsert del script.
-- Si en el futuro quieres mostrar el histórico en la web (lectura pública),
-- crea entonces una policy de SELECT para el rol anon.
alter table public.sargazo_history enable row level security;

-- Índices útiles para consultas/ML más adelante.
create index if not exists sargazo_history_worst_idx on public.sargazo_history (worst_status);
create index if not exists sargazo_history_wind_idx  on public.sargazo_history (wind_dir_cardinal);
