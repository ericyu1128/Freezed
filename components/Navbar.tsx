'use client';

import Logo from './Logo';
import LanguageSwitch from './LanguageSwitch';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Navbar() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-glacier-1000/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9 shrink-0" />
          <div className="leading-none">
            <h1 className="font-display text-2xl font-black tracking-tight">
              <span className="gradient-text">Freezed</span>
            </h1>
            <p className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-400">
              {t.nav.madeBy}
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: '#matcher', label: t.nav.matcherLink },
            { href: '#how-it-works', label: t.nav.howItWorksLink },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="pill hidden sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-mint" />
            {t.nav.seasonBadge}
          </span>
          <LanguageSwitch />
          <a href="#matcher" className="btn-primary !px-4 !py-2 text-xs sm:text-sm">
            {t.nav.startMatching}
          </a>
        </div>
      </div>
    </header>
  );
}
