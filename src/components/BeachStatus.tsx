import Link from "next/link";
import { sargazoReport, type BeachStatusType, type HurricaneAlert } from "@/lib/sargazo";

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
  unknown: {
    color: 'bg-gray-400',
    pulse: 'bg-gray-300',
    label: { es: 'Sin dato', en: 'No data' },
    chip: 'bg-gray-100 text-gray-600',
  },
};

const confidenceChip: Record<string, string> = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-orange-100 text-orange-700',
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
  overrideAlert,
}: {
  dict: Record<string, unknown>;
  lang: string;
  /** Solo para vista previa en /admin: fuerza un banner de alerta sin publicarlo. */
  overrideAlert?: HurricaneAlert;
}) {
  const beachStatus = dict.beachStatus as Record<string, string>;
  const {
    zones,
    regionZones,
    summary,
    updatedAt,
    recommendation,
    forecast,
    forecastDays,
    hurricaneAlert,
    confidence,
    sources,
    overrideNote,
    temperatureC,
    prediction,
  } = sargazoReport;
  const predictionDays = prediction?.days ?? [];
  const predictionByDate: Record<string, (typeof predictionDays)[number]> = {};
  for (const p of predictionDays) predictionByDate[p.date] = p;
  const hasPrediction = predictionDays.length > 0;
  const accuracyPct =
    prediction?.accuracy != null ? Math.round(prediction.accuracy * 100) : null;
  const severity: Record<string, number> = { clean: 0, moderate: 1, seaweed: 2, unknown: 3 };
  const sortedRegion = regionZones
    ? [...regionZones].sort((a, b) => severity[a.status] - severity[b.status])
    : [];
  const isEn = lang === 'en';
  const tours = dict.tours as Record<string, string> | undefined;
  // Mostramos las alternativas de tours cuando Playa del Carmen tiene sargazo
  // en al menos 2 de sus zonas: es el momento donde el visitante busca un plan B.
  const pdcSeaweedCount = zones.filter((z) => z.status === 'seaweed').length;
  const showToursCta = Boolean(tours) && pdcSeaweedCount >= 2;
  const summaryText = summary[lang as keyof typeof summary] ?? summary.es;
  const overrideText = overrideNote?.[lang as keyof typeof overrideNote];
  const confidenceLabel = confidence
    ? beachStatus[
        'confidence' + confidence.charAt(0).toUpperCase() + confidence.slice(1)
      ]
    : undefined;
  const recommendationText = recommendation?.[lang as keyof typeof recommendation];
  const forecastText = forecast?.[lang as keyof typeof forecast];
  const effectiveAlert = overrideAlert ?? hurricaneAlert;
  const alertText = effectiveAlert?.active
    ? effectiveAlert.headline?.[lang as keyof NonNullable<typeof effectiveAlert.headline>]
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

        {beachStatus.pdcLabel && (
          <p className="font-display font-semibold text-sm text-ink mb-3 flex items-center gap-2">
            <span aria-hidden="true">📍</span>
            {beachStatus.pdcLabel}
          </p>
        )}

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

        {showToursCta && tours && (
          <div className="mx-auto max-w-2xl mt-6 rounded-2xl border border-coral/30 bg-coral/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <span aria-hidden="true" className="text-xl leading-none">🌴</span>
              <div>
                <p className="font-display font-semibold text-sm text-ink mb-0.5">
                  {tours.sargazoCtaTitle}
                </p>
                <p className="text-ink-soft font-body text-sm leading-relaxed">
                  {tours.sargazoCtaText}
                </p>
              </div>
            </div>
            <Link
              href={`/${lang}#tours`}
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-coral text-white font-body font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-coral/90 transition-colors shadow-sm"
            >
              {tours.sargazoCtaButton}
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

        {sortedRegion.length > 0 && (
          <div className="mx-auto max-w-2xl mt-8">
            <p className="font-display font-semibold text-sm text-ink mb-1 flex items-center gap-2">
              <span aria-hidden="true">🧭</span>
              {beachStatus.regionTitle}
            </p>
            <p className="text-ink-soft/80 font-body text-xs mb-3">
              {beachStatus.regionSubtitle}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {sortedRegion.map((zone) => {
                const config = statusConfig[zone.status];
                return (
                  <div
                    key={zone.name}
                    className="bg-shell rounded-xl border border-line p-3 flex flex-col items-center gap-2"
                  >
                    <span className={`block w-2.5 h-2.5 rounded-full ${config.color}`} />
                    <span className="font-display font-semibold text-xs text-ink text-center">
                      {zone.name}
                    </span>
                    <span
                      className={`text-[11px] font-body font-medium px-2 py-0.5 rounded-full ${config.chip}`}
                    >
                      {config.label[lang] ?? config.label.es}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(forecastText || (forecastDays && forecastDays.length > 0)) && (
          <div className="mx-auto max-w-2xl mt-8">
            <p className="font-display font-semibold text-sm text-ink mb-3 flex items-center gap-2">
              <span aria-hidden="true">{hasPrediction ? '📈' : '📅'}</span>
              {isEn ? 'Next days' : 'Próximos días'}
              {hasPrediction && (
                <span className="text-[11px] font-body font-normal text-ink-soft/70">
                  · {isEn ? 'estimate' : 'estimación'}
                </span>
              )}
            </p>
            {forecastDays && forecastDays.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {forecastDays.map((day) => {
                  const pred = predictionByDate[day.date];
                  const predConfig = pred ? statusConfig[pred.level] : null;
                  return (
                  <div
                    key={day.date}
                    className="bg-shell rounded-xl border border-line p-3 flex flex-col items-center gap-1.5"
                  >
                    <span className="font-display font-semibold text-xs text-ink capitalize">
                      {formatDay(day.date, lang)}
                    </span>
                    {predConfig ? (
                      <>
                        <span className={`block w-3 h-3 rounded-full ${predConfig.color}`} />
                        <span
                          className={`text-[11px] font-body font-medium px-2 py-0.5 rounded-full ${predConfig.chip}`}
                        >
                          {predConfig.label[lang] ?? predConfig.label.es}
                        </span>
                      </>
                    ) : (
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
                    )}
                    <span className="text-[11px] font-body text-ink-soft">
                      {day.dir_cardinal} · {day.speed_kmh != null ? Math.round(day.speed_kmh) : '–'} km/h
                    </span>
                    {(day.temp_max_c != null || day.temp_min_c != null) && (
                      <span className="text-[11px] font-body text-ink-soft/80">
                        🌡️ {day.temp_max_c != null ? Math.round(day.temp_max_c) : '–'}° /{' '}
                        {day.temp_min_c != null ? Math.round(day.temp_min_c) : '–'}°
                      </span>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
            {forecastText && (
              <p className="text-ink-soft font-body text-sm leading-relaxed text-center">
                {forecastText}
              </p>
            )}
            {hasPrediction && (
              <p className="text-[11px] text-ink-soft/60 font-body text-center mt-2 italic">
                {isEn
                  ? `Automatic estimate from weather + verified beach reports${
                      accuracyPct != null ? ` (~${accuracyPct}% accuracy)` : ''
                    }. Indicative only, may vary.`
                  : `Estimación automática (clima + semáforo verificado${
                      accuracyPct != null ? `, ~${accuracyPct}% de acierto` : ''
                    }). Es orientativa y puede variar.`}
              </p>
            )}
          </div>
        )}

        {overrideText && (
          <p className="mx-auto max-w-2xl text-center text-xs text-ink-soft/70 font-body italic mt-6">
            ✎ {overrideText}
          </p>
        )}

        <div className="text-center mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <p className="text-xs text-ink-soft/60 font-body flex items-center gap-1">
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
          {typeof temperatureC === 'number' && (
            <span className="text-[11px] font-body font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
              🌡️ {Math.round(temperatureC)}°C
            </span>
          )}
          {confidenceLabel && confidence && (
            <span
              className={`text-[11px] font-body font-medium px-2 py-0.5 rounded-full ${
                confidenceChip[confidence] ?? confidenceChip.medium
              }`}
            >
              {beachStatus.confidenceLabel}: {confidenceLabel}
            </span>
          )}
        </div>

        {sources && sources.length > 0 && (
          <p className="text-center text-[11px] text-ink-soft/50 font-body mt-3">
            {beachStatus.sourcesLabel}:{' '}
            {sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 && ' · '}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-sea"
                >
                  {s.title}
                </a>
              </span>
            ))}
          </p>
        )}

        {beachStatus.disclaimer && (
          <p className="mx-auto max-w-2xl text-center text-[11px] text-ink-soft/50 font-body mt-3">
            {beachStatus.disclaimer}
          </p>
        )}
      </div>
    </section>
  );
}
