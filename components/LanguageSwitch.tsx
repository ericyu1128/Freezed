'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.languageSwitch.ariaLabel}
      className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-0.5 text-xs font-semibold"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`focus-ring rounded-full px-2.5 py-1 transition-colors ${
          language === 'en' ? 'bg-frost-400/20 text-frost-200' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {t.languageSwitch.english}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('zh')}
        aria-pressed={language === 'zh'}
        className={`focus-ring rounded-full px-2.5 py-1 transition-colors ${
          language === 'zh' ? 'bg-frost-400/20 text-frost-200' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {t.languageSwitch.chinese}
      </button>
    </div>
  );
}
