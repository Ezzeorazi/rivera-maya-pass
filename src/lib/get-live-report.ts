import 'server-only';
import { sargazoReport, type SargazoReport } from '@/lib/sargazo';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Reporte "en vivo" para la web del visitante.
 *
 * La web mostraba SIEMPRE el JSON estático (que solo actualiza el bot diario),
 * así que las correcciones hechas a mano en /admin (que van a Supabase) nunca
 * se reflejaban. Esta función toma el JSON como base (tiene el pronóstico por
 * día, la predicción del modelo, el viento, etc.) y le superpone el estado más
 * reciente de Supabase (zonas, región, textos, confianza) — que es donde quedan
 * tus ediciones. Así una corrección manual aparece en el sitio.
 *
 * Degrada con gracia: si Supabase no está, no responde, o el último día es uno
 * "sin dato" (degraded), se devuelve el JSON tal cual.
 */
export async function getLiveReport(): Promise<SargazoReport> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return sargazoReport;

  try {
    const { data, error } = await supabase
      .from('sargazo_history')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return sargazoReport;
    const row = data as Record<string, unknown>;

    // Día "sin dato": mantenemos el último reporte bueno (el del JSON).
    if (row.source === 'degraded') return sargazoReport;

    const zones = row.zones;
    if (!Array.isArray(zones) || zones.length === 0) return sargazoReport;

    const region = Array.isArray(row.region) && row.region.length > 0 ? row.region : null;
    const bilingual = (es: unknown, en: unknown, fallback?: { es: string; en: string }) => {
      const esStr = typeof es === 'string' ? es : '';
      const enStr = typeof en === 'string' ? en : '';
      if (!esStr && !enStr) return fallback;
      return { es: esStr || enStr, en: enStr || esStr };
    };

    return {
      ...sargazoReport,
      source: typeof row.source === 'string' ? row.source : sargazoReport.source,
      confidence: (row.confidence as SargazoReport['confidence']) ?? sargazoReport.confidence,
      zones: zones as SargazoReport['zones'],
      regionZones: (region as SargazoReport['regionZones']) ?? sargazoReport.regionZones,
      summary:
        bilingual(row.summary_es, row.summary_en, sargazoReport.summary) ?? sargazoReport.summary,
      recommendation:
        bilingual(row.recommendation_es, row.recommendation_en, sargazoReport.recommendation),
      forecast: bilingual(row.forecast_es, row.forecast_en, sargazoReport.forecast),
      // captured_at refleja el momento de la edición/captura más reciente.
      updatedAt: typeof row.captured_at === 'string' ? row.captured_at : sargazoReport.updatedAt,
      // forecastDays, prediction, wind, temperatureC, hurricaneAlert y sources se
      // conservan del JSON (Supabase no guarda esos campos estructurados).
    };
  } catch {
    return sargazoReport;
  }
}
