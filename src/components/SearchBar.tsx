'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

export default function SearchBar({
  dict,
  lang,
}: {
  dict: Record<string, unknown>;
  lang: string;
}) {
  const search = dict.search as Record<string, string>;
  const router = useRouter();
  const [date, setDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );

  function handleSearch() {
    trackEvent('search', { date });
    // Por ahora el inventario reservable son los tours/experiencias.
    // Llevamos la búsqueda al catálogo en vivo de tours.
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    router.push(`/${lang}/tours?${params.toString()}`);
  }

  return (
    <div className="bg-shell rounded-2xl shadow-xl p-2 border border-line w-full max-w-2xl">
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        {/* Destination */}
        <div className="flex items-center gap-2.5 px-4 py-3 flex-1 rounded-xl bg-sand/60">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-sea shrink-0"
            aria-hidden="true"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft/60 font-body">
              {search.destination}
            </span>
            <span className="text-sm font-semibold text-ink font-body">
              Playa del Carmen
            </span>
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2.5 px-4 py-3 flex-1 rounded-xl bg-sand/60">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-sea shrink-0"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
          </svg>
          <div className="flex flex-col flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft/60 font-body">
              {search.date}
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm font-semibold text-ink font-body bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          type="button"
          onClick={handleSearch}
          className="bg-coral text-white font-body font-bold rounded-xl px-6 py-3 sm:py-0 hover:bg-coral/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-coral/25 flex items-center justify-center gap-2 shrink-0"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          {search.button}
        </button>
      </div>
    </div>
  );
}
