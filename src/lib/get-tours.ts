import 'server-only';
import {
  getCuratedTours,
  type Tour,
  type TourCategory,
} from '@/data/tours';

/**
 * Capa de acceso a tours (Fase 2: API de Viator con fallback a curados).
 *
 * El sitio público SIEMPRE lee con `getTours()`, nunca importa `@/data/tours`
 * directo. Así podemos cambiar el origen (curado ↔ API Viator) sin tocar páginas.
 * Mismo patrón que `@/lib/get-properties` (mock ↔ Supabase).
 *
 * Regla de fallback: si la API de Viator no está configurada, o falla, o
 * devuelve vacío, usamos los tours curados de `@/data/tours`. El sitio NUNCA
 * se rompe por la API.
 *
 * Para ACTIVAR la API (cuando te aprueben acceso "Basic-access affiliate"):
 *   1. Generá tu API key en el panel de Viator.
 *   2. Cargá en Vercel: VIATOR_API_KEY=<tu-key>
 *   3. (Opcional) VIATOR_DESTINATION_ID (default 631 = Cancún/Riviera Maya)
 *   4. (Opcional) VIATOR_TOURS_COUNT (default 12)
 * Sin VIATOR_API_KEY, este módulo devuelve directamente los tours curados.
 *
 * Docs: https://docs.viator.com/partner-api/affiliate/technical/
 */

// Producción por defecto. Para probar con key de sandbox:
//   VIATOR_API_BASE=https://api.sandbox.viator.com/partner
const VIATOR_API_BASE = process.env.VIATOR_API_BASE ?? 'https://api.viator.com/partner';
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const VIATOR_DESTINATION_ID = process.env.VIATOR_DESTINATION_ID ?? '631'; // Cancún / Riviera Maya
const VIATOR_TOURS_COUNT = Number(process.env.VIATOR_TOURS_COUNT ?? '12');
const CACHE_SECONDS = 60 * 60 * 6; // 6 h: no golpeamos la API en cada request.

/**
 * Filtro de relevancia: la sección es "alternativas a la playa/sargazo".
 * Excluimos productos fuera de tema (traslados, choferes, clases, bienestar,
 * fiestas) por palabra clave en el título (bilingüe). Tags de Viator son IDs
 * numéricos opacos, así que el título es la señal más confiable y fácil de tunear.
 */
const EXCLUDE_RE =
  /\b(traslad\w*|transfer|aeropuerto|airport|private driver|driver|chofer|limusina|limousine|shuttle|cooking class|clase de cocina|chef|yoga|pilates|spa|masaje|massage|despedida de soltera|bachelor\w*|pub crawl|bar crawl|nightlife|party boat)\b/i;

function isOnTheme(title: string): boolean {
  return !EXCLUDE_RE.test(title);
}

const GRADIENTS = [
  'from-sea via-sea-deep to-lagoon',
  'from-amber-500 via-orange-600 to-amber-800',
  'from-lagoon via-sea to-sea-deep',
  'from-emerald-500 via-green-600 to-teal-800',
  'from-cyan-500 via-sea to-lagoon',
  'from-rose-400 via-pink-500 to-fuchsia-700',
];

function gradientFor(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash + code.charCodeAt(i)) % GRADIENTS.length;
  return GRADIENTS[hash];
}

/** Deduce la categoría a partir del título (para el ícono/badge de la card). */
function categoryFromTitle(title: string): TourCategory {
  const t = title.toLowerCase();
  if (/(cenote|cenotes)/.test(t)) return 'cenote';
  if (/(chich[eé]n|tulum ruin|cob[aá]|ek balam|ruin|temple|pyramid|maya site)/.test(t)) return 'ruinas';
  if (/(isla|island|holbox|cozumel|contoy)/.test(t)) return 'isla';
  if (/(xcaret|xel-?h[aá]|xplor|xenses|park)/.test(t)) return 'parque';
  if (/(atv|buggy|zip|jungle|jeep|speedboat|adventure)/.test(t)) return 'aventura';
  return 'naturaleza';
}

/** Forma (parcial y defensiva) de un producto del endpoint /products/search v2.0. */
interface ViatorProduct {
  productCode?: string;
  title?: string;
  description?: string;
  productUrl?: string;
  webURL?: string;
  duration?: { fixedDurationInMinutes?: number; variableDurationFromMinutes?: number };
  pricing?: { summary?: { fromPrice?: number }; currency?: string };
  reviews?: { combinedAverageRating?: number; totalReviews?: number };
  images?: Array<{ variants?: Array<{ url?: string; width?: number; height?: number }> }>;
}

function bestImage(product: ViatorProduct): string | undefined {
  const variants = product.images?.[0]?.variants ?? [];
  if (variants.length === 0) return undefined;
  // Elegimos una variante de ancho medio (~480-720) para las cards.
  const sorted = [...variants].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  const mid = sorted.find((v) => (v.width ?? 0) >= 480) ?? sorted[sorted.length - 1];
  return mid?.url;
}

function mapProduct(product: ViatorProduct): Tour | null {
  const code = product.productCode;
  const title = product.title;
  const url = product.productUrl ?? product.webURL;
  if (!code || !title || !url) return null;

  const minutes =
    product.duration?.fixedDurationInMinutes ??
    product.duration?.variableDurationFromMinutes ??
    null;
  const category = categoryFromTitle(title);

  return {
    slug: code,
    title,
    titleEn: title, // La API responde en el idioma de Accept-Language; usamos uno solo.
    category,
    description: product.description ?? '',
    descriptionEn: product.description ?? '',
    priceFromUsd: Math.round(product.pricing?.summary?.fromPrice ?? 0),
    durationHrs: minutes != null ? Math.max(1, Math.round(minutes / 60)) : 0,
    rating: Number((product.reviews?.combinedAverageRating ?? 0).toFixed(1)),
    reviewCount: product.reviews?.totalReviews ?? 0,
    viatorUrl: url,
    beachIndependent: true, // Toda la sección es "alternativa a la playa".
    image: bestImage(product),
    gradient: gradientFor(code),
  };
}

/**
 * Tours para el sitio público. Intenta la API de Viator; si no está configurada
 * o falla, devuelve los tours curados. NUNCA lanza: el sitio no se rompe.
 */
export async function getTours(lang: string = 'es'): Promise<Tour[]> {
  if (!VIATOR_API_KEY) return getCuratedTours();

  const acceptLanguage = lang === 'en' ? 'en-US' : 'es-MX';

  try {
    const res = await fetch(`${VIATOR_API_BASE}/products/search`, {
      method: 'POST',
      headers: {
        'exp-api-key': VIATOR_API_KEY,
        Accept: 'application/json;version=2.0',
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filtering: { destination: VIATOR_DESTINATION_ID },
        sorting: { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
        // Sobre-pedimos para tener de dónde elegir tras filtrar por tema.
        pagination: { start: 1, count: Math.min(50, VIATOR_TOURS_COUNT * 4) },
        currency: 'USD',
      }),
      next: { revalidate: CACHE_SECONDS, tags: [`tours-${lang}`] },
    });

    if (!res.ok) return getCuratedTours();

    const data = (await res.json()) as { products?: ViatorProduct[] };
    const mapped = (data.products ?? [])
      .filter((p) => typeof p.title === 'string' && isOnTheme(p.title))
      .map(mapProduct)
      .filter((t): t is Tour => t !== null)
      .slice(0, VIATOR_TOURS_COUNT);

    return mapped.length > 0 ? mapped : getCuratedTours();
  } catch {
    // Cualquier error (red, parsing, esquema) → fallback silencioso a curados.
    return getCuratedTours();
  }
}
