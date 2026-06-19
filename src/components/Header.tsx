'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({
  lang,
  dict,
}: {
  lang: string;
  dict: Record<string, unknown>;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const nav = dict.nav as Record<string, string>;

  const blog = dict.blog as Record<string, string>;

  const navItems = [
    { label: nav.home, href: `/${lang}` },
    { label: nav.properties, href: `/${lang}#propiedades` },
    { label: nav.beachStatus, href: `/${lang}#estado-playa` },
    { label: blog.sectionLabel, href: `/${lang}/blog` },
    { label: nav.contact, href: `/${lang}#contacto` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-sand/80 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ─── LOGO ───────────────────────────────────────────
               Tamaños: cambiá width/height en las dos Image de abajo.
               Mobile  → isotipo-logo.webp   (cuadrado, solo ícono)
               Desktop → imagotipo.webp      (cuadrado, ícono + texto)
          ─────────────────────────────────────────────────── */}
          <div className="flex items-center">
            <Link href={`/${lang}`} className="flex items-center">
              {/* Mobile: solo el ícono */}
              {/* Mobile: isotipo — ajustá width/height aquí */}
              <Image
                src="/isotipo-logo.webp"
                alt="RivieraMayaPass"
                width={60}
                height={60}
                className="md:hidden"
                priority
              />
              {/* Desktop: imagotipo — ajustá width/height aquí */}
              <Image
                src="/logotipo.webp"
                alt="RivieraMayaPass"
                width={180}
                height={180}
                className="hidden md:block"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-ink-soft hover:text-sea transition-colors rounded-lg hover:bg-lagoon-bg/50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher lang={lang} />

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-ink-soft hover:text-sea hover:bg-lagoon-bg/50 transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav
          className="border-t border-line bg-sand/95 backdrop-blur-md px-4 py-3 space-y-1"
          aria-label="Mobile navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-ink-soft hover:text-sea hover:bg-lagoon-bg/50 rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
