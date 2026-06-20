import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  getSargazoHistory,
  getSargazoDay,
  type SargazoHistoryRow,
} from '@/lib/get-sargazo-history';
import AdminHeader from '../AdminHeader';
import { updateSargazoDay } from './actions';

export const metadata: Metadata = {
  title: 'Admin · Bot de sargazo',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;
const DEFAULT_PDC = ['Zona Norte', 'Mamitas', 'Centro', 'Playacar', 'Xcalacoco'];
const DEFAULT_REGION = ['Holbox', 'Isla Mujeres', 'Puerto Morelos', 'Cancún', 'Tulum'];
const STATUS_OPTIONS = ['clean', 'moderate', 'seaweed', 'unknown'];

export default async function AdminSargazoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; edit?: string; ok?: string; error?: string }>;
}) {
  if (!(await isAuthenticated())) redirect('/admin/login');

  const { page: pageRaw, edit, ok, error } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const configured = isSupabaseConfigured();
  const sargazo = configured
    ? await getSargazoHistory(PAGE_SIZE, offset)
    : { rows: [], error: false as boolean, message: undefined, hasMore: false };
  const editing = configured && edit ? await getSargazoDay(edit) : null;

  return (
    <main className="min-h-screen bg-sand">
      <AdminHeader active="sargazo" />

      <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">
        {/* Banners */}
        {ok && (
          <p className="rounded-xl bg-lagoon-bg text-sea-deep text-sm px-4 py-3">
            {ok === 'verified' ? 'Día verificado con el dato real. ✅' : 'Listo.'}
          </p>
        )}
        {error && (
          <p className="rounded-xl bg-coral-bg text-coral text-sm px-4 py-3">
            Error: {error}
          </p>
        )}
        {!configured && (
          <p className="rounded-xl bg-sun-bg text-ink text-sm px-4 py-3">
            Supabase no está configurado. El bot guarda el historial en Supabase;
            cargá las variables de entorno para verlo acá.
          </p>
        )}

        {/* Formulario de edición / verificación */}
        {editing && (
          <EditForm row={editing} />
        )}

        <section className="bg-shell rounded-2xl border border-line p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <h2 className="font-display text-xl font-semibold text-ink">
              🌊 Bot de sargazo
            </h2>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/sargazo/preview"
                className="text-sm bg-coral/10 text-coral hover:bg-coral/20 rounded-lg px-3 py-1.5 transition-colors"
              >
                👁️ Vista previa de alerta
              </Link>
              <Link
                href="/admin/sargazo/doc"
                className="text-sm bg-sea/10 text-sea hover:bg-sea/20 rounded-lg px-3 py-1.5 transition-colors"
              >
                📄 Documentación
              </Link>
            </div>
          </div>
          <p className="text-xs text-ink-soft/70 mb-4">
            Una fila por día. Cuando tengas el dato real (semáforo oficial), usá
            «Editar» para verificarlo y mejorar la calidad del dataset.
          </p>

          {sargazo.error ? (
            <div className="text-sm text-coral space-y-1">
              <p>
                No se pudo leer la tabla{' '}
                <code className="font-mono">sargazo_history</code>. Verificá que
                exista en Supabase (corré el SQL).
              </p>
              {sargazo.message && (
                <p className="font-mono text-xs text-coral/80">{sargazo.message}</p>
              )}
            </div>
          ) : sargazo.rows.length === 0 ? (
            <p className="text-sm text-ink-soft">
              {page > 1
                ? 'No hay más días en esta página.'
                : 'Todavía no hay registros. El bot agrega una fila por día (corre a las 10:00 hora QR).'}
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {sargazo.rows.map((r) => (
                  <DayCard key={r.date} r={r} />
                ))}
              </ul>

              {/* Paginación */}
              <div className="flex items-center justify-between mt-5 text-sm">
                {page > 1 ? (
                  <Link
                    href={`/admin/sargazo?page=${page - 1}`}
                    className="text-sea hover:text-sea-deep font-medium"
                  >
                    ← Más recientes
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-xs text-ink-soft">Página {page}</span>
                {sargazo.hasMore ? (
                  <Link
                    href={`/admin/sargazo?page=${page + 1}`}
                    className="text-sea hover:text-sea-deep font-medium"
                  >
                    Más antiguos →
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

/* ---------- Tarjeta de un día (con "Ver detalle") ---------- */

function DayCard({ r }: { r: SargazoHistoryRow }) {
  return (
    <li className="rounded-xl border border-line bg-sand/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="font-display font-semibold text-ink">{formatDateLong(r.date)}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {r.source && (
            <Badge className={r.source === 'official-map' ? 'bg-green-100 text-green-700' : 'bg-line/60 text-ink-soft'}>
              {r.source === 'official-map' ? '✓ verificado' : r.source}
            </Badge>
          )}
          {r.confidence && (
            <Badge className={CONF_CLS[r.confidence] ?? CONF_CLS.medium}>
              conf: {r.confidence}
            </Badge>
          )}
          <Link
            href={`/admin/sargazo?edit=${r.date}`}
            className="text-xs text-sea hover:text-sea-deep font-medium px-2 py-0.5"
          >
            Editar
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-soft">
        <span>🕒 {formatTime(r.captured_at)}</span>
        {r.worst_status && (
          <Badge className={STATUS_META[r.worst_status]?.chip ?? STATUS_META.unknown.chip}>
            {STATUS_META[r.worst_status]?.label ?? r.worst_status}
          </Badge>
        )}
        {r.wind_dir_cardinal && (
          <span>
            💨 {r.wind_dir_cardinal}{' '}
            {r.wind_speed_kmh != null ? Math.round(r.wind_speed_kmh) : '–'} km/h
          </span>
        )}
        {r.temp_c != null && <span>🌡️ {Math.round(r.temp_c)}°C</span>}
        <span>🌀 {r.hurricane_active ? 'Alerta' : 'No'}</span>
      </div>

      {r.zones && r.zones.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {r.zones.map((z) => (
            <ZoneDot key={z.name} name={z.name} status={z.status} />
          ))}
        </div>
      )}

      {/* Ver detalle: todos los campos guardados */}
      <details className="mt-3 group">
        <summary className="cursor-pointer text-xs text-sea hover:text-sea-deep select-none">
          Ver detalle
        </summary>
        <div className="mt-3 space-y-3 text-xs text-ink-soft border-t border-line pt-3">
          <Detail label="Viento">
            {r.wind_dir_cardinal ?? '—'} ({r.wind_dir_deg ?? '–'}°) ·{' '}
            {r.wind_speed_kmh ?? '–'} km/h · ráfagas {r.wind_gust_kmh ?? '–'} km/h
          </Detail>

          {r.region && r.region.length > 0 && (
            <Detail label="Región">
              <span className="flex flex-wrap gap-x-3 gap-y-1">
                {r.region.map((z) => (
                  <ZoneDot key={z.name} name={z.name} status={z.status} />
                ))}
              </span>
            </Detail>
          )}

          {r.summary_es && <Detail label="Resumen">{r.summary_es}</Detail>}
          {r.recommendation_es && <Detail label="Recomendación">{r.recommendation_es}</Detail>}
          {r.forecast_es && <Detail label="Pronóstico">{r.forecast_es}</Detail>}

          {r.sources && r.sources.length > 0 && (
            <Detail label="Fuentes">
              <span className="flex flex-wrap gap-x-2 gap-y-1">
                {r.sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-sea"
                  >
                    {s.title}
                  </a>
                ))}
              </span>
            </Detail>
          )}

          <Detail label="Capturado">
            {r.captured_at} {r.overridden ? '· editado a mano' : ''}
          </Detail>
        </div>
      </details>
    </li>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="font-semibold text-ink">{label}: </span>
      {children}
    </p>
  );
}

/* ---------- Formulario de edición / verificación ---------- */

function EditForm({ row }: { row: SargazoHistoryRow }) {
  const pdc =
    row.zones && row.zones.length > 0
      ? row.zones
      : DEFAULT_PDC.map((name) => ({ name, status: 'unknown' }));
  const region =
    row.region && row.region.length > 0
      ? row.region
      : DEFAULT_REGION.map((name) => ({ name, status: 'unknown' }));

  return (
    <section className="bg-shell rounded-2xl border-2 border-sea/40 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-xl font-semibold text-ink">
          Verificar {formatDateLong(row.date)}
        </h2>
        <Link href="/admin/sargazo" className="text-sm text-ink-soft hover:text-ink">
          Cancelar
        </Link>
      </div>
      <p className="text-xs text-ink-soft/80 mb-4">
        Ajustá cada zona según el dato real (p. ej. el semáforo oficial). Al
        guardar, el día queda marcado como <strong>verificado</strong>.
      </p>

      <form action={updateSargazoDay} className="space-y-5">
        <input type="hidden" name="date" value={row.date} />

        <ZoneEditor title="Playa del Carmen" prefix="zone__" zones={pdc} />
        <ZoneEditor title="Región" prefix="region__" zones={region} />

        <div>
          <label className="block text-xs font-medium text-ink mb-1">Confianza</label>
          <select
            name="confidence"
            defaultValue={row.confidence ?? 'high'}
            className="rounded-lg border border-line bg-sand/50 px-3 py-2 text-sm"
          >
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-coral text-white font-body font-bold rounded-xl px-6 py-3 hover:bg-coral/90 transition-colors"
        >
          Guardar como verificado
        </button>
      </form>
    </section>
  );
}

function ZoneEditor({
  title,
  prefix,
  zones,
}: {
  title: string;
  prefix: string;
  zones: { name: string; status: string }[];
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink mb-2">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {zones.map((z) => (
          <label key={z.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-ink-soft truncate">{z.name}</span>
            <select
              name={`${prefix}${z.name}`}
              defaultValue={z.status}
              className="rounded-lg border border-line bg-sand/50 px-2 py-1.5 text-sm shrink-0"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s]?.label ?? s}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

const STATUS_META: Record<string, { label: string; dot: string; chip: string }> = {
  clean: { label: 'Limpia', dot: 'bg-green-500', chip: 'bg-green-100 text-green-700' },
  moderate: { label: 'Moderado', dot: 'bg-yellow-500', chip: 'bg-yellow-100 text-yellow-700' },
  seaweed: { label: 'Sargazo', dot: 'bg-red-500', chip: 'bg-red-100 text-red-700' },
  unknown: { label: 'Sin dato', dot: 'bg-gray-400', chip: 'bg-gray-100 text-gray-600' },
};

const CONF_CLS: Record<string, string> = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-orange-100 text-orange-700',
};

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${className}`}>
      {children}
    </span>
  );
}

function ZoneDot({ name, status }: { name: string; status: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft">
      <span className={`w-2 h-2 rounded-full ${STATUS_META[status]?.dot ?? STATUS_META.unknown.dot}`} />
      {name}
    </span>
  );
}

function formatDateLong(date: string): string {
  const d = new Date(date + 'T12:00:00Z');
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Cancun',
  }).format(d);
}
