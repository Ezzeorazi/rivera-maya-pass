import { WHATSAPP_PHONE } from '@/lib/site';

/**
 * Sección "te lo conseguimos" para el home cuando todavía no hay propiedades
 * cargadas (sin clientes de day pass firmados). Es honesta: no listamos
 * negocios que no representamos, captamos el lead por WhatsApp y lo cerramos
 * a demanda. Cuando se carguen propiedades reales (Supabase / /admin), el home
 * muestra la grilla en lugar de esta sección.
 */
export default function ConciergeSection({
  lang,
  dict,
}: {
  lang: string;
  dict: Record<string, unknown>;
}) {
  const c = dict.concierge as Record<string, string>;
  const isEn = lang === 'en';

  const categories = [
    { title: c.cat1Title, text: c.cat1Text },
    { title: c.cat2Title, text: c.cat2Text },
    { title: c.cat3Title, text: c.cat3Text },
  ];

  const waMessage = isEn
    ? 'Hi, I am looking for a day pass in Playa del Carmen. What options do you have?'
    : 'Hola, busco un day pass en Playa del Carmen. ¿Qué opciones tienen?';
  const waHref = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    waMessage
  )}`;

  return (
    <div className="text-center">
      <span className="inline-block uppercase tracking-widest text-coral text-xs font-bold font-body mb-2">
        {c.sectionLabel}
      </span>
      <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mb-3">
        {c.title}
      </h2>
      <p className="text-ink-soft font-body max-w-xl mx-auto mb-12">
        {c.subtitle}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="bg-shell rounded-2xl border border-line p-6 shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-lagoon-bg/60 flex items-center justify-center mb-4">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sea"
                aria-hidden="true"
              >
                <path d="M2 12h20" />
                <path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />
                <path d="M4 18v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-lg text-ink mb-1.5">
              {cat.title}
            </h3>
            <p className="text-ink-soft text-sm font-body leading-relaxed">
              {cat.text}
            </p>
          </div>
        ))}
      </div>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        data-track="whatsapp_click"
        data-track-label="concierge"
        className="inline-flex items-center gap-2 bg-coral text-white font-body font-bold px-8 py-4 text-lg rounded-xl hover:bg-coral/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-coral/25"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        {c.ctaButton}
      </a>
      <p className="text-ink-soft/70 text-sm font-body mt-4">{c.note}</p>
    </div>
  );
}
