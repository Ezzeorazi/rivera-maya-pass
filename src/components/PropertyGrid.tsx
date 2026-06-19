import type { Property } from '@/data/properties';
import type { Locale } from '@/i18n/config';
import PropertyCard from './PropertyCard';

interface PropertyGridProps {
  properties: Property[];
  lang: Locale;
  dict: Record<string, unknown>;
}

export default function PropertyGrid({ properties, lang, dict }: PropertyGridProps) {
  const propertiesDict = dict.properties as Record<string, string>;

  return (
    <section className="py-16 lg:py-24 bg-shell" id="propiedades">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block uppercase tracking-widest text-coral text-xs font-bold font-body mb-2">
            {propertiesDict.sectionLabel}
          </span>
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mb-3">
            {propertiesDict.title}
          </h2>
          <p className="text-ink-soft font-body max-w-lg mx-auto">
            {propertiesDict.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.slug}
              property={property}
              lang={lang}
              dict={dict}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
