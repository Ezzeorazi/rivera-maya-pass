'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LanguageSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname();
  const otherLang = lang === 'es' ? 'en' : 'es';
  const newPathname = pathname.replace(`/${lang}`, `/${otherLang}`);

  return (
    <Link
      href={newPathname}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-ink-soft hover:text-sea border border-line rounded-full transition-colors bg-shell/60 backdrop-blur-sm"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {otherLang.toUpperCase()}
    </Link>
  );
}
