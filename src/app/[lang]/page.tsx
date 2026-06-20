import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getProperties } from "@/lib/get-properties";
import { reviews } from "@/data/reviews";
import Hero from "@/components/Hero";
import BeachStatus from "@/components/BeachStatus";
import PropertyGrid from "@/components/PropertyGrid";
import ReviewSection from "@/components/ReviewSection";
import BlogSection from "@/components/BlogSection";

// ISR: las propiedades nuevas cargadas en /admin aparecen sin redeploy.
export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const properties = await getProperties();

  return (
    <>
      {/* Hero + Search */}
      <Hero dict={dict} />

      {/* Beach Status Banner */}
      <section id="estado-playa">
        <BeachStatus dict={dict} lang={lang} />
      </section>

      {/* Properties Grid */}
      <section id="propiedades" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <PropertyGrid
            properties={properties}
            lang={lang as Locale}
            dict={dict}
          />
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 lg:py-24 bg-lagoon-bg/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <ReviewSection
            reviews={reviews}
            lang={lang as Locale}
            dict={dict}
          />
        </div>
      </section>

      {/* Blog Preview */}
      <section id="blog" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <BlogSection lang={lang} dict={dict} />
        </div>
      </section>

      {/* B2B CTA */}
      <section id="contacto" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="bg-ink rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden">
            {/* Decorative circle */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-gradient-to-br from-sea to-transparent opacity-40" />
            <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br from-coral to-transparent opacity-20" />

            <div className="relative z-10">
              <h2 className="font-display text-3xl lg:text-4xl font-semibold text-sand mb-4">
                {dict.cta.title}
              </h2>
              <p className="text-lagoon/80 text-lg max-w-xl mx-auto mb-8">
                {dict.cta.subtitle}
              </p>
              <a
                href="https://wa.me/5219841234567?text=Hola%2C%20tengo%20un%20hotel%2Fbeach%20club%20y%20me%20interesa%20unirme%20a%20RivieraMayaPass"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-coral text-white font-body font-bold px-8 py-4 text-lg rounded-xl hover:bg-coral/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-coral/25"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {dict.cta.button}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "RivieraMayaPass",
            description:
              "El especialista local del day pass en la Riviera Maya. Acceso a albercas, beach clubs y playas limpias en Playa del Carmen.",
            url: "https://rivieramayapass.com",
            telephone: "+52-984-123-4567",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Playa del Carmen",
              addressRegion: "Quintana Roo",
              addressCountry: "MX",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 20.6296,
              longitude: -87.0739,
            },
            areaServed: {
              "@type": "Place",
              name: "Riviera Maya",
            },
            priceRange: "$750 - $2,400 MXN",
          }),
        }}
      />
    </>
  );
}
