'use client';

import { useState } from 'react';

const WHATSAPP_PHONE = '5219841234567';

export default function PartnerForm({
  lang,
  dict,
}: {
  lang: string;
  dict: Record<string, string>;
}) {
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const intro =
      lang === 'en'
        ? 'Hi, I want to list my service on RivieraMayaPass.'
        : 'Hola, quiero anunciar mi servicio en RivieraMayaPass.';

    const lines = [
      intro,
      '',
      `${dict.formName}: ${name}`,
      service ? `${dict.formService}: ${service}` : '',
      phone ? `${dict.formPhone}: ${phone}` : '',
      message ? `${dict.formMessage}: ${message}` : '',
    ].filter(Boolean);

    const href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  const fieldClass =
    'w-full rounded-lg border border-ink-soft/30 bg-ink-soft/10 px-3 py-2.5 text-sm text-sand placeholder:text-lagoon/40 font-body outline-none transition-colors focus:border-coral focus:bg-ink-soft/20';
  const labelClass =
    'block font-body text-xs font-medium text-lagoon/70 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-name" className={labelClass}>
            {dict.formName}
          </label>
          <input
            id="pf-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={dict.formNamePlaceholder}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="pf-phone" className={labelClass}>
            {dict.formPhone}
          </label>
          <input
            id="pf-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={dict.formPhonePlaceholder}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="pf-service" className={labelClass}>
          {dict.formService}
        </label>
        <select
          id="pf-service"
          required
          value={service}
          onChange={(e) => setService(e.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>
            —
          </option>
          <option value={dict.formServiceTour}>{dict.formServiceTour}</option>
          <option value={dict.formServiceDaypass}>
            {dict.formServiceDaypass}
          </option>
          <option value={dict.formServiceOther}>{dict.formServiceOther}</option>
        </select>
      </div>

      <div>
        <label htmlFor="pf-message" className={labelClass}>
          {dict.formMessage}
        </label>
        <textarea
          id="pf-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={dict.formMessagePlaceholder}
          className={`${fieldClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-coral px-6 py-3 font-body font-bold text-white shadow-lg shadow-coral/25 transition-all hover:scale-[1.02] hover:bg-coral/90 active:scale-[0.98] sm:w-auto"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        {dict.formSubmit}
      </button>
    </form>
  );
}
