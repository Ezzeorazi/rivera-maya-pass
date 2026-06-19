import type { Locale } from '@/i18n/config';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateWhatsAppLink(
  phone: string,
  propertyName: string,
  lang: Locale = 'es'
): string {
  const message =
    lang === 'es'
      ? `Hola, quiero reservar un day pass en ${propertyName}. ¿Tienen disponibilidad?`
      : `Hi, I want to book a day pass at ${propertyName}. Do you have availability?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocalizedField(item: Record<string, any>, field: string, lang: Locale): string {
  if (lang === 'en') {
    const enValue = item[`${field}En`];
    if (typeof enValue === 'string') return enValue;
  }
  const value = item[field];
  return typeof value === 'string' ? value : '';
}
