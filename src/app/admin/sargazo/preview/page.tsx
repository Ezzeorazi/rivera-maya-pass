import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';
import type { HurricaneAlert } from '@/lib/sargazo';
import BeachStatus from '@/components/BeachStatus';

export const metadata: Metadata = {
  title: 'Vista previa · Alerta de huracán',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// Alerta de ejemplo SOLO para la vista previa del admin. No se publica.
const DEMO_ALERT: HurricaneAlert = {
  active: true,
  headline: {
    es: '⚠️ Huracán Beryl en el Caribe (~850 km). Posible oleaje fuerte y cambios rápidos en las playas; revisa avisos locales antes de ir.',
    en: '⚠️ Hurricane Beryl in the Caribbean (~850 km). Possible heavy surf and fast-changing beach conditions; check local advisories before going.',
  },
  storms: [{ name: 'Beryl', classification: 'HU', distance_km: 850, movement: 'NW' }],
};

export default async function HurricanePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  if (!(await isAuthenticated())) redirect('/admin/login');

  const { lang: langRaw } = await searchParams;
  const lang: Locale = langRaw === 'en' ? 'en' : 'es';
  const dict = await getDictionary(lang);

  return (
    <main className="min-h-screen bg-sand">
      {/* Aviso de que es demo, no público */}
      <div className="sticky top-0 z-10 bg-ink text-sand">
        <div className="max-w-5xl mx-auto px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-sm font-semibold">
              👁️ Vista previa de alerta de huracán
            </p>
            <p className="text-lagoon/70 text-xs">
              Demo — esto NO está publicado en el sitio.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/admin/sargazo/preview?lang=es"
              className={`rounded-lg px-3 py-1.5 ${lang === 'es' ? 'bg-sand/20 font-semibold' : 'text-lagoon/70 hover:text-lagoon'}`}
            >
              ES
            </Link>
            <Link
              href="/admin/sargazo/preview?lang=en"
              className={`rounded-lg px-3 py-1.5 ${lang === 'en' ? 'bg-sand/20 font-semibold' : 'text-lagoon/70 hover:text-lagoon'}`}
            >
              EN
            </Link>
            <Link
              href="/admin/sargazo"
              className="rounded-lg px-3 py-1.5 bg-sand/10 hover:bg-sand/20"
            >
              ← Volver
            </Link>
          </div>
        </div>
      </div>

      <p className="max-w-5xl mx-auto px-5 pt-6 text-sm text-ink-soft">
        Así se vería la sección «Estado de playas» en el sitio público cuando el
        bot detecta un huracán/tormenta cerca. El banner rojo aparece arriba de
        todo. (Los datos de zonas son los reales de hoy; el banner es de ejemplo.)
      </p>

      <BeachStatus dict={dict} lang={lang} overrideAlert={DEMO_ALERT} />
    </main>
  );
}
