'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

const SEVERITY: Record<string, number> = { clean: 0, moderate: 1, seaweed: 2 };
const VALID = new Set(['clean', 'moderate', 'seaweed', 'unknown']);

function collect(formData: FormData, prefix: string) {
  const out: { name: string; status: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith(prefix)) {
      const status = String(value);
      if (VALID.has(status)) {
        out.push({ name: key.slice(prefix.length), status });
      }
    }
  }
  return out;
}

function worstOf(zones: { status: string }[]): string {
  const known = zones.filter((z) => z.status in SEVERITY);
  if (known.length === 0) return 'unknown';
  return known.reduce((a, b) => (SEVERITY[b.status] > SEVERITY[a.status] ? b : a)).status;
}

/**
 * Da de alta un día histórico a mano (backfill), según el semáforo oficial.
 * Sirve para cargar meses anteriores y construir etiquetas verificadas para el
 * modelo. Usa upsert: si la fecha ya existe, la actualiza (igual que verificar).
 */
export async function addSargazoDay(formData: FormData) {
  if (!(await isAuthenticated())) redirect('/admin/login');

  const supabase = getSupabaseAdmin();
  if (!supabase) redirect('/admin/sargazo?error=nodb');

  const date = String(formData.get('date') || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) redirect('/admin/sargazo?error=fecha%20invalida');

  const zones = collect(formData, 'zone__');
  const region = collect(formData, 'region__');
  const confidence = String(formData.get('confidence') || 'high');

  const { error } = await supabase.from('sargazo_history').upsert(
    {
      date,
      zones,
      region,
      worst_status: worstOf(zones),
      confidence,
      source: 'official-map',
      overridden: true,
      captured_at: new Date().toISOString(),
    },
    { onConflict: 'date' },
  );

  revalidatePath('/admin/sargazo');
  if (error) redirect(`/admin/sargazo?error=${encodeURIComponent(error.message)}`);
  redirect('/admin/sargazo?ok=added');
}

/**
 * Corrige/verifica el reporte de un día con el dato real (p. ej. el semáforo
 * oficial de la Red de Monitoreo). Marca la fila como verificada para mejorar
 * la calidad del dataset.
 */
export async function updateSargazoDay(formData: FormData) {
  if (!(await isAuthenticated())) redirect('/admin/login');

  const supabase = getSupabaseAdmin();
  if (!supabase) redirect('/admin/sargazo?error=nodb');

  const date = String(formData.get('date') || '').trim();
  if (!date) redirect('/admin/sargazo?error=nodate');

  const zones = collect(formData, 'zone__');
  const region = collect(formData, 'region__');
  const confidence = String(formData.get('confidence') || 'high');

  const { error } = await supabase
    .from('sargazo_history')
    .update({
      zones,
      region,
      worst_status: worstOf(zones),
      confidence,
      source: 'official-map',
      overridden: true,
    })
    .eq('date', date);

  revalidatePath('/admin/sargazo');
  if (error) redirect(`/admin/sargazo?error=${encodeURIComponent(error.message)}`);
  redirect('/admin/sargazo?ok=verified');
}
