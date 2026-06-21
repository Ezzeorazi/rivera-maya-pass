/**
 * Tracking de afiliado de Viator.
 *
 * Agrega los parámetros de tracking (pid/mcid/medium/campaign) a cualquier
 * URL de viator.com para que las reservas que se originen desde el sitio se
 * acrediten a nuestra cuenta de afiliado.
 *
 * Configuración por variables de entorno (Vercel → Settings → Environment):
 *   NEXT_PUBLIC_VIATOR_PID   → tu Partner ID (ej. P00012345). REQUERIDO en prod.
 *   NEXT_PUBLIC_VIATOR_MCID  → media campaign id (default 42383, el de afiliados).
 *   NEXT_PUBLIC_VIATOR_MEDIUM→ medio (default 'link').
 *
 * Si no hay PID configurado, devolvemos la URL limpia (sigue funcionando, pero
 * sin comisión) — útil en desarrollo.
 */

const VIATOR_PID = process.env.NEXT_PUBLIC_VIATOR_PID;
const VIATOR_MCID = process.env.NEXT_PUBLIC_VIATOR_MCID ?? '42383';
const VIATOR_MEDIUM = process.env.NEXT_PUBLIC_VIATOR_MEDIUM ?? 'link';

/** ¿Hay tracking de afiliado configurado? */
export const isAffiliateConfigured = Boolean(VIATOR_PID);

/**
 * Devuelve la URL de Viator con los parámetros de afiliado.
 * @param url     URL de Viator (producto, categoría o búsqueda).
 * @param campaign Etiqueta opcional para segmentar reportes (ej. 'home', 'sargazo').
 */
export function buildAffiliateUrl(url: string, campaign?: string): string {
  try {
    const parsed = new URL(url);
    if (VIATOR_PID) {
      parsed.searchParams.set('pid', VIATOR_PID);
      parsed.searchParams.set('mcid', VIATOR_MCID);
      parsed.searchParams.set('medium', VIATOR_MEDIUM);
    }
    if (campaign) parsed.searchParams.set('campaign', campaign);
    return parsed.toString();
  } catch {
    // URL inválida: la devolvemos tal cual para no romper el render.
    return url;
  }
}

/** Atributos recomendados para los enlaces de afiliado. */
export const AFFILIATE_LINK_REL = 'sponsored noopener noreferrer';
