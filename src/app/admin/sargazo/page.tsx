import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getSargazoHistory } from '@/lib/get-sargazo-history';
import AdminHeader from '../AdminHeader';

export const metadata: Metadata = {
  title: 'Admin · Bot de sargazo',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminSargazoPage() {
  if (!(await isAuthenticated())) redirect('/admin/login');

  const configured = isSupabaseConfigured();
  const sargazo = configured
    ? await getSargazoHistory(30)
    : { rows: [], error: false as boolean, message: undefined as string | undefined };

  return (
    <main className="min-h-screen bg-sand">
      <AdminHeader active="sargazo" />

      <div className="max-w-5xl mx-auto px-5 py-8">
        {!configured && (
          <p className="rounded-xl bg-sun-bg text-ink text-sm px-4 py-3 mb-6">
            Supabase no está configurado. El bot guarda el historial en Supabase;
            cargá las variables de entorno para verlo acá.
          </p>
        )}

        <section className="bg-shell rounded-2xl border border-line p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">
                🌊 Bot de sargazo
              </h2>
              <p className="text-xs text-ink-soft/70 mt-1">
                Una fila por día (la del día actual se actualiza en cada corrida).
              </p>
            </div>
            <span className="text-xs text-ink-soft">
              {sargazo.rows.length}{' '}
              {sargazo.rows.length === 1 ? 'día registrado' : 'días registrados'}
            </span>
          </div>

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
              Todavía no hay registros. El bot agrega <strong>una fila por día</strong>{' '}
              (corre a las 10:00 hora de Quintana Roo).
            </p>
          ) : (
            <ul className="space-y-3">
              {sargazo.rows.map((r) => (
                <li
                  key={r.date}
                  className="rounded-xl border border-line bg-sand/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <p className="font-display font-semibold text-ink">
                      {formatDateLong(r.date)}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {r.source && (
                        <Badge className="bg-line/60 text-ink-soft">{r.source}</Badge>
                      )}
                      {r.confidence && (
                        <Badge className={CONF_CLS[r.confidence] ?? CONF_CLS.medium}>
                          conf: {r.confidence}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-soft">
                    <span>🕒 {formatTime(r.captured_at)}</span>
                    {r.worst_status && (
                      <Badge
                        className={STATUS_META[r.worst_status]?.chip ?? STATUS_META.unknown.chip}
                      >
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
                        <span
                          key={z.name}
                          className="inline-flex items-center gap-1 text-[11px] text-ink-soft"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${STATUS_META[z.status]?.dot ?? STATUS_META.unknown.dot}`}
                          />
                          {z.name}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

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
