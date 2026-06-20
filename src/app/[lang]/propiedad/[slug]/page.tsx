import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getProperties, getPropertyBySlug } from "@/lib/get-properties";
import { formatPrice, getLocalizedField } from "@/lib/utils";
import WhatsAppButton from "@/components/WhatsAppButton";

// ISR + slugs nuevos: las propiedades cargadas en /admin se renderizan sin redeploy.
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const properties = await getProperties();
  const params: { lang: string; slug: string }[] = [];
  for (const lang of ["es", "en"]) {
    for (const property of properties) {
      params.push({ lang, slug: property.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  const description = getLocalizedField(property, "description", lang as Locale);

  return {
    title: `${property.name} · Day Pass`,
    description,
    openGraph: {
      title: `${property.name} · Day Pass en ${property.zone}`,
      description,
      type: "website",
    },
  };
}

// Gradient combos for placeholder images
const gradients = [
  "from-sea via-sea-deep to-lagoon",
  "from-sea-deep via-sea to-lagoon/80",
  "from-lagoon via-sea to-sea-deep",
  "from-sea via-lagoon to-sea-deep",
];

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  const locale = lang as Locale;
  const description = getLocalizedField(property, "description", locale);
  const zone = getLocalizedField(property, "zone", locale);
  const includes =
    locale === "en" ? property.includesEn : property.includes;

  return (
    <>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-16 lg:pb-24">
        {/* Back link */}
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-1 text-sea hover:text-sea-deep font-medium text-sm mb-6 transition-colors"
        >
          {dict.property.backToAll}
        </Link>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10 rounded-2xl overflow-hidden">
          {/* Main image */}
          <div
            className={`bg-gradient-to-br ${gradients[0]} h-64 md:h-96 rounded-2xl md:rounded-r-none relative overflow-hidden`}
          >
            <Image
              src={property.gallery[0] ?? property.image}
              alt={property.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            {property.beachStatus === "clean" && (
              <span className="absolute top-4 right-4 z-10 bg-coral text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {dict.beachStatus.badgeClean}
              </span>
            )}
          </div>
          {/* Thumbnails */}
          <div className="grid grid-cols-2 gap-3">
            {property.gallery.slice(1, 5).map((src, i) => (
              <div
                key={src + i}
                className={`bg-gradient-to-br ${gradients[(i + 1) % gradients.length]} h-28 md:h-[calc(50%-6px)] rounded-xl relative overflow-hidden`}
              >
                <Image
                  src={src}
                  alt={`${property.name} — ${i + 2}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-display text-3xl lg:text-4xl font-semibold text-ink">
                {property.name}
              </h1>
              <div className="flex items-center gap-1 shrink-0 bg-sun-bg px-3 py-1 rounded-full">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-sun"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-semibold text-ink">
                  {property.rating}
                </span>
                <span className="text-xs text-ink-soft">
                  ({property.reviewCount})
                </span>
              </div>
            </div>

            <p className="text-ink-soft flex items-center gap-1.5 mb-6">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-sea"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {zone}
            </p>

            <p className="text-ink leading-relaxed text-lg mb-8">
              {description}
            </p>

            {/* What's included */}
            <div className="mb-8">
              <h2 className="font-display text-xl font-semibold text-ink mb-4">
                {dict.properties.includes}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {includes.map((item: string) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 bg-lagoon-bg/50 rounded-xl px-4 py-3 text-sm font-medium text-ink"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-sea shrink-0"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="flex items-center gap-2 text-ink-soft">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-sea"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="font-medium">{dict.properties.schedule}:</span>
              <span>{property.schedule}</span>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-shell rounded-2xl border border-line p-6 shadow-lg sticky top-24">
              <div className="text-center mb-6">
                <p className="text-sm text-ink-soft mb-1">
                  {dict.property.priceFrom}
                </p>
                <p className="font-display text-4xl font-semibold text-ink">
                  {formatPrice(property.price)}
                </p>
                <p className="text-sm text-ink-soft mt-1">
                  {dict.properties.perDay}
                </p>
              </div>

              {property.beachStatus === "clean" && (
                <div className="flex items-center gap-2 bg-lagoon-bg rounded-xl px-4 py-3 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse-soft" />
                  <span className="text-sm font-medium text-sea-deep">
                    {dict.beachStatus.badgeClean}
                  </span>
                </div>
              )}

              {property.beachStatus === "moderate" && (
                <div className="flex items-center gap-2 bg-sun-bg rounded-xl px-4 py-3 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium text-ink">
                    {dict.beachStatus.moderate}
                  </span>
                </div>
              )}

              <WhatsAppButton
                phone={property.whatsappNumber}
                propertyName={property.name}
                lang={locale}
                label={dict.property.bookViaWhatsapp}
                size="large"
              />

              <p className="text-xs text-ink-soft text-center mt-4">
                {locale === "es"
                  ? "Respuesta en menos de 5 minutos"
                  : "Response in less than 5 minutes"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: `Day Pass - ${property.name}`,
            description,
            touristType: "Day visitor",
            offers: {
              "@type": "Offer",
              price: property.price,
              priceCurrency: "MXN",
              availability: "https://schema.org/InStock",
            },
            provider: {
              "@type": "LocalBusiness",
              name: "RivieraMayaPass",
              url: "https://rivieramayapass.com",
            },
            itinerary: {
              "@type": "Place",
              name: property.name,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Playa del Carmen",
                addressRegion: "Quintana Roo",
                addressCountry: "MX",
              },
            },
          }),
        }}
      />
    </>
  );
}
