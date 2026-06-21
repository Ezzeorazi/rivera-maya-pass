import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getTours } from "@/data/tours";
import TourSection from "@/components/TourSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const tours = dict.tours as Record<string, string>;

  return {
    title: tours.metaTitle,
    description: tours.metaDescription,
    alternates: {
      languages: { es: "/es/tours", en: "/en/tours" },
      canonical: `/${lang}/tours`,
    },
    openGraph: {
      title: tours.metaTitle,
      description: tours.metaDescription,
      type: "website",
      locale: lang === "es" ? "es_MX" : "en_US",
    },
  };
}

export default async function ToursPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const tours = dict.tours as Record<string, string>;
  const allTours = getTours();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-lagoon-bg/50 to-sand pt-16 pb-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-sea text-xs font-bold tracking-widest uppercase font-body mb-3">
            {tours.sectionLabel}
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-ink mb-4 max-w-2xl">
            {tours.pageTitle}
          </h1>
          <p className="text-ink-soft text-lg max-w-xl font-body leading-relaxed">
            {tours.pageSubtitle}
          </p>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <TourSection
            lang={lang as Locale}
            dict={dict}
            showSeeAll={false}
            campaign="tours-page"
          />
        </div>
      </section>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: tours.pageTitle,
            description: tours.metaDescription,
            url: `https://rivieramayapass.com/${lang}/tours`,
            numberOfItems: allTours.length,
            itemListElement: allTours.map((tour, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: lang === "en" ? tour.titleEn : tour.title,
              description: lang === "en" ? tour.descriptionEn : tour.description,
            })),
          }),
        }}
      />
    </>
  );
}
