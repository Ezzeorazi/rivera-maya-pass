/**
 * Tours y experiencias de afiliado (Viator).
 *
 * Estrategia: cuando las playas de Playa del Carmen están con sargazo, estos
 * planes NO dependen del mar (cenotes, ruinas, parques, islas, aventura) y son
 * la alternativa de conversión. Por eso `beachIndependent` se usa para
 * destacarlos en el banner de sargazo.
 *
 * Estos son DEEP-LINKS curados: cada `viatorUrl` apunta a una página de Viator
 * (producto, categoría o búsqueda). El tracking de afiliado (pid/mcid/medium)
 * lo agrega automáticamente `@/lib/viator` — NO lo pongas a mano aquí.
 *
 * Para maximizar conversión, reemplazá cada `viatorUrl` por el deep-link de un
 * producto específico generado con el "Link Builder" de tu panel de Viator.
 */

export type TourCategory =
  | 'cenote'
  | 'ruinas'
  | 'isla'
  | 'parque'
  | 'aventura'
  | 'naturaleza';

export interface Tour {
  slug: string;
  title: string;
  titleEn: string;
  category: TourCategory;
  description: string;
  descriptionEn: string;
  /** Precio "desde" en USD (Viator cotiza en USD). */
  priceFromUsd: number;
  durationHrs: number;
  rating: number;
  reviewCount: number;
  /** URL de Viator SIN params de afiliado (se agregan en runtime). */
  viatorUrl: string;
  /** true = no depende de la playa → alternativa al sargazo. */
  beachIndependent: boolean;
  /** Imagen local opcional (/images/tours/...). Si falta, se usa gradiente + ícono. */
  image?: string;
  gradient: string;
  /** Destacado: aparece primero. */
  featured?: boolean;
}

/** Emoji por categoría para el fallback visual de la card. */
export const categoryIcon: Record<TourCategory, string> = {
  cenote: '🐠',
  ruinas: '🏛️',
  isla: '🏝️',
  parque: '🎢',
  aventura: '🏍️',
  naturaleza: '🦩',
};

export const categoryLabel: Record<TourCategory, { es: string; en: string }> = {
  cenote: { es: 'Cenotes', en: 'Cenotes' },
  ruinas: { es: 'Ruinas mayas', en: 'Mayan ruins' },
  isla: { es: 'Islas', en: 'Islands' },
  parque: { es: 'Parques', en: 'Theme parks' },
  aventura: { es: 'Aventura', en: 'Adventure' },
  naturaleza: { es: 'Naturaleza', en: 'Nature' },
};

export const tours: Tour[] = [
  {
    slug: 'chichen-itza-cenote-valladolid',
    title: 'Chichén Itzá, cenote y Valladolid',
    titleEn: 'Chichén Itzá, Cenote & Valladolid',
    category: 'ruinas',
    description:
      'Excursión de día completo a una de las 7 maravillas del mundo. Incluye nado en cenote sagrado, buffet y el pueblo mágico de Valladolid. Sin tocar la playa.',
    descriptionEn:
      'Full-day trip to one of the 7 wonders of the world. Includes a swim in a sacred cenote, buffet and the magical town of Valladolid. No beach needed.',
    priceFromUsd: 59,
    durationHrs: 12,
    rating: 4.7,
    reviewCount: 8421,
    viatorUrl: 'https://www.viator.com/searchResults/all?text=chichen%20itza%20from%20playa%20del%20carmen',
    beachIndependent: true,
    gradient: 'from-amber-500 via-orange-600 to-amber-800',
    featured: true,
  },
  {
    slug: 'cenotes-tour-riviera-maya',
    title: 'Tour de cenotes en la Riviera Maya',
    titleEn: 'Riviera Maya Cenotes Tour',
    category: 'cenote',
    description:
      'Nadá y bucea en cenotes de agua cristalina escondidos en la selva. La mejor alternativa al mar cuando hay sargazo: agua siempre transparente y fresca.',
    descriptionEn:
      'Swim and snorkel in crystal-clear cenotes hidden in the jungle. The best alternative to the sea when there is sargassum: always clear, cool water.',
    priceFromUsd: 79,
    durationHrs: 7,
    rating: 4.8,
    reviewCount: 3120,
    viatorUrl: 'https://www.viator.com/searchResults/all?text=cenotes%20riviera%20maya',
    beachIndependent: true,
    gradient: 'from-sea via-sea-deep to-lagoon',
    featured: true,
  },
  {
    slug: 'isla-mujeres-catamaran',
    title: 'Isla Mujeres en catamarán',
    titleEn: 'Isla Mujeres Catamaran',
    category: 'isla',
    description:
      'Navegá a Isla Mujeres, una de las zonas que suele quedar limpia de sargazo. Snorkel, barra libre y playas de arena blanca en el Caribe.',
    descriptionEn:
      'Sail to Isla Mujeres, one of the areas that usually stays clear of sargassum. Snorkeling, open bar and white-sand Caribbean beaches.',
    priceFromUsd: 89,
    durationHrs: 8,
    rating: 4.6,
    reviewCount: 5640,
    viatorUrl: 'https://www.viator.com/searchResults/all?text=isla%20mujeres%20catamaran',
    beachIndependent: true,
    gradient: 'from-lagoon via-sea to-sea-deep',
    featured: true,
  },
  {
    slug: 'xcaret-parque',
    title: 'Parque Xcaret · Día completo',
    titleEn: 'Xcaret Park · Full Day',
    category: 'parque',
    description:
      'Ríos subterráneos, vida silvestre, cultura maya y el espectáculo nocturno México Espectacular. Un mundo entero sin pisar la playa.',
    descriptionEn:
      'Underground rivers, wildlife, Mayan culture and the México Espectacular night show. A whole world with no beach needed.',
    priceFromUsd: 139,
    durationHrs: 10,
    rating: 4.8,
    reviewCount: 9870,
    viatorUrl: 'https://www.viator.com/searchResults/all?text=xcaret%20park',
    beachIndependent: true,
    gradient: 'from-emerald-500 via-green-600 to-teal-800',
  },
  {
    slug: 'tulum-ruinas-cenote',
    title: 'Ruinas de Tulum + cenote',
    titleEn: 'Tulum Ruins + Cenote',
    category: 'ruinas',
    description:
      'La única ciudad maya frente al mar, combinada con un nado refrescante en cenote. Historia, fotos increíbles y selva.',
    descriptionEn:
      'The only Mayan city facing the sea, combined with a refreshing cenote swim. History, incredible photos and jungle.',
    priceFromUsd: 49,
    durationHrs: 7,
    rating: 4.6,
    reviewCount: 2310,
    viatorUrl: 'https://www.viator.com/searchResults/all?text=tulum%20ruins%20cenote',
    beachIndependent: true,
    gradient: 'from-stone-500 via-amber-700 to-stone-800',
  },
  {
    slug: 'atv-ziplines-cenote',
    title: 'ATV, tirolesas y cenote',
    titleEn: 'ATV, Ziplines & Cenote',
    category: 'aventura',
    description:
      'Adrenalina en la selva maya: cuatrimotos, tirolesas y nado en cenote. Plan perfecto para grupos y familias cuando el mar no acompaña.',
    descriptionEn:
      'Adrenaline in the Mayan jungle: ATVs, ziplines and a cenote swim. Perfect for groups and families when the sea is not cooperating.',
    priceFromUsd: 69,
    durationHrs: 6,
    rating: 4.7,
    reviewCount: 1980,
    viatorUrl: 'https://www.viator.com/searchResults/all?text=atv%20ziplines%20cenote%20riviera%20maya',
    beachIndependent: true,
    gradient: 'from-lime-600 via-green-700 to-emerald-900',
  },
  {
    slug: 'xel-ha-parque-acuatico',
    title: 'Xel-Há · Parque acuático natural',
    titleEn: 'Xel-Há · Natural Water Park',
    category: 'parque',
    description:
      'Caleta natural con snorkel, ríos y barra libre todo incluido. Agua protegida y siempre limpia, sin oleaje ni sargazo.',
    descriptionEn:
      'Natural inlet with snorkeling, rivers and all-inclusive open bar. Protected, always-clean water — no waves, no sargassum.',
    priceFromUsd: 109,
    durationHrs: 8,
    rating: 4.7,
    reviewCount: 4150,
    viatorUrl: 'https://www.viator.com/searchResults/all?text=xel-ha%20all%20inclusive',
    beachIndependent: true,
    gradient: 'from-cyan-500 via-sea to-lagoon',
  },
  {
    slug: 'holbox-dia-completo',
    title: 'Isla Holbox · Día completo',
    titleEn: 'Holbox Island · Full Day',
    category: 'isla',
    description:
      'Escapada a la isla más tranquila del Caribe mexicano: aguas turquesa, flamencos y arena blanca. Una de las zonas más limpias de sargazo.',
    descriptionEn:
      'Escape to the most laid-back island in the Mexican Caribbean: turquoise waters, flamingos and white sand. One of the cleanest areas for sargassum.',
    priceFromUsd: 119,
    durationHrs: 13,
    rating: 4.7,
    reviewCount: 1240,
    viatorUrl: 'https://www.viator.com/searchResults/all?text=holbox%20from%20playa%20del%20carmen',
    beachIndependent: true,
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-700',
  },
];

export function getTours(): Tour[] {
  return [...tours].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}
