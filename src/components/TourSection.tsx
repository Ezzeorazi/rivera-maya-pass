import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Tour } from '@/data/tours';
import TourCard from './TourCard';

interface TourSectionProps {
  /** Tours ya resueltos (vienen de `getTours()` del lib: API Viator o curados). */
  tours: Tour[];
  lang: Locale;
  dict: Record<string, unknown>;
  /** Máximo de tours a mostrar (en el home limitamos; en /tours mostramos todos). */
  limit?: number;
  /** Mostrar el link "ver todos" hacia /tours. */
  showSeeAll?: boolean;
  /** Mostrar el header de la sección (en /tours lo ocultamos: el hero ya lo cubre). */
  showHeader?: boolean;
  campaign?: string;
}

export default function TourSection({
  tours,
  lang,
  dict,
  limit,
  showSeeAll = true,
  showHeader = true,
  campaign = 'home',
}: TourSectionProps) {
  const t = dict.tours as Record<string, string>;
  const visible = limit ? tours.slice(0, limit) : tours;

  return (
    <div>
      {/* Section Header */}
      {showHeader && (
      <div className="flex items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-sea text-xs font-bold tracking-widest uppercase font-body mb-2">
            {t.sectionLabel}
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-ink">
            {t.title}
          </h2>
          <p className="text-ink-soft mt-2 max-w-lg font-body leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {showSeeAll && (
          <Link
            href={`/${lang}/tours`}
            className="hidden md:inline-flex items-center gap-2 text-sea text-sm font-semibold hover:gap-3 transition-all font-body whitespace-nowrap"
          >
            {t.seeAll}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
      )}

      {/* Tours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((tour) => (
          <TourCard
            key={tour.slug}
            tour={tour}
            lang={lang}
            dict={t}
            campaign={campaign}
          />
        ))}
      </div>

      {/* Mobile see-all */}
      {showSeeAll && (
        <div className="mt-8 text-center md:hidden">
          <Link
            href={`/${lang}/tours`}
            className="inline-flex items-center gap-2 bg-sea/10 text-sea font-semibold px-6 py-3 rounded-xl hover:bg-sea/20 transition-colors font-body"
          >
            {t.seeAll}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Affiliate disclosure */}
      <p className="text-center text-[11px] text-ink-soft/60 font-body mt-8 max-w-2xl mx-auto">
        {t.affiliateDisclosure}
      </p>
    </div>
  );
}
