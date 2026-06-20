-- ============================================================================
-- RivieraMayaPass · Tabla `properties` + Row Level Security
-- Correr este script en Supabase → SQL Editor → New query → Run.
-- ============================================================================

-- 1. Tabla -------------------------------------------------------------------
create table if not exists public.properties (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  zone              text default '',
  description       text default '',
  included          text[] default '{}',          -- lista: "Acceso a playa", "Alberca", ...
  price_mxn         integer not null default 0,
  image_url         text,
  is_active         boolean not null default true,
  beach_clean_badge boolean not null default false,
  is_featured       boolean not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists properties_active_idx on public.properties (is_active);

-- 2. Row Level Security ------------------------------------------------------
alter table public.properties enable row level security;

-- Lectura pública: SOLO propiedades activas (la usa la anon key del sitio).
drop policy if exists "public can read active properties" on public.properties;
create policy "public can read active properties"
  on public.properties
  for select
  using (is_active = true);

-- NOTA: No se crean policies de INSERT/UPDATE/DELETE para anon.
-- Las escrituras del panel /admin usan la SERVICE_ROLE key, que se ejecuta
-- solo del lado servidor y BYPASSEA RLS. Un visitante con la anon key no puede
-- escribir ni leer propiedades inactivas.

-- 3. (Opcional) Semilla de ejemplo -------------------------------------------
-- insert into public.properties (slug, name, zone, description, included, price_mxn, image_url, is_active, beach_clean_badge, is_featured)
-- values (
--   'mi-beach-club', 'Mi Beach Club', 'Zona Norte',
--   'Descripción del day pass...',
--   array['Acceso a playa','Alberca','Toallas','WiFi'],
--   890, 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa', true, true, true
-- );
