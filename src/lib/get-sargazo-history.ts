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

const COLUMNS =
  'date,captured_at,source,confidence,wind_dir_cardinal,wind_speed_kmh,temp_c,worst_status,hurricane_active,zones,region';

export interface SargazoHistoryResult {
  rows: SargazoHistoryRow[];
  /** true si la tabla no existe / Supabase no responde (para distinguir de "vacía"). */
  error: boolean;
}

export async function getSargazoHistory(limit = 30): Promise<SargazoHistoryResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { rows: [], error: false };

  const { data, error } = await supabase
    .from('sargazo_history')
    .select(COLUMNS)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) return { rows: [], error: true };
  return { rows: (data ?? []) as SargazoHistoryRow[], error: false };
}
