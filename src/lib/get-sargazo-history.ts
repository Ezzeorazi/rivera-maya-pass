import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Lectura del histórico del bot de sargazo para el panel /admin.
 *
 * La tabla `sargazo_history` tiene RLS activado sin políticas públicas, así que
 * se lee con la service_role key (que omite RLS), igual que las propiedades.
 */

export interface SargazoHistoryZone {
  name: string;
  status: string;
}

export interface SargazoHistorySource {
  title: string;
  url: string;
}

export interface SargazoHistoryRow {
  date: string;
  captured_at: string;
  source: string | null;
  confidence: string | null;
  overridden: boolean | null;
  wind_dir_cardinal: string | null;
  wind_dir_deg: number | null;
  wind_speed_kmh: number | null;
  wind_gust_kmh: number | null;
  temp_c: number | null;
  worst_status: string | null;
  hurricane_active: boolean | null;
  zones: SargazoHistoryZone[] | null;
  region: SargazoHistoryZone[] | null;
  sources: SargazoHistorySource[] | null;
  summary_es: string | null;
  summary_en: string | null;
  recommendation_es: string | null;
  recommendation_en: string | null;
  forecast_es: string | null;
  forecast_en: string | null;
}

export interface SargazoHistoryResult {
  rows: SargazoHistoryRow[];
  /** true si la tabla no existe / Supabase no responde (para distinguir de "vacía"). */
  error: boolean;
  /** Mensaje de error de Postgres, para diagnóstico en el panel. */
  message?: string;
  /** true si hay más días después de los devueltos (para paginar). */
  hasMore: boolean;
}

/** Página de historial (de a `limit` días). `offset` salta días para paginar. */
export async function getSargazoHistory(
  limit = 10,
  offset = 0,
): Promise<SargazoHistoryResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { rows: [], error: false, hasMore: false };

  // Pedimos uno extra para saber si hay página siguiente, sin un count aparte.
  const { data, error } = await supabase
    .from('sargazo_history')
    .select('*')
    .order('date', { ascending: false })
    .range(offset, offset + limit);

  if (error) return { rows: [], error: true, message: error.message, hasMore: false };

  const all = (data ?? []) as SargazoHistoryRow[];
  const hasMore = all.length > limit;
  return { rows: all.slice(0, limit), error: false, hasMore };
}

/** Una fila puntual por fecha (para el formulario de edición/verificación). */
export async function getSargazoDay(date: string): Promise<SargazoHistoryRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sargazo_history')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error || !data) return null;
  return data as SargazoHistoryRow;
}
