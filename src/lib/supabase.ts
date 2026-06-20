import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Clientes de Supabase — SOLO se importan del lado servidor.
 *
 * - `getSupabasePublic()`  → usa la anon key. Lecturas públicas (respeta RLS).
 * - `getSupabaseAdmin()`   → usa la service_role key. Escrituras del admin.
 *                            NUNCA debe llegar al browser.
 *
 * Ambos devuelven `null` si faltan las variables de entorno, para que el sitio
 * siga funcionando con los datos mock como fallback.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function getSupabasePublic(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!publicClient) {
    publicClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return publicClient;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!adminClient) {
    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}
