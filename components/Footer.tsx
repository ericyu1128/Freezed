'use client';

import Logo from './Logo';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-24 border-t border-white/10 bg-glacier-1000/60 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
              <p className="font-display text-xl font-black tracking-tight">
                <span className="gradient-text">Freezed</span>
              </p>
              <p className="text-sm text-slate-400">
                {t.footer.madeBy} <span className="font-semibold text-frost-300">Eric Yu</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {t.footer.matcherHeading}
              </p>
              <ul className="space-y-1 text-slate-400">
                {t.footer.matcherItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {t.footer.retailersHeading}
              </p>
              <ul className="space-y-1 text-slate-400">
                <li>Evo</li>
                <li>REI</li>
                <li>Sport Chek</li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {t.footer.brandsHeading}
              </p>
              <ul className="space-y-1 text-slate-400">
                <li>Atomic · Völkl · Salomon</li>
                <li>K2 · Black Crows · Burton</li>
                <li>Arc&apos;teryx · Smith · Oakley</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="divider my-8" />

        <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footer.copyright(new Date().getFullYear())}</p>
          <p className="text-slate-500">{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
