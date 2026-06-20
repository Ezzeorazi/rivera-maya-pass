import Link from 'next/link';
import Image from 'next/image';
import type { Property } from '@/data/properties';
import type { Locale } from '@/i18n/config';
import { formatPrice, getLocalizedField } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  lang: Locale;
  dict: Record<string, unknown>;
}

export default function PropertyCard({ property, lang, dict }: PropertyCardProps) {
  const properties = dict.properties as Record<string, string>;
  const zone = getLocalizedField(property, 'zone', lang);

  return (
    <Link
      href={`/${lang}/propiedad/${property.slug}`}
      className="group block bg-shell rounded-[20px] border border-line overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image Area */}
      <div className="relative h-52 overflow-hidden">
        {/* Gradiente de fondo: se ve mientras carga la foto */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${property.gradient}`}
        />
        <Image
          src={property.image}
          alt={property.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Badge: Zone (top-left) */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-ink font-body">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-sun"
              aria-hidden="true"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {zone}
          </span>
        </div>

      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-lg text-ink mb-1 group-hover:text-sea transition-colors">
          {property.name}
        </h3>

        <div className="flex items-center gap-1 text-sm text-ink-soft mb-4">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
            aria-hidden="true"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-body">{zone}</span>
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-xl text-ink">
              {formatPrice(property.price)}
            </span>
            <span className="text-xs text-ink-soft font-body">
              {properties.perDay}
            </span>
          </div>
          <span className="bg-coral text-white rounded-xl px-5 py-2.5 text-sm font-semibold font-body group-hover:bg-coral/90 transition-colors shadow-sm">
            {properties.book}
          </span>
        </div>
      </div>
    </Link>
  );
}
