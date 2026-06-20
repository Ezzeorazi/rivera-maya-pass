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

export interface SargazoHistoryRow {
  date: string;
  captured_at: string;
  source: string | null;
  confidence: string | null;
  wind_dir_cardinal: string | null;
  wind_speed_kmh: number | null;
  temp_c: number | null;
  worst_status: string | null;
  hurricane_active: boolean | null;
  zones: SargazoHistoryZone[] | null;
  region: SargazoHistoryZone[] | null;
}

export interface SargazoHistoryResult {
  rows: SargazoHistoryRow[];
  /** true si la tabla no existe / Supabase no responde (para distinguir de "vacía"). */
  error: boolean;
  /** Mensaje de error de Postgres, para diagnóstico en el panel. */
  message?: string;
}

export async function getSargazoHistory(limit = 30): Promise<SargazoHistoryResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { rows: [], error: false };

  // `select('*')` para no romper si falta alguna columna nueva (temp_c, region…).
  const { data, error } = await supabase
    .from('sargazo_history')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) return { rows: [], error: true, message: error.message };
  return { rows: (data ?? []) as SargazoHistoryRow[], error: false };
}
