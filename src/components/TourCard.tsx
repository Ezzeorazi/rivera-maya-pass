import type { Locale } from '@/i18n/config';
import {
  type Tour,
  categoryIcon,
  categoryLabel,
} from '@/data/tours';
import { buildAffiliateUrl, AFFILIATE_LINK_REL } from '@/lib/viator';

interface TourCardProps {
  tour: Tour;
  lang: Locale;
  dict: Record<string, string>;
  /** Etiqueta de campaña para el tracking (ej. 'home', 'sargazo', 'tours-page'). */
  campaign?: string;
}

function formatUsd(amount: number, lang: Locale): string {
  return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TourCard({ tour, lang, dict, campaign }: TourCardProps) {
  const isEn = lang === 'en';
  const title = isEn ? tour.titleEn : tour.title;
  const description = isEn ? tour.descriptionEn : tour.description;
  const cat = categoryLabel[tour.category][lang === 'en' ? 'en' : 'es'];
  const href = buildAffiliateUrl(tour.viatorUrl, campaign);

  return (
    <a
      href={href}
      target="_blank"
      rel={AFFILIATE_LINK_REL}
      className="group flex flex-col bg-shell rounded-[20px] border border-line overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image / visual area */}
      <div className="relative h-44 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${tour.gradient}`} />
        {tour.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tour.image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-6xl opacity-90 transition-transform duration-500 group-hover:scale-110 drop-shadow"
          >
            {categoryIcon[tour.category]}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-ink font-body">
            {categoryIcon[tour.category]} {cat}
          </span>
        </div>

        {/* Beach-independent badge */}
        {tour.beachIndependent && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-[11px] font-semibold text-white font-body">
              {dict.beachFreeBadge}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display font-semibold text-lg text-ink mb-1 group-hover:text-sea transition-colors">
          {title}
        </h3>

        <p className="text-sm text-ink-soft font-body leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>

        {/* Meta row */}
        <div className="mt-auto flex items-center gap-3 text-xs text-ink-soft font-body mb-4">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">⭐</span>
            {tour.rating.toFixed(1)}
            <span className="text-ink-soft/60">({tour.reviewCount.toLocaleString()})</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">🕐</span>
            {tour.durationHrs} {dict.hours}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-ink-soft font-body">{dict.from}</span>
            <span className="font-display font-bold text-xl text-ink">
              {formatUsd(tour.priceFromUsd, lang)}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 bg-coral text-white rounded-xl px-4 py-2.5 text-sm font-semibold font-body group-hover:bg-coral/90 transition-colors shadow-sm">
            {dict.book}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}
