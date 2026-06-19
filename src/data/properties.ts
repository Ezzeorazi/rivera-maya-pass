export interface Property {
  slug: string;
  name: string;
  zone: string;
  zoneEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  image: string;
  gallery: string[];
  includes: string[];
  includesEn: string[];
  schedule: string;
  beachStatus: 'clean' | 'moderate' | 'seaweed';
  rating: number;
  reviewCount: number;
  whatsappNumber: string;
  gradient: string;
}

export const properties: Property[] = [
  {
    slug: 'mamitas-beach-club',
    name: "Mamita's Beach Club",
    zone: 'Zona Norte',
    zoneEn: 'North Zone',
    description:
      'El beach club más icónico de Playa del Carmen. Camastros frente al mar, alberca infinity, DJ en vivo y servicio de meseros en la playa. El lugar para ver y ser visto.',
    descriptionEn:
      "Playa del Carmen's most iconic beach club. Beachfront loungers, infinity pool, live DJ and beach waiter service. The place to see and be seen.",
    price: 890,
    image: '/images/mamitas.webp',
    gallery: [
      '/images/mamitas.webp',
      '/images/mamitas-2.webp',
      '/images/mamitas-3.webp',
      '/images/mamitas-4.webp',
    ],
    includes: ['Acceso a playa', 'Alberca infinity', 'Camastro', 'Toallas', 'WiFi'],
    includesEn: ['Beach access', 'Infinity pool', 'Lounger', 'Towels', 'WiFi'],
    schedule: '9:00 AM - 6:00 PM',
    beachStatus: 'clean',
    rating: 4.7,
    reviewCount: 234,
    whatsappNumber: '5219841234567',
    gradient: 'from-sea via-sea-deep to-lagoon',
  },
  {
    slug: 'hotel-xcaret-arte',
    name: 'Hotel Xcaret Arte',
    zone: 'Playa del Carmen',
    zoneEn: 'Playa del Carmen',
    description:
      'Vive un día en uno de los hoteles all-inclusive más espectaculares de México. Incluye acceso a parques Xcaret, buffets gourmet, bares premium y playa privada.',
    descriptionEn:
      "Experience a day at one of Mexico's most spectacular all-inclusive hotels. Includes Xcaret parks access, gourmet buffets, premium bars and private beach.",
    price: 2400,
    image: '/images/xcaret-arte.webp',
    gallery: [
      '/images/xcaret-arte.webp',
      '/images/xcaret-arte-2.webp',
      '/images/xcaret-arte-3.webp',
      '/images/xcaret-arte-4.webp',
    ],
    includes: [
      'All-inclusive',
      'Parques Xcaret',
      'Playa privada',
      'Buffet gourmet',
      'Bares premium',
      'Albercas',
    ],
    includesEn: [
      'All-inclusive',
      'Xcaret Parks',
      'Private beach',
      'Gourmet buffet',
      'Premium bars',
      'Pools',
    ],
    schedule: '8:00 AM - 8:00 PM',
    beachStatus: 'clean',
    rating: 4.9,
    reviewCount: 512,
    whatsappNumber: '5219841234567',
    gradient: 'from-sea-deep via-lagoon to-sea',
  },
  {
    slug: 'kool-beach-club',
    name: 'Kool Beach Club',
    zone: 'Calle 2 Norte',
    zoneEn: '2nd Street North',
    description:
      'Beach club relajado con vibra bohemia. Música chill, buena comida y acceso directo a una de las playas más limpias del centro de Playa. Perfecto para parejas.',
    descriptionEn:
      'Relaxed beach club with bohemian vibes. Chill music, great food and direct access to one of the cleanest beaches in downtown Playa. Perfect for couples.',
    price: 750,
    image: '/images/kool-beach.webp',
    gallery: [
      '/images/kool-beach.webp',
      '/images/kool-beach-2.webp',
      '/images/kool-beach-3.webp',
      '/images/kool-beach-4.webp',
    ],
    includes: ['Acceso a playa', 'Consumo mínimo', 'Camastro', 'WiFi'],
    includesEn: ['Beach access', 'Minimum spend', 'Lounger', 'WiFi'],
    schedule: '10:00 AM - 7:00 PM',
    beachStatus: 'clean',
    rating: 4.5,
    reviewCount: 187,
    whatsappNumber: '5219841234567',
    gradient: 'from-lagoon via-sea to-sea-deep',
  },
  {
    slug: 'thompson-playa',
    name: 'Thompson Playa del Carmen',
    zone: 'Centro',
    zoneEn: 'Downtown',
    description:
      'Rooftop pool con vista panorámica al Caribe. Cócteles de autor, gastronomía de alto nivel y acceso a playa privada. La experiencia boutique por excelencia.',
    descriptionEn:
      'Rooftop pool with panoramic Caribbean views. Craft cocktails, high-end gastronomy and private beach access. The ultimate boutique experience.',
    price: 1200,
    image: '/images/thompson.webp',
    gallery: [
      '/images/thompson.webp',
      '/images/thompson-2.webp',
      '/images/thompson-3.webp',
      '/images/thompson-4.webp',
    ],
    includes: ['Rooftop pool', 'Playa privada', 'Toallas', 'Cóctel de bienvenida', 'WiFi'],
    includesEn: ['Rooftop pool', 'Private beach', 'Towels', 'Welcome cocktail', 'WiFi'],
    schedule: '9:00 AM - 7:00 PM',
    beachStatus: 'moderate',
    rating: 4.8,
    reviewCount: 156,
    whatsappNumber: '5219841234567',
    gradient: 'from-sea via-sea-deep to-ink',
  },
  {
    slug: 'casa-malca',
    name: 'Casa Malca',
    zone: 'Carretera Tulum',
    zoneEn: 'Tulum Road',
    description:
      'Arte contemporáneo en la playa. Esta mansión convertida en hotel boutique alberga obras de Banksy y ofrece una playa virgen, alberca entre la selva y gastronomía mexicana de autor.',
    descriptionEn:
      'Contemporary art on the beach. This mansion-turned-boutique-hotel houses Banksy works and offers a pristine beach, jungle pool and signature Mexican cuisine.',
    price: 1800,
    image: '/images/casa-malca.webp',
    gallery: [
      '/images/casa-malca.webp',
      '/images/casa-malca-2.webp',
      '/images/casa-malca-3.webp',
      '/images/casa-malca-4.webp',
    ],
    includes: ['Playa virgen', 'Alberca', 'Galería de arte', 'Restaurante', 'Toallas'],
    includesEn: ['Pristine beach', 'Pool', 'Art gallery', 'Restaurant', 'Towels'],
    schedule: '10:00 AM - 6:00 PM',
    beachStatus: 'clean',
    rating: 4.6,
    reviewCount: 98,
    whatsappNumber: '5219841234567',
    gradient: 'from-ink via-sea-deep to-sea',
  },
  {
    slug: 'coralina-daylight-club',
    name: 'Coralina Daylight Club',
    zone: 'Xcalacoco',
    zoneEn: 'Xcalacoco',
    description:
      'El nuevo hotspot de Playa. Beach club de diseño con alberca, DJ sets, comida mediterránea y playa con servicio. La vibra perfecta entre Tulum y Playa del Carmen.',
    descriptionEn:
      "Playa's newest hotspot. Designer beach club with pool, DJ sets, Mediterranean food and serviced beach. The perfect vibe between Tulum and Playa del Carmen.",
    price: 950,
    image: '/images/coralina.webp',
    gallery: [
      '/images/coralina.webp',
      '/images/coralina-2.webp',
      '/images/coralina-3.webp',
      '/images/coralina-4.webp',
    ],
    includes: ['Beach club', 'Alberca', 'DJ en vivo', 'Camastro', 'Toallas', 'WiFi'],
    includesEn: ['Beach club', 'Pool', 'Live DJ', 'Lounger', 'Towels', 'WiFi'],
    schedule: '10:00 AM - 8:00 PM',
    beachStatus: 'clean',
    rating: 4.7,
    reviewCount: 143,
    whatsappNumber: '5219841234567',
    gradient: 'from-lagoon-bg via-lagoon to-sea',
  },
];
