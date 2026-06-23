import Link from "next/link";
import { sargazoReport, type BeachStatusType } from "@/lib/sargazo";

// Resumen compacto del estado de playas para el home. El detalle completo
// (recomendación, región, pronóstico, fuentes) vive en /[lang]/sargazo.
const dotColor: Record<BeachStatusType, string> = {
  clean: "bg-green-500",
  moderate: "bg-yellow-500",
  seaweed: "bg-red-500",
  unknown: "bg-gray-400",
};
const chipClass: Record<BeachStatusType, string> = {
  clean: "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  seaweed: "bg-red-100 text-red-700",
  unknown: "bg-gray-100 text-gray-600",
};

export default function BeachStatusSummary({
  dict,
  lang,
}: {
  dict: Record<string, unknown>;
  lang: string;
}) {
  const beachStatus = dict.beachStatus as Record<string, string>;
  const { zones, summary } = sargazoReport;
  const isEn = lang === "en";
  const summaryText = summary[lang as keyof typeof summary] ?? summary.es;

  const labelFor = (status: BeachStatusType): string => {
    if (status === "clean") return beachStatus.clean;
    if (status === "moderate") return beachStatus.moderate;
    if (status === "seaweed") return beachStatus.seaweed;
    return beachStatus.unknownLabel ?? "";
  };

  return (
    <section className="bg-lagoon-bg py-16 lg:py-20" id="estado-playa">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block uppercase tracking-widest text-sea font-semibold text-xs font-body mb-2">
            {beachStatus.sectionLabel}
          </span>
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mb-3">
            {beachStatus.title}
          </h2>
          <p className="text-ink-soft font-body max-w-lg mx-auto">
            {beachStatus.subtitle}
          </p>
        </div>

        {beachStatus.pdcLabel && (
          <p className="font-display font-semibold text-sm text-ink mb-3 flex items-center justify-center gap-2">
            <span aria-hidden="true">📍</span>
            {beachStatus.pdcLabel}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {zones.map((zone) => {
            const status = zone.status as BeachStatusType;
            return (
              <div
                key={zone.name}
                className="bg-shell rounded-xl border border-line p-4 flex flex-col items-center gap-3"
              >
                <span className={`block w-3.5 h-3.5 rounded-full ${dotColor[status]}`} />
                <span className="font-display font-semibold text-sm text-ink text-center">
                  {zone.name}
                </span>
                <span
                  className={`text-xs font-body font-medium px-2.5 py-0.5 rounded-full ${chipClass[status]}`}
                >
                  {labelFor(status)}
                </span>
              </div>
            );
          })}
        </div>

        {summaryText && (
          <p className="mx-auto max-w-2xl text-center text-ink-soft font-body text-sm leading-relaxed mt-8">
            {summaryText}
          </p>
        )}

        <div className="text-center mt-8">
          <Link
            href={`/${lang}/sargazo`}
            data-track="sargazo_full_view"
            className="inline-flex items-center gap-2 bg-sea text-white font-body font-semibold px-6 py-3 rounded-xl hover:bg-sea-deep transition-colors shadow-sm shadow-sea/25"
          >
            {beachStatus.seeFullStatus ??
              (isEn ? "See full status & forecast" : "Ver estado completo y pronóstico")}
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
          <p className="text-xs text-ink-soft/60 font-body mt-3">
            {beachStatus.updatedAt}
          </p>
        </div>
      </div>
    </section>
  );
}
