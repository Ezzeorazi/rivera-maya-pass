import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAllPropertiesAdmin, type PropertyRow } from '@/lib/get-properties';
import { upsertProperty, deleteProperty, logout } from './actions';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Admin · Propiedades',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; ok?: string; error?: string }>;
}) {
  if (!(await isAuthenticated())) redirect('/admin/login');

  const { edit, ok, error } = await searchParams;
  const configured = isSupabaseConfigured();
  const properties = configured ? await getAllPropertiesAdmin() : [];
  const editing: PropertyRow | undefined = edit
    ? properties.find((p) => p.id === edit)
    : undefined;

  return (
    <main className="min-h-screen bg-sand">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-ink text-sand">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-semibold">Panel · Propiedades</h1>
            <Link href="/es" className="text-lagoon/70 text-xs hover:text-lagoon">
              ← Ver sitio público
            </Link>
          </div>
          <form action={logout}>
            <button className="text-sm bg-sand/10 hover:bg-sand/20 rounded-lg px-3 py-2 transition-colors">
              Salir
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8 space-y-8">
        {/* Banners */}
        {!configured && (
          <p className="rounded-xl bg-sun-bg text-ink text-sm px-4 py-3">
            Supabase no está configurado. Cargá las variables de entorno
            (<code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,{' '}
            <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>) para
            guardar propiedades. Mientras tanto el sitio público usa los datos de
            ejemplo.
          </p>
        )}
        {ok && (
          <p className="rounded-xl bg-lagoon-bg text-sea-deep text-sm px-4 py-3">
            {ok === 'deleted' ? 'Propiedad eliminada.' : 'Cambios guardados.'}
          </p>
        )}
        {error && (
          <p className="rounded-xl bg-coral-bg text-coral text-sm px-4 py-3">
            Error: {error === 'required' ? 'faltan campos obligatorios.' : error}
          </p>
        )}

        {/* Form alta / edición */}
        <section className="bg-shell rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-ink">
              {editing ? 'Editar propiedad' : 'Nueva propiedad'}
            </h2>
            {editing && (
              <Link href="/admin" className="text-sm text-sea hover:text-sea-deep">
                + Cargar otra
              </Link>
            )}
          </div>

          <form action={upsertProperty} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <Field label="Nombre *" htmlFor="name">
              <input
                id="name"
                name="name"
                required
                defaultValue={editing?.name ?? ''}
                placeholder="Mamita's Beach Club"
                className={inputCls}
              />
            </Field>

            <Field label="Slug (URL) — opcional" htmlFor="slug">
              <input
                id="slug"
                name="slug"
                defaultValue={editing?.slug ?? ''}
                placeholder="se genera del nombre si lo dejás vacío"
                className={inputCls}
              />
            </Field>

            <Field label="Zona" htmlFor="zone">
              <input
                id="zone"
                name="zone"
                defaultValue={editing?.zone ?? ''}
                placeholder="Zona Norte"
                className={inputCls}
              />
            </Field>

            <Field label="Precio (MXN) *" htmlFor="price_mxn">
              <input
                id="price_mxn"
                name="price_mxn"
                type="number"
                min="0"
                required
                defaultValue={editing?.price_mxn ?? ''}
                placeholder="890"
                className={inputCls}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Descripción" htmlFor="description">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editing?.description ?? ''}
                  placeholder="Describe la experiencia del day pass..."
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field
                label="Qué incluye (uno por línea, o separado por comas)"
                htmlFor="included"
              >
                <textarea
                  id="included"
                  name="included"
                  rows={3}
                  defaultValue={(editing?.included ?? []).join('\n')}
                  placeholder={'Acceso a playa\nAlberca infinity\nToallas\nWiFi'}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="URL de la imagen" htmlFor="image_url">
                <input
                  id="image_url"
                  name="image_url"
                  type="url"
                  defaultValue={editing?.image_url ?? ''}
                  placeholder="https://images.unsplash.com/..."
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Toggles */}
            <div className="sm:col-span-2 flex flex-wrap gap-5 pt-1">
              <Toggle
                name="is_active"
                label="Activa (visible en el sitio)"
                defaultChecked={editing ? editing.is_active : true}
              />
              <Toggle
                name="beach_clean_badge"
                label="Badge playa limpia"
                defaultChecked={editing?.beach_clean_badge ?? false}
              />
              <Toggle
                name="is_featured"
                label="Destacada"
                defaultChecked={editing?.is_featured ?? false}
              />
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={!configured}
                className="bg-coral text-white font-body font-bold rounded-xl px-6 py-3 hover:bg-coral/90 transition-colors disabled:opacity-40"
              >
                {editing ? 'Guardar cambios' : 'Crear propiedad'}
              </button>
            </div>
          </form>
        </section>

        {/* Lista */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink mb-4">
            Propiedades cargadas ({properties.length})
          </h2>
          {properties.length === 0 ? (
            <p className="text-ink-soft text-sm bg-shell rounded-2xl border border-line p-6">
              Todavía no hay propiedades en la base. El sitio muestra los 6
              ejemplos por defecto hasta que cargues la primera.
            </p>
          ) : (
            <ul className="space-y-3">
              {properties.map((p) => (
                <li
                  key={p.id}
                  className="bg-shell rounded-xl border border-line p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-ink truncate">
                      {p.name}{' '}
                      {!p.is_active && (
                        <span className="text-xs font-body font-normal text-ink-soft">
                          (inactiva)
                        </span>
                      )}
                      {p.is_featured && (
                        <span className="text-xs font-body text-sun">★</span>
                      )}
                    </p>
                    <p className="text-xs text-ink-soft truncate">
                      {p.zone} · {formatPrice(p.price_mxn)} · /{p.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin?edit=${p.id}`}
                      className="text-sm text-sea hover:text-sea-deep font-medium px-3 py-1.5"
                    >
                      Editar
                    </Link>
                    <form action={deleteProperty}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="text-sm text-coral hover:text-coral/80 font-medium px-3 py-1.5">
                        Borrar
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

const inputCls =
  'w-full rounded-xl border border-line bg-sand/50 px-4 py-2.5 text-ink text-sm outline-none focus:border-sea focus:ring-2 focus:ring-sea/20';

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-line text-sea focus:ring-sea/30"
      />
      {label}
    </label>
  );
}
