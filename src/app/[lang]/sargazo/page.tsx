import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SITE_URL } from "@/lib/site";
import { getLiveReport } from "@/lib/get-live-report";
import BeachStatus from "@/components/BeachStatus";

// ISR: las correcciones cargadas en /admin (Supabase) aparecen sin redeploy.
export const revalidate = 60;

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const beachStatus = dict.beachStatus as Record<string, string>;

  return {
    title: beachStatus.metaTitle,
    description: beachStatus.metaDescription,
    alternates: {
      canonical: `/${lang}/sargazo`,
      languages: {
        es: "/es/sargazo",
        en: "/en/sargazo",
        "x-default": "/es/sargazo",
      },
    },
    openGraph: {
      title: beachStatus.metaTitle,
      description: beachStatus.metaDescription,
      type: "website",
      locale: lang === "en" ? "en_US" : "es_MX",
    },
  };
}

export default async function SargazoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const beachStatus = dict.beachStatus as Record<string, string>;
  const beachReport = await getLiveReport();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-lagoon-bg/50 to-lagoon-bg pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-sea text-xs font-bold tracking-widest uppercase font-body mb-3">
            {beachStatus.sectionLabel}
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-ink mb-4 max-w-2xl mx-auto">
            {beachStatus.pageTitle}
          </h1>
          <p className="text-ink-soft text-lg max-w-xl mx-auto font-body leading-relaxed">
            {beachStatus.pageSubtitle}
          </p>
        </div>
      </section>

      <BeachStatus dict={dict} lang={lang} hideHeader report={beachReport} />

      {/* JSON-LD: dataset/observación de sargazo del día */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: beachStatus.metaTitle,
            description: beachStatus.metaDescription,
            url: `${SITE_URL}/${lang}/sargazo`,
            dateModified: beachReport.updatedAt,
            isPartOf: {
              "@type": "WebSite",
              name: "RivieraMayaPass",
              url: SITE_URL,
            },
            about: {
              "@type": "Place",
              name: "Playa del Carmen, Riviera Maya",
            },
          }),
        }}
      />
    </>
  );
}
