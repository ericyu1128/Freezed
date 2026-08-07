'use client';

import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LoadingState() {
  const { t } = useLanguage();
  const phases = t.loading.phases;
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setPhase((current) => (current + 1) % phases.length),
      750,
    );
    return () => window.clearInterval(timer);
  }, [phases.length]);

  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="glass-strong flex flex-col items-center gap-5 px-6 py-14 text-center">
        <div className="relative">
          <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-frost-400/40" />
          <Logo className="relative h-14 w-14 animate-float" />
        </div>

        <div>
          <h3 className="font-display text-xl font-bold text-white">{t.loading.heading}</h3>
          <p className="mt-1 h-5 text-sm text-frost-200 transition-all duration-300">
            {phases[phase]}
          </p>
        </div>

        <div className="h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[shimmer_1.4s_linear_infinite] rounded-full bg-gradient-to-r from-frost-500 via-neon-ice to-neon-violet" />
        </div>

        <span className="sr-only">{t.loading.srLabel}</span>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="glass overflow-hidden p-5">
            <div className="skeleton mb-4 h-40 w-full" />
            <div className="skeleton mb-2 h-4 w-1/3" />
            <div className="skeleton mb-4 h-6 w-2/3" />
            <div className="grid grid-cols-2 gap-2">
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
