'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRegion } from '@/lib/region/RegionContext';
import type { Region } from '@/lib/retailers';

export default function RegionSwitch() {
  const { t } = useLanguage();
  const { region, setRegion } = useRegion();

  const options: { value: Region; label: string }[] = [
    { value: 'CA', label: t.regionSwitch.canada },
    { value: 'US', label: t.regionSwitch.unitedStates },
  ];

  return (
    <div
      role="group"
      aria-label={t.regionSwitch.ariaLabel}
      className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-0.5 text-xs font-semibold"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setRegion(option.value)}
          aria-pressed={region === option.value}
          className={`focus-ring whitespace-nowrap rounded-full px-2.5 py-1 transition-colors ${
            region === option.value ? 'bg-frost-400/20 text-frost-200' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
