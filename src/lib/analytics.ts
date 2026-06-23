'use client';

import { track } from '@vercel/analytics';

type EventProps = Record<string, string | number | boolean | null>;

/**
 * Dispara un evento de analítica a GA4 y a Vercel Analytics a la vez.
 * Seguro de llamar en cualquier lado: no hace nada en el server ni si gtag
 * todavía no cargó.
 */
export function trackEvent(name: string, props?: EventProps): void {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') {
    w.gtag('event', name, props ?? {});
  }

  // Vercel Analytics (no-op fuera de Vercel)
  try {
    track(name, props);
  } catch {
    /* ignore */
  }
}
