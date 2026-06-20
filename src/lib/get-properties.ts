import 'server-only';
import { properties as mockProperties, type Property } from '@/data/properties';
import { getSupabasePublic, getSupabaseAdmin } from '@/lib/supabase';

/**
 * Capa desacoplada de acceso a propiedades.
 *
 * El sitio público SIEMPRE lee a través de estas funciones, nunca importa
 * `@/data/properties` directamente. Así podemos cambiar el origen (mock ↔ Supabase)
 * sin tocar las páginas.
 *
 * Regla de fallback: si Supabase no está configurado o la tabla está vacía,
 * usamos los datos mock como semilla para que el demo nunca se vea roto.
 */

export interface PropertyRow {
  id: string;
  slug: string;
  name: string;
  zone: string;
  description: string;
  included: string[] | null;
  price_mxn: number;
  image_url: string | null;
  is_active: boolean;
  beach_clean_badge: boolean;
  is_featured: boolean;
  created_at: string;
}

const DEFAULT_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5219841234567';
const DEFAULT_GRADIENTS = [
  'from-sea via-sea-deep to-lagoon',
  'from-sea-deep via-lagoon to-sea',
  'from-lagoon via-sea to-sea-deep',
  'from-sea via-lagoon to-sea-deep',
  'from-ink via-sea-deep to-sea',
  'from-lagoon-bg via-lagoon to-sea',
];

function gradientFor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash + slug.charCodeAt(i)) % DEFAULT_GRADIENTS.length;
  return DEFAULT_GRADIENTS[hash];
}

/** Convierte una fila de Supabase al tipo `Property` que usan los componentes. */
function mapRow(row: PropertyRow): Property {
  const included = row.included ?? [];
  const image = row.image_url || '/images/mamitas.webp';
  return {
    slug: row.slug,
    name: row.name,
    zone: row.zone,
    zoneEn: row.zone,
    description: row.description,
    descriptionEn: row.description,
    price: row.price_mxn,
    image,
    gallery: [image],
    includes: included,
    includesEn: included,
    schedule: '9:00 AM - 6:00 PM',
    beachStatus: row.beach_clean_badge ? 'clean' : 'moderate',
    rating: 4.8,
    reviewCount: 0,
    whatsappNumber: DEFAULT_WHATSAPP,
    gradient: gradientFor(row.slug),
  };
}

/** Propiedades activas para el sitio público (ISR). Fallback a mock si está vacío. */
export async function getProperties(): Promise<Property[]> {
  const supabase = getSupabasePublic();
  if (!supabase) return mockProperties;

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return mockProperties;
  return (data as PropertyRow[]).map(mapRow);
}

/** Una propiedad por slug (solo activas, para el sitio público). */
export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const list = await getProperties();
  return list.find((p) => p.slug === slug) ?? null;
}

/** TODAS las propiedades (incluidas inactivas) para el panel /admin. Usa service_role. */
export async function getAllPropertiesAdmin(): Promise<PropertyRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as PropertyRow[];
}
