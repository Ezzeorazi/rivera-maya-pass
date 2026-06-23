'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * Listener global de clicks. Cualquier elemento con `data-track="nombre_evento"`
 * dispara ese evento de analítica al hacer click (también captura
 * `data-track-label` y el href si es un enlace). Se monta una sola vez en el
 * layout, así no hay que convertir cada botón en client component.
 */
export default function ClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>('[data-track]');
      if (!el) return;

      const name = el.getAttribute('data-track');
      if (!name) return;

      const props: Record<string, string> = {};
      const label = el.getAttribute('data-track-label');
      if (label) props.label = label;
      const href = el.getAttribute('href');
      if (href) props.href = href;

      trackEvent(name, props);
    }

    // capture: true para registrar el click antes de que se abra/navegue el link.
    document.addEventListener('click', onClick, { capture: true });
    return () =>
      document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
