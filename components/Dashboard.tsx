'use client';

import { useState } from 'react';
import type { GearCategory, MatchResult, UserStats } from '@/lib/types';
import {
  LEVEL_LABEL,
  STYLE_LABEL,
  TEMPERATURE_LABEL,
  TIER_LABEL,
  categoryLabel,
} from '@/lib/matcherLogic';
import { addSavedSetup } from '@/lib/savedSetups';
import GearCard from './GearCard';
import SaveConfigurationModal from './SaveConfigurationModal';
import SavedVault from './SavedVault';
import { MountainIcon, RefreshIcon, SaveIcon, SparkIcon, TagIcon, ThermometerIcon } from './Icons';

interface DashboardProps {
  result: MatchResult;
  activeCategory: GearCategory | null;
  onHover: (category: GearCategory | null) => void;
  onSelect: (category: GearCategory) => void;
  onReset: () => void;
  onLoadSetup: (stats: UserStats) => void;
}

export default function Dashboard({
  result,
  activeCategory,
  onHover,
  onSelect,
  onReset,
  onLoadSetup,
}: DashboardProps) {
  const { stats, specs, recommendations, totalBestPrice } = result;
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [vaultRefreshToken, setVaultRefreshToken] = useState(0);

  const handleSaveConfiguration = (name: string) => {
    addSavedSetup(name, result);
    setVaultRefreshToken((token) => token + 1);
    setSaveModalOpen(false);
  };

  const profilePills: { icon?: React.ReactNode; label: string; accent?: boolean }[] = [
    { icon: <MountainIcon className="h-3.5 w-3.5" />, label: stats.activity === 'ski' ? 'Ski' : 'Snowboard' },
    { label: `${stats.height} cm` },
    { label: `${stats.weight} kg` },
    { label: stats.gender === 'unisex' ? 'Unisex fit' : stats.gender === 'female' ? "Women's fit" : "Men's fit" },
    { icon: <SparkIcon className="h-3.5 w-3.5" />, label: LEVEL_LABEL[stats.level] },
    { label: STYLE_LABEL[stats.style] },
    { icon: <ThermometerIcon className="h-3.5 w-3.5" />, label: TEMPERATURE_LABEL[stats.temperature] },
    {
      icon: <TagIcon className="h-3.5 w-3.5" />,
      label: `${stats.budgetTier.replace('-', ' ')} — ${TIER_LABEL[stats.budgetTier]}`,
      accent: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ---------- profile summary ---------- */}
      <section className="glass-strong animate-fade-up overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-frost-300">
              Recommendation dashboard
            </p>
            <h2 className="mt-1 font-display text-2xl font-black text-white sm:text-3xl">
              {recommendations.length} pieces matched to your profile
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SavedVault onLoad={onLoadSetup} refreshToken={vaultRefreshToken} />
            <button type="button" onClick={() => setSaveModalOpen(true)} className="btn-ghost !py-2.5">
              <SaveIcon className="h-4 w-4" />
              Save Configuration
            </button>
            <button type="button" onClick={onReset} className="btn-ghost !py-2.5">
              <RefreshIcon className="h-4 w-4" />
              Start over
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {profilePills.map((pill) => (
            <span
              key={pill.label}
              className={`pill capitalize ${
                pill.accent ? 'border-frost-400/40 bg-frost-500/10 text-frost-200' : ''
              }`}
            >
              {pill.icon}
              {pill.label}
            </span>
          ))}
        </div>

        <div className="divider my-5" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryTile
            label={specs.length.label}
            value={`${specs.length.value} cm`}
            sub={`Window ${specs.length.range.min}–${specs.length.range.max} cm`}
            accent
          />
          <SummaryTile
            label="Boot flex target"
            value={`${specs.bootFlex.min}–${specs.bootFlex.max}`}
            sub={specs.bootFlexLabel}
          />
          <SummaryTile
            label="Goggle VLT target"
            value={`${specs.vlt.min}–${specs.vlt.max}%`}
            sub={TEMPERATURE_LABEL[stats.temperature]}
          />
          <SummaryTile
            label="Kit total (best prices)"
            value={`$${totalBestPrice.toFixed(2)}`}
            sub={`${recommendations.length} items · cheapest retailer each`}
          />
        </div>
      </section>

      {/* ---------- sizing derivation ---------- */}
      <section className="glass animate-fade-up p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <SparkIcon className="h-4 w-4 text-frost-300" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            How we calculated your {specs.length.label.toLowerCase()}
          </h3>
        </div>

        <ol className="space-y-2">
          {specs.length.steps.map((step, index) => (
            <li
              key={step.label}
              className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-[10px] font-bold text-slate-400">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-200">{step.label}</span>
                  <span
                    className={`font-display text-sm font-bold tabular-nums ${
                      index === 0
                        ? 'text-slate-300'
                        : step.delta > 0
                          ? 'text-emerald-300'
                          : 'text-rose-300'
                    }`}
                  >
                    {index === 0 ? `${step.delta} cm` : `${step.delta > 0 ? '+' : ''}${step.delta} cm`}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                  {step.note}
                </span>
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between rounded-xl border border-frost-400/35 bg-frost-500/10 px-3 py-3">
            <span className="text-sm font-bold text-frost-100">Recommended {specs.length.label.toLowerCase()}</span>
            <span className="font-display text-lg font-black tabular-nums text-white">
              {specs.length.value} cm
            </span>
          </li>
        </ol>

        {specs.poleLength && (
          <p className="mt-3 text-xs text-slate-500">
            Pole length for your height: <span className="font-semibold text-slate-300">{specs.poleLength} cm</span>.
            Estimated Mondopoint boot size: <span className="font-semibold text-slate-300">{specs.mondoSize.toFixed(1)}</span>.
          </p>
        )}
        {!specs.poleLength && (
          <p className="mt-3 text-xs text-slate-500">
            Estimated Mondopoint boot size:{' '}
            <span className="font-semibold text-slate-300">{specs.mondoSize.toFixed(1)}</span> ·{' '}
            {specs.waistWidthLabel}.
          </p>
        )}
      </section>

      {/* ---------- category jump bar ---------- */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {recommendations.map((rec) => (
          <button
            key={rec.category}
            type="button"
            onMouseEnter={() => onHover(rec.category)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(rec.category)}
            className={`focus-ring shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${
              activeCategory === rec.category
                ? 'border-frost-400/70 bg-frost-400/15 text-white shadow-glow'
                : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200'
            }`}
          >
            {categoryLabel(rec.category, stats.activity)}
          </button>
        ))}
      </div>

      {/* ---------- gear grid ---------- */}
      {recommendations.length === 0 ? (
        <EmptyState onReset={onReset} />
      ) : (
        <div className="stagger grid gap-5 xl:grid-cols-2">
          {recommendations.map((rec) => (
            <GearCard
              key={rec.item.id}
              recommendation={rec}
              activity={stats.activity}
              isActive={activeCategory === rec.category}
              onHover={onHover}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      <SaveConfigurationModal
        open={saveModalOpen}
        itemCount={recommendations.length}
        totalPrice={totalBestPrice}
        onClose={() => setSaveModalOpen(false)}
        onSave={handleSaveConfiguration}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SummaryTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent ? 'border-frost-400/35 bg-frost-500/[0.09]' : 'border-white/10 bg-white/[0.025]'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p
        className={`mt-1 font-display text-2xl font-black tabular-nums ${
          accent ? 'text-frost-200' : 'text-white'
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-slate-500" title={sub}>
        {sub}
      </p>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="glass flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <MountainIcon className="h-8 w-8 text-slate-500" />
      </div>
      <div>
        <h3 className="font-display text-lg font-bold text-white">No gear cleared the filters</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
          Nothing in the catalogue matched that combination of discipline and budget. Widen the
          budget tier or change the riding style and run it again.
        </p>
      </div>
      <button type="button" onClick={onReset} className="btn-ghost">
        <RefreshIcon className="h-4 w-4" />
        Adjust my profile
      </button>
    </div>
  );
}
