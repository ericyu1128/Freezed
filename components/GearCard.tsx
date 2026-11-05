'use client';

import { useMemo, useState } from 'react';
import type { Activity, CalculatedSpecs, GearCategory, Recommendation, UserStats } from '@/lib/types';
import { buildCalculatedSpecs, buildReasonBullets, buildReasoning, categoryLabel } from '@/lib/matcherLogic';
import { featureLabel } from '@/lib/compatibilityScore';
import { itemDescription, specKeyLabel } from '@/lib/i18n/gearCopy';
import { getPerformanceAxes } from '@/lib/performanceProfile';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRegion } from '@/lib/region/RegionContext';
import { track } from '@/lib/analytics';
import { getRetailer, SHOW_RETAILER_LINKS } from '@/lib/retailers';
import {
  bestPriceFor,
  formatCheckedDate,
  formatPrice,
  isPriced,
  pricesForRegion,
  primaryLinkFor,
  sortForDisplay,
  withFrom,
} from '@/lib/pricing';
import { categoryIcon, CheckIcon, ExternalIcon, SparkIcon } from './Icons';
import GearImage from './GearImage';
import PerformanceHexagon from './PerformanceHexagon';
import RetailerLink from './RetailerLink';

const TIER_STYLE: Record<string, string> = {
  budget: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  'mid-range': 'border-frost-400/30 bg-frost-400/10 text-frost-200',
  premium: 'border-neon-violet/40 bg-neon-violet/10 text-violet-200',
};

interface GearCardProps {
  recommendation: Recommendation;
  stats: UserStats;
  specs: CalculatedSpecs;
  activity: Activity;
  isActive: boolean;
  onHover: (category: GearCategory | null) => void;
  onSelect: (category: GearCategory) => void;
}

export default function GearCard({
  recommendation,
  stats,
  specs,
  activity,
  isActive,
  onHover,
  onSelect,
}: GearCardProps) {
  const { t, language } = useLanguage();
  const { region } = useRegion();
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const { candidates } = recommendation;
  const [selectedId, setSelectedId] = useState(recommendation.item.id);

  const activeCandidate = candidates.find((candidate) => candidate.item.id === selectedId) ?? candidates[0];
  const isTopPick = activeCandidate.item.id === recommendation.item.id;
  const activeRank = candidates.indexOf(activeCandidate) + 1;
  const { item, score, breakdown } = activeCandidate;

  // Generated at render time in the current language, like buildCalculatedSpecs,
  // so switching language updates a result that is already on screen.
  const { reasoning, reasonBullets } = useMemo(
    () => ({
      reasoning: buildReasoning(item, stats, specs, language, activeRank),
      reasonBullets: buildReasonBullets(item, stats, specs, language),
    }),
    [item, stats, specs, language, activeRank],
  );

  const calculatedSpecs = buildCalculatedSpecs(item, stats, specs, language);

  // Only the selected region's retailers, in their own currency — never converted.
  const sortedPrices = sortForDisplay(pricesForRegion(item, region));
  const pricedRows = sortedPrices.filter(isPriced);
  const bestPrice = pricedRows[0] ?? null;
  const spread = pricedRows.length > 1 ? pricedRows[pricedRows.length - 1].price - pricedRows[0].price : 0;
  const primaryLink = primaryLinkFor(item, region);
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

        {/* compatibility score ring */}
        <div className="absolute right-4 top-4">
          <ScoreRing score={score} label={t.gearCard.compatibilityScore} />
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
        <p className="text-sm leading-relaxed text-slate-400">{itemDescription(item, language)}</p>

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
                    <dt className="text-xs capitalize text-slate-500">{specKeyLabel(key, language)}</dt>
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
            {/* A "from" best price only holds for some sizes/colours, so it can't promise a saving. */}
            {spread > 0 && bestPrice && !bestPrice.priceFrom && (
              <span className="text-[11px] font-medium text-emerald-300">
                {t.gearCard.save(formatPrice(spread, bestPrice.currency))}
              </span>
            )}
          </div>
          <ul className="space-y-1.5">
            {sortedPrices.map((price) => {
              const isBest = bestPrice !== null && price.retailerId === bestPrice.retailerId;
              const retailerName = getRetailer(price.retailerId).name;
              const rowContent = (
                <>
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`truncate text-sm font-medium ${
                        isBest ? 'text-emerald-100' : 'text-slate-300'
                      }`}
                    >
                      {retailerName}
                    </span>
                    {isBest && (
                      <span className="shrink-0 rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                        {t.gearCard.best}
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {price.price !== null ? (
                      <span className="flex flex-col items-end">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            isBest ? 'text-emerald-200' : 'text-slate-200'
                          }`}
                        >
                          {withFrom(formatPrice(price.price, price.currency), price.priceFrom, t.gearCard.fromPrice)}
                        </span>
                        {price.checkedAt && (
                          <span className="text-[10px] text-slate-500">
                            {t.gearCard.checkedOn(formatCheckedDate(price.checkedAt, language))}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        {SHOW_RETAILER_LINKS ? t.gearCard.checkPrice : t.gearCard.noPriceYet}
                      </span>
                    )}
                    {SHOW_RETAILER_LINKS && price.price !== null && (
                      <ExternalIcon className="h-3.5 w-3.5 text-slate-500" />
                    )}
                  </span>
                </>
              );
              return (
                <li key={price.retailerId}>
                  {SHOW_RETAILER_LINKS ? (
                    <RetailerLink
                      href={price.link}
                      ariaLabel={t.gearCard.viewAtRetailer(`${item.brand} ${item.name}`, retailerName)}
                      tracking={{
                        retailer_id: price.retailerId,
                        region,
                        item_id: item.id,
                        category: recommendation.category,
                        rank: activeRank,
                        is_top_pick: isTopPick,
                        has_price: price.price !== null,
                      }}
                      className={`focus-ring flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition-all duration-200 ${
                        isBest
                          ? 'border-emerald-400/35 bg-emerald-400/[0.08] hover:border-emerald-300/60'
                          : 'border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                    >
                      {rowContent}
                    </RetailerLink>
                  ) : (
                    <div
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                        isBest
                          ? 'border-emerald-400/35 bg-emerald-400/[0.08]'
                          : 'border-white/8 bg-white/[0.02]'
                      }`}
                    >
                      {rowContent}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {SHOW_RETAILER_LINKS && (
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{t.gearCard.affiliateDisclosure}</p>
          )}
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

            <div className="mt-4 border-t border-white/10 pt-3">
              <h5 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {t.gearCard.compatibilityBreakdown}
              </h5>
              <dl className="space-y-1.5">
                {breakdown.map((feature) => (
                  <div key={feature.key} className="flex items-center gap-2">
                    <dt className="w-28 shrink-0 truncate text-[11px] text-slate-500">
                      {featureLabel(feature.key, item.category, language)}
                    </dt>
                    <dd className="flex flex-1 items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-frost-400 to-neon-mint"
                          style={{ width: `${Math.round(feature.fit * 100)}%` }}
                        />
                      </span>
                      <span className="w-9 shrink-0 text-right text-[11px] font-bold tabular-nums text-slate-300">
                        {Math.round(feature.fit * 100)}%
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ---------- ranked matches ---------- */}
        {candidates.length > 1 && (
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {t.gearCard.rankedMatches(candidates.length)}
              </h4>
              <span className="text-[11px] font-medium text-slate-500">{t.gearCard.sortedByMatch}</span>
            </div>
            <ul className="space-y-1.5">
              {candidates.map((candidate, index) => {
                const isSelected = candidate.item.id === activeCandidate.item.id;
                const candidateName = `${candidate.item.brand} ${candidate.item.name}`;
                const candidateBest = bestPriceFor(candidate.item, region);
                const candidateLink = primaryLinkFor(candidate.item, region);
                return (
                  <li key={candidate.item.id} className="flex items-stretch gap-1.5">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(candidate.item.id);
                        track('candidate_selected', {
                          category: recommendation.category,
                          item_id: candidate.item.id,
                          rank: index + 1,
                        });
                      }}
                      className={`focus-ring flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-frost-400/50 bg-frost-400/[0.08]'
                          : 'border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-black tabular-nums ${
                            candidate.score >= 70
                              ? 'bg-emerald-400/15 text-emerald-200'
                              : candidate.score >= 45
                                ? 'bg-amber-400/15 text-amber-200'
                                : 'bg-rose-400/15 text-rose-200'
                          }`}
                        >
                          {candidate.score}%
                        </span>
                        <span className="truncate text-sm font-medium text-slate-300">
                          {candidate.item.brand} {candidate.item.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-bold tabular-nums text-slate-400">
                        {candidateBest
                          ? withFrom(
                              formatPrice(candidateBest.price, candidateBest.currency),
                              candidateBest.priceFrom,
                              t.gearCard.fromPrice,
                            )
                          : '—'}
                      </span>
                    </button>
                    {SHOW_RETAILER_LINKS && candidateLink && (
                      <RetailerLink
                        href={candidateLink.link}
                        ariaLabel={t.gearCard.viewAtRetailer(
                          candidateName,
                          getRetailer(candidateLink.retailerId).name,
                        )}
                        tracking={{
                          retailer_id: candidateLink.retailerId,
                          region,
                          item_id: candidate.item.id,
                          category: recommendation.category,
                          rank: index + 1,
                          is_top_pick: index === 0,
                          has_price: candidateBest !== null,
                        }}
                        className="focus-ring flex w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-slate-400 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05] hover:text-frost-200"
                      >
                        <ExternalIcon className="h-3.5 w-3.5" />
                      </RetailerLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {t.gearCard.bestPrice}
            </p>
            {bestPrice ? (
              <p className="font-display text-xl font-black tabular-nums text-white">
                {withFrom(formatPrice(bestPrice.price, bestPrice.currency), bestPrice.priceFrom, t.gearCard.fromPrice)}
                <span className="ml-1.5 text-xs font-medium text-slate-500">
                  {t.gearCard.at} {getRetailer(bestPrice.retailerId).name}
                </span>
              </p>
            ) : (
              <p className="font-display text-base font-bold text-slate-400">{t.gearCard.noPriceYet}</p>
            )}
          </div>
          {SHOW_RETAILER_LINKS && primaryLink && (
            <RetailerLink
              href={primaryLink.link}
              ariaLabel={t.gearCard.viewAtRetailer(`${item.brand} ${item.name}`, getRetailer(primaryLink.retailerId).name)}
              tracking={{
                retailer_id: primaryLink.retailerId,
                region,
                item_id: item.id,
                category: recommendation.category,
                rank: activeRank,
                is_top_pick: isTopPick,
                has_price: bestPrice !== null,
              }}
              className="btn-primary shrink-0 !px-4 !py-2.5 text-xs"
            >
              {bestPrice ? t.gearCard.viewDeal : t.gearCard.checkPrice}
              {bestPrice && <ExternalIcon className="h-3.5 w-3.5" />}
            </RetailerLink>
          )}
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */

function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-12 w-12" role="img" aria-label={`${label}: ${score}%`}>
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
