'use client';

import { useState } from 'react';
import type { Activity, GearCategory, Recommendation } from '@/lib/types';
import { categoryLabel } from '@/lib/matcherLogic';
import { getPerformanceAxes } from '@/lib/performanceProfile';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { categoryIcon, CheckIcon, ExternalIcon, SparkIcon } from './Icons';
import GearImage from './GearImage';
import PerformanceHexagon from './PerformanceHexagon';

const TIER_STYLE: Record<string, string> = {
  budget: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  'mid-range': 'border-frost-400/30 bg-frost-400/10 text-frost-200',
  premium: 'border-neon-violet/40 bg-neon-violet/10 text-violet-200',
};

interface GearCardProps {
  recommendation: Recommendation;
  activity: Activity;
  isActive: boolean;
  onHover: (category: GearCategory | null) => void;
  onSelect: (category: GearCategory) => void;
}

export default function GearCard({
  recommendation,
  activity,
  isActive,
  onHover,
  onSelect,
}: GearCardProps) {
  const { t, language } = useLanguage();
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const { item, calculatedSpecs, reasoning, reasonBullets, score, bestPrice, alternates } =
    recommendation;

  const sortedPrices = [...item.prices].sort((a, b) => a.price - b.price);
  const spread = sortedPrices[sortedPrices.length - 1].price - sortedPrices[0].price;
  const performanceAxes = getPerformanceAxes(item.category, language);

  return (
    <article
      id={`gear-${recommendation.category}`}
      onMouseEnter={() => onHover(recommendation.category)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(recommendation.category)}
      className={`glass glass-hover group scroll-mt-28 overflow-hidden ${
        isActive ? 'border-frost-400/70 bg-white/[0.09] shadow-glow-lg ring-1 ring-frost-400/40' : ''
      }`}
    >
      {/* ---------- media ---------- */}
      <div className="relative">
        <GearImage
          src={item.image}
          alt={`${item.brand} ${item.name}`}
          category={item.category}
          activity={activity}
          className="h-44 w-full sm:h-52"
        />

        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-glacier-1000/70 px-2.5 py-1 text-[11px] font-semibold text-slate-200 backdrop-blur">
            <span className="text-frost-300">
              {categoryIcon(recommendation.category, activity, 'h-3.5 w-3.5')}
            </span>
            {categoryLabel(recommendation.category, activity, language)}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur ${
              TIER_STYLE[item.priceTier]
            }`}
          >
            {t.form.budget[item.priceTier].label}
          </span>
        </div>

        {/* confidence ring */}
        <div className="absolute right-4 top-4">
          <ScoreRing score={score} />
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-frost-300">
            {item.brand}
          </p>
          <h3 className="font-display text-xl font-bold leading-tight text-white drop-shadow-sm sm:text-2xl">
            {item.name}
          </h3>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-sm leading-relaxed text-slate-400">{item.description}</p>

        {/* ---------- performance hexagon ---------- */}
        <section>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {t.gearCard.performanceProfile}
          </h4>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 sm:flex-row">
            <PerformanceHexagon
              profile={item.performance}
              category={item.category}
              className="h-40 w-40 shrink-0"
            />
            <dl className="grid w-full grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {performanceAxes.map((axis) => {
                const value = item.performance[axis.key];
                return (
                  <div key={axis.key} className="flex items-center justify-between gap-2">
                    <dt className="truncate text-xs text-slate-400">{axis.label}</dt>
                    <dd className="flex shrink-0 items-center gap-1.5">
                      <span className="h-1.5 w-10 overflow-hidden rounded-full bg-white/10">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-frost-400 to-neon-mint"
                          style={{ width: `${(value / 10) * 100}%` }}
                        />
                      </span>
                      <span className="w-7 text-right text-xs font-bold tabular-nums text-slate-200">
                        {value.toFixed(1)}
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </section>

        {/* ---------- calculated specs ---------- */}
        <section>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {t.gearCard.calculatedForYou}
          </h4>
          <dl className="grid gap-2 sm:grid-cols-2">
            {calculatedSpecs.map((row) => (
              <div
                key={row.label}
                className={`rounded-xl border px-3 py-2 transition-colors ${
                  row.highlight
                    ? 'border-frost-400/35 bg-frost-500/[0.09]'
                    : 'border-white/8 bg-white/[0.025]'
                }`}
              >
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {row.label}
                </dt>
                <dd
                  className={`mt-0.5 text-sm font-bold tabular-nums ${
                    row.highlight ? 'text-frost-200' : 'text-slate-200'
                  }`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------- manufacturer specs ---------- */}
        <section>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowAllSpecs((previous) => !previous);
            }}
            className="focus-ring flex w-full items-center justify-between rounded-lg py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-slate-300"
          >
            {t.gearCard.fullManufacturerSpecs}
            <span
              className={`text-base transition-transform duration-300 ${
                showAllSpecs ? 'rotate-45' : ''
              }`}
            >
              +
            </span>
          </button>
          <div
            className={`grid overflow-hidden transition-all duration-300 ${
              showAllSpecs ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="min-h-0">
              <dl className="divide-y divide-white/5 rounded-xl border border-white/8 bg-white/[0.02]">
                {Object.entries(item.specs).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-4 px-3 py-2">
                    <dt className="text-xs capitalize text-slate-500">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className="text-right text-xs font-medium text-slate-300">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ---------- price comparison ---------- */}
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t.gearCard.priceComparison}
            </h4>
            {spread > 0 && (
              <span className="text-[11px] font-medium text-emerald-300">
                {t.gearCard.save(`$${spread.toFixed(2)}`)}
              </span>
            )}
          </div>
          <ul className="space-y-1.5">
            {sortedPrices.map((price, index) => {
              const isBest = index === 0;
              return (
                <li key={price.retailer}>
                  <a
                    href={price.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className={`focus-ring flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition-all duration-200 ${
                      isBest
                        ? 'border-emerald-400/35 bg-emerald-400/[0.08] hover:border-emerald-300/60'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={`truncate text-sm font-medium ${
                          isBest ? 'text-emerald-100' : 'text-slate-300'
                        }`}
                      >
                        {price.retailer}
                      </span>
                      {isBest && (
                        <span className="shrink-0 rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                          {t.gearCard.best}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          isBest ? 'text-emerald-200' : 'text-slate-200'
                        }`}
                      >
                        ${price.price.toFixed(2)}
                      </span>
                      <ExternalIcon className="h-3.5 w-3.5 text-slate-500" />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------- explanation ---------- */}
        <section className="relative overflow-hidden rounded-2xl border border-frost-400/25 bg-gradient-to-br from-frost-500/[0.12] via-white/[0.03] to-neon-violet/[0.08] p-4">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-frost-400/20 blur-2xl" />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2">
              <SparkIcon className="h-4 w-4 text-frost-300" />
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-frost-200">
                {t.gearCard.whyThisMatches}
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{reasoning}</p>
            <ul className="mt-3 space-y-1.5">
              {reasonBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-neon-mint" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- alternates ---------- */}
        {alternates.length > 0 && (
          <section>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t.gearCard.alsoConsidered}
            </h4>
            <div className="flex flex-wrap gap-2">
              {alternates.map((alternate) => {
                const cheapest = [...alternate.prices].sort((a, b) => a.price - b.price)[0];
                return (
                  <a
                    key={alternate.id}
                    href={cheapest.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    title={`Search ${cheapest.retailer} for ${alternate.brand} ${alternate.name}`}
                    className="pill focus-ring transition-colors hover:border-frost-400/40 hover:bg-white/10 hover:text-white"
                  >
                    {alternate.brand} {alternate.name}
                    <span className="text-slate-500">${cheapest.price.toFixed(0)}</span>
                    <ExternalIcon className="h-3 w-3 text-slate-500" />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {t.gearCard.bestPrice}
            </p>
            <p className="font-display text-xl font-black tabular-nums text-white">
              ${bestPrice.price.toFixed(2)}
              <span className="ml-1.5 text-xs font-medium text-slate-500">
                {t.gearCard.at} {bestPrice.retailer}
              </span>
            </p>
          </div>
          <a
            href={bestPrice.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="btn-primary !px-4 !py-2.5 text-xs"
          >
            {t.gearCard.viewDeal}
            <ExternalIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */

function ScoreRing({ score }: { score: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-12 w-12">
      <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={radius} fill="rgba(5,10,20,0.7)" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="url(#score-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="score-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-[13px] font-black tabular-nums text-white">
        {score}
      </span>
    </div>
  );
}
