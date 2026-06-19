import { sargazoReport, type BeachStatusType } from "@/lib/sargazo";

const statusConfig: Record<
  BeachStatusType,
  { color: string; pulse: string; label: Record<string, string>; chip: string }
> = {
  clean: {
    color: 'bg-green-500',
    pulse: 'bg-green-400',
    label: { es: 'Limpia', en: 'Clean' },
    chip: 'bg-green-100 text-green-700',
  },
  moderate: {
    color: 'bg-yellow-500',
    pulse: 'bg-yellow-400',
    label: { es: 'Moderado', en: 'Moderate' },
    chip: 'bg-yellow-100 text-yellow-700',
  },
  seaweed: {
    color: 'bg-red-500',
    pulse: 'bg-red-400',
    label: { es: 'Sargazo', en: 'Seaweed' },
    chip: 'bg-red-100 text-red-700',
  },
};

function formatUpdatedAt(iso: string, lang: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const locale = lang === 'en' ? 'en-US' : 'es-MX';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Cancun',
  }).format(date);
}

function formatDay(dateStr: string, lang: string): string {
  const date = new Date(dateStr + 'T12:00:00Z');
  if (Number.isNaN(date.getTime())) return dateStr;
  const locale = lang === 'en' ? 'en-US' : 'es-MX';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export default function BeachStatus({
  dict,
  lang,
}: {
  dict: Record<string, unknown>;
  lang: string;
}) {
  const beachStatus = dict.beachStatus as Record<string, string>;
  const { zones, summary, updatedAt, recommendation, forecast, forecastDays, hurricaneAlert } =
    sargazoReport;
  const isEn = lang === 'en';
  const summaryText = summary[lang as keyof typeof summary] ?? summary.es;
  const recommendationText = recommendation?.[lang as keyof typeof recommendation];
  const forecastText = forecast?.[lang as keyof typeof forecast];
  const alertText = hurricaneAlert?.active
    ? hurricaneAlert.headline?.[lang as keyof NonNullable<typeof hurricaneAlert.headline>]
    : undefined;
  const updatedLabel =
    (isEn ? 'Updated' : 'Actualizado') + ' · ' + formatUpdatedAt(updatedAt, lang);

  return (
    <section className="bg-lagoon-bg py-16 lg:py-20" id="estado-playa">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {alertText && (
          <div
            role="alert"
            className="mb-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-body text-red-800"
          >
            <span aria-hidden="true" className="text-lg leading-none">🌀</span>
            <span>{alertText}</span>
          </div>
        )}

        <div className="text-center mb-10">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {zones.map((zone) => {
            const config = statusConfig[zone.status];
            return (
              <div
                key={zone.name}
                className="bg-shell rounded-xl border border-line p-4 flex flex-col items-center gap-3 transition-shadow hover:shadow-md"
              >
                <div className="relative">
                  <span className={`block w-3.5 h-3.5 rounded-full ${config.color}`} />
                  {zone.status === 'clean' && (
                    <span
                      className={`absolute inset-0 w-3.5 h-3.5 rounded-full ${config.pulse} animate-ping opacity-75`}
                    />
                  )}
                </div>

                <span className="font-display font-semibold text-sm text-ink text-center">
                  {zone.name}
                </span>

                <span className={`text-xs font-body font-medium px-2.5 py-0.5 rounded-full ${config.chip}`}>
                  {config.label[lang] ?? config.label.es}
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

        {recommendationText && (
          <div className="mx-auto max-w-2xl mt-6 rounded-2xl border border-sea/20 bg-sea/5 px-5 py-4 flex items-start gap-3">
            <span aria-hidden="true" className="text-xl leading-none">💡</span>
            <div>
              <p className="font-display font-semibold text-sm text-ink mb-0.5">
                {isEn ? 'Our tip for today' : 'Nuestra recomendación de hoy'}
              </p>
              <p className="text-ink-soft font-body text-sm leading-relaxed">
                {recommendationText}
              </p>
            </div>
          </div>
        )}

        {(forecastText || (forecastDays && forecastDays.length > 0)) && (
          <div className="mx-auto max-w-2xl mt-6">
            <p className="font-display font-semibold text-sm text-ink mb-3 flex items-center gap-2">
              <span aria-hidden="true">📅</span>
              {isEn ? 'Next days' : 'Próximos días'}
            </p>
            {forecastDays && forecastDays.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {forecastDays.map((day) => (
                  <div
                    key={day.date}
                    className="bg-shell rounded-xl border border-line p-3 flex flex-col items-center gap-1.5"
                  >
                    <span className="font-display font-semibold text-xs text-ink capitalize">
                      {formatDay(day.date, lang)}
                    </span>
                    <span
                      className={`block w-2.5 h-2.5 rounded-full ${
                        day.onshore ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      title={
                        day.onshore
                          ? isEn
                            ? 'Onshore wind (pushes sargassum in)'
                            : 'Viento onshore (empuja sargazo)'
                          : isEn
                            ? 'Offshore wind (pushes it away)'
                            : 'Viento offshore (lo aleja)'
                      }
                    />
                    <span className="text-[11px] font-body text-ink-soft">
                      {day.dir_cardinal} · {day.speed_kmh != null ? Math.round(day.speed_kmh) : '–'} km/h
                    </span>
                  </div>
                ))}
              </div>
            )}
            {forecastText && (
              <p className="text-ink-soft font-body text-sm leading-relaxed text-center">
                {forecastText}
              </p>
            )}
          </div>
        )}

        <p className="text-center text-xs text-ink-soft/60 font-body mt-6 flex items-center justify-center gap-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {updatedLabel}
        </p>
      </div>
    </section>
  );
}
