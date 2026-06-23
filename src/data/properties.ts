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

// Sin propiedades de demo a propósito: no listamos negocios reales que todavía
// no son clientes (riesgo legal + no podríamos cumplir la reserva). Cuando haya
// day passes reales se cargan por /admin (Supabase) y el home muestra la grilla;
// mientras tanto el home usa el modo concierge "te lo conseguimos".
export const properties: Property[] = [];
