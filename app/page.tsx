'use client';

import { useCallback, useRef, useState } from 'react';
import type { GearCategory, MatchResult, UserStats } from '@/lib/types';
import { matchGear } from '@/lib/matcherLogic';
import gearDatabase from '@/lib/gearDatabase';
import InputForm from '@/components/InputForm';
import StickmanVisualizer from '@/components/StickmanVisualizer';
import Dashboard from '@/components/Dashboard';
import LoadingState from '@/components/LoadingState';
import { ArrowRightIcon, MountainIcon, SparkIcon, TagIcon, ThermometerIcon } from '@/components/Icons';

type Phase = 'form' | 'loading' | 'results';

const HOW_IT_WORKS = [
  {
    icon: <MountainIcon className="h-5 w-5" />,
    title: 'Sizing from your metrics',
    body: 'Height sets the base length, style shifts it 5–15 cm, ability adds or removes up to 6 cm, and body mass fine-tunes by ±5 cm.',
  },
  {
    icon: <SparkIcon className="h-5 w-5" />,
    title: 'Waist width & boot flex',
    body: 'Waist width follows your discipline — 72–84 mm carving through to 105–118 mm backcountry. Flex indexes are split by gender and ability.',
  },
  {
    icon: <ThermometerIcon className="h-5 w-5" />,
    title: 'Conditions drive optics & insulation',
    body: 'Freezing days pull high-VLT storm lenses and down insulation. Spring days pull low-VLT sun lenses and uninsulated shells.',
  },
  {
    icon: <TagIcon className="h-5 w-5" />,
    title: 'Budget-aware ranking',
    body: 'Your tier is a hard filter — items more than one tier away are dropped, and exact-tier matches are weighted heavily in the score.',
  },
];

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>('form');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<GearCategory | null>(null);
  const [lastStats, setLastStats] = useState<UserStats | undefined>(undefined);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback((stats: UserStats) => {
    setLastStats(stats);
    setPhase('loading');
    setActiveCategory(null);

    // Simulated compute window so the loading state is visible and the
    // transition into the dashboard feels deliberate rather than abrupt.
    window.setTimeout(() => {
      setResult(matchGear(stats, gearDatabase));
      setPhase('results');
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }, 950);
  }, []);

  const handleSelect = useCallback((category: GearCategory) => {
    setActiveCategory(category);
    const target = document.getElementById(`gear-${category}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleReset = useCallback(() => {
    setPhase('form');
    setResult(null);
    setActiveCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
      {/* ================= HERO ================= */}
      <section className="animate-fade-up text-center">
        <span className="pill mx-auto border-frost-400/30 bg-frost-500/10 text-frost-200">
          <SparkIcon className="h-3.5 w-3.5" />
          Gear matched to your body, not a size chart
        </span>

        <h2 className="mx-auto mt-5 max-w-4xl text-balance font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
          Stop guessing your{' '}
          <span className="gradient-text">ski length, boot flex and lens tint</span>.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-slate-400 sm:text-lg">
          Freezed takes your height, weight, ability, riding style, expected temperature and budget,
          then calculates a real spec sheet and matches it against a catalogue of skis, boards,
          boots, helmets, goggles and outerwear.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a href="#matcher" className="btn-primary">
            Build my loadout
            <ArrowRightIcon className="h-4 w-4" />
          </a>
          <a href="#how-it-works" className="btn-ghost">
            See the maths
          </a>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: `${gearDatabase.length}`, label: 'Catalogue items' },
            { value: '9', label: 'Brands' },
            { value: '5', label: 'Gear categories' },
            { value: '3', label: 'Budget tiers' },
          ].map((stat) => (
            <div key={stat.label} className="glass px-4 py-3">
              <p className="font-display text-2xl font-black tabular-nums text-white">{stat.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= MATCHER ================= */}
      <section id="matcher" ref={resultsRef} className="mt-16 scroll-mt-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:gap-8">
          {/* Visualizer rail */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <StickmanVisualizer
              activity={lastStats?.activity ?? 'ski'}
              recommendations={phase === 'results' && result ? result.recommendations : []}
              activeCategory={activeCategory}
              onHover={setActiveCategory}
              onSelect={handleSelect}
              specs={phase === 'results' && result ? result.specs : undefined}
            />

            {phase !== 'results' && (
              <p className="mt-3 px-1 text-xs leading-relaxed text-slate-500">
                Complete the questionnaire and every body zone lights up with the gear matched to it.
                Hover a marker to jump to its card.
              </p>
            )}
          </aside>

          {/* Form / loading / dashboard */}
          <div className="min-w-0">
            {phase === 'form' && (
              <div className="animate-fade-up">
                <InputForm onSubmit={handleSubmit} initialStats={lastStats} />
              </div>
            )}

            {phase === 'loading' && <LoadingState />}

            {phase === 'results' && result && (
              <Dashboard
                result={result}
                activeCategory={activeCategory}
                onHover={setActiveCategory}
                onSelect={handleSelect}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="mt-20 scroll-mt-24">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-frost-300">
            Under the hood
          </p>
          <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">
            How the matcher thinks
          </h2>
        </div>

        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((card) => (
            <div key={card.title} className="glass glass-hover p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-frost-400/25 bg-frost-500/10 text-frost-300">
                {card.icon}
              </div>
              <h3 className="font-display text-base font-bold text-white">{card.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="glass mt-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              One caveat worth repeating
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">
              These numbers are a well-reasoned starting point, not a fitting. Boots in particular
              should always be shell-fitted in person — the estimated Mondopoint size here is derived
              from height, and feet do not read the same chart.
            </p>
          </div>
          <a href="#matcher" className="btn-ghost shrink-0">
            Back to the matcher
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
