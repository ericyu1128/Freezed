'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
  Activity,
  BudgetTier,
  Gender,
  Level,
  RidingStyle,
  Temperature,
  UserStats,
} from '@/lib/types';
import { LAST_STEP_INDEX, STEPS, indexOfStep, transition, type StepId } from '@/lib/stepFlow';
import { levelLabel, styleLabel, temperatureLabel, tierLabel } from '@/lib/matcherLogic';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  MountainIcon,
  SkiIcon,
  SnowboardIcon,
  SparkIcon,
  TagIcon,
  ThermometerIcon,
} from './Icons';

/* ------------------------------------------------------------------ */
/*  Option metadata                                                    */
/* ------------------------------------------------------------------ */

interface Option<T> {
  value: T;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

const ACTIVITY_ICONS: Record<Activity, React.ReactNode> = {
  ski: <SkiIcon className="h-6 w-6" />,
  snowboard: <SnowboardIcon className="h-6 w-6" />,
};

/* ------------------------------------------------------------------ */
/*  Step definitions                                                   */
/* ------------------------------------------------------------------ */

const DEFAULTS: UserStats = {
  activity: 'ski',
  gender: 'male',
  height: 175,
  weight: 75,
  level: 'intermediate',
  style: 'all-mountain',
  temperature: 'moderate',
  budgetTier: 'mid-range',
};

const HEIGHT_LIMITS = { min: 120, max: 215 };
const WEIGHT_LIMITS = { min: 30, max: 160 };

/* ------------------------------------------------------------------ */
/*  Reusable option card grid                                          */
/* ------------------------------------------------------------------ */

function OptionGrid<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
  name,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3;
  name: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={`grid gap-3 ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`option-card group ${active ? 'option-card-active' : ''}`}
          >
            <span
              className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 ${
                active ? 'bg-frost-400/30 opacity-100' : 'bg-frost-400/20 opacity-0 group-hover:opacity-100'
              }`}
            />
            <span className="flex w-full items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                {option.icon && (
                  <span className={active ? 'text-frost-300' : 'text-slate-400'}>{option.icon}</span>
                )}
                <span
                  className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-200'}`}
                >
                  {option.label}
                </span>
              </span>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  active
                    ? 'border-frost-300 bg-frost-400 text-glacier-1000'
                    : 'border-white/20 bg-transparent text-transparent'
                }`}
              >
                <CheckIcon className="h-3 w-3" />
              </span>
            </span>
            <span className="text-xs leading-relaxed text-slate-400">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Metric slider                                                      */
/* ------------------------------------------------------------------ */

function MetricSlider({
  label,
  unit,
  value,
  min,
  max,
  onChange,
  error,
  hint,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  error?: string;
  hint: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <label
            htmlFor={`metric-${label}`}
            className="text-xs font-semibold uppercase tracking-widest text-slate-400"
          >
            {label}
          </label>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        <div className="flex items-baseline gap-1.5">
          <input
            id={`metric-${label}`}
            type="number"
            inputMode="numeric"
            value={Number.isNaN(value) ? '' : value}
            min={min}
            max={max}
            onChange={(event) => onChange(Number.parseInt(event.target.value, 10))}
            className={`focus-ring w-24 rounded-lg border bg-glacier-900/70 px-3 py-2 text-right font-display text-2xl font-bold tabular-nums text-white transition-colors ${
              error ? 'border-rose-400/70' : 'border-white/10 focus:border-frost-400/60'
            }`}
          />
          <span className="text-sm font-medium text-slate-400">{unit}</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-frost-500 to-neon-ice shadow-glow transition-[width] duration-150"
          style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={Number.isNaN(value) ? min : value}
          onChange={(event) => onChange(Number.parseInt(event.target.value, 10))}
          aria-label={`${label} slider`}
          className="relative z-10 w-full"
        />
      </div>

      <div className="mt-2 flex justify-between text-[11px] tabular-nums text-slate-500">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs font-medium text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main form                                                          */
/* ------------------------------------------------------------------ */

interface InputFormProps {
  onSubmit: (stats: UserStats) => void;
  isLoading?: boolean;
  initialStats?: Partial<UserStats>;
}

export default function InputForm({ onSubmit, isLoading = false, initialStats }: InputFormProps) {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<UserStats>({ ...DEFAULTS, ...initialStats });
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [touched, setTouched] = useState(false);

  const ACTIVITY_OPTIONS: Option<Activity>[] = [
    { value: 'ski', ...t.form.activity.ski, icon: ACTIVITY_ICONS.ski },
    { value: 'snowboard', ...t.form.activity.snowboard, icon: ACTIVITY_ICONS.snowboard },
  ];
  const GENDER_OPTIONS: Option<Gender>[] = [
    { value: 'male', ...t.form.gender.male },
    { value: 'female', ...t.form.gender.female },
    { value: 'unisex', ...t.form.gender.unisex },
  ];
  const LEVEL_OPTIONS: Option<Level>[] = [
    { value: 'beginner', ...t.form.level.beginner },
    { value: 'intermediate', ...t.form.level.intermediate },
    { value: 'advanced', ...t.form.level.advanced },
    { value: 'expert', ...t.form.level.expert },
  ];
  const STYLE_OPTIONS: Option<RidingStyle>[] = [
    { value: 'piste', ...t.form.style.piste },
    { value: 'all-mountain', ...t.form.style['all-mountain'] },
    { value: 'freestyle', ...t.form.style.freestyle },
    { value: 'backcountry', ...t.form.style.backcountry },
  ];
  const TEMPERATURE_OPTIONS: Option<Temperature>[] = [
    { value: 'freezing', ...t.form.temperature.freezing },
    { value: 'moderate', ...t.form.temperature.moderate },
    { value: 'spring', ...t.form.temperature.spring },
  ];
  const BUDGET_OPTIONS: Option<BudgetTier>[] = [
    { value: 'budget', label: t.form.budget.budget.label, description: t.form.budget.budget.description },
    {
      value: 'mid-range',
      label: t.form.budget['mid-range'].label,
      description: t.form.budget['mid-range'].description,
    },
    { value: 'premium', label: t.form.budget.premium.label, description: t.form.budget.premium.description },
  ];
  const BUDGET_RANGE: Record<BudgetTier, string> = {
    budget: t.form.budget.budget.range,
    'mid-range': t.form.budget['mid-range'].range,
    premium: t.form.budget.premium.range,
  };

  const update = useCallback(
    <K extends keyof UserStats>(key: K, value: UserStats[K]) =>
      setStats((previous) => ({ ...previous, [key]: value })),
    [],
  );

  const heightError = useMemo(() => {
    if (Number.isNaN(stats.height)) return t.form.heightErrorRequired;
    if (stats.height < HEIGHT_LIMITS.min || stats.height > HEIGHT_LIMITS.max)
      return t.form.heightErrorRange(HEIGHT_LIMITS.min, HEIGHT_LIMITS.max);
    return undefined;
  }, [stats.height, t]);

  const weightError = useMemo(() => {
    if (Number.isNaN(stats.weight)) return t.form.weightErrorRequired;
    if (stats.weight < WEIGHT_LIMITS.min || stats.weight > WEIGHT_LIMITS.max)
      return t.form.weightErrorRange(WEIGHT_LIMITS.min, WEIGHT_LIMITS.max);
    return undefined;
  }, [stats.weight, t]);

  const currentStep: StepId = STEPS[step].id;
  const isLastStep = step === LAST_STEP_INDEX;

  const stepValid = useMemo(() => {
    if (currentStep === 'metrics') return !heightError && !weightError;
    return true;
  }, [currentStep, heightError, weightError]);

  /** Single funnel for every navigation intent — see lib/stepFlow.ts. */
  const move = (intent: 'next' | 'back' | 'jump' | 'submit', target?: number) => {
    const next = transition({ from: step, intent, stepIsValid: stepValid, target });

    if (next.blocked) {
      setTouched(true);
      return next;
    }

    setDirection(next.direction);
    if (next.to !== step) {
      setTouched(false);
      setStep(next.to);
    }
    return next;
  };

  const goNext = () => {
    setTouched(true);
    move('next');
  };

  const goBack = () => {
    move('back');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);

    if (heightError || weightError) {
      setDirection('back');
      setStep(indexOfStep('metrics'));
      return;
    }

    // A <form> submits implicitly on Enter from any focused field, so a submit
    // can arrive from any step. `transition` returns complete:false for every
    // step but the last, which is what stops an early submit from skipping the
    // budget step and generating results.
    const next = move('submit');
    if (next.complete) onSubmit(stats);
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const animation = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';

  return (
    <form onSubmit={handleSubmit} className="glass-strong overflow-hidden">
      {/* Progress rail */}
      <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4 sm:px-7">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-frost-300">
              {t.form.stepOf(step + 1, STEPS.length)}
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
              {t.form.steps[STEPS[step].id].title}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{t.form.steps[STEPS[step].id].blurb}</p>
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            <p className="font-display text-3xl font-black tabular-nums text-white/90">
              {Math.round(progress)}
              <span className="text-lg text-slate-500">%</span>
            </p>
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-frost-500 via-neon-ice to-neon-violet shadow-glow transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {STEPS.map((definition, index) => {
            const state = index === step ? 'current' : index < step ? 'done' : 'todo';
            return (
              <button
                key={definition.id}
                type="button"
                onClick={() => move('jump', index)}
                className={`focus-ring rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-300 ${
                  state === 'current'
                    ? 'bg-frost-400/20 text-frost-200 ring-1 ring-frost-400/50'
                    : state === 'done'
                      ? 'text-slate-300 hover:bg-white/5'
                      : 'text-slate-600'
                }`}
              >
                {state === 'done' && <CheckIcon className="mr-1 inline h-3 w-3 text-neon-mint" />}
                {t.form.steps[definition.id].title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step body */}
      <div className="min-h-[22rem] px-5 py-6 sm:px-7">
        <div key={step} className={animation}>
          {currentStep === 'discipline' && (
            <div className="space-y-6">
              <section>
                <SectionLabel icon={<MountainIcon className="h-4 w-4" />} text={t.form.sections.activity} />
                <OptionGrid
                  name={t.form.sections.activity}
                  options={ACTIVITY_OPTIONS}
                  value={stats.activity}
                  onChange={(value) => update('activity', value)}
                />
              </section>
              <section>
                <SectionLabel icon={<SparkIcon className="h-4 w-4" />} text={t.form.sections.fitScale} />
                <OptionGrid
                  name={t.form.sections.fitScale}
                  columns={3}
                  options={GENDER_OPTIONS}
                  value={stats.gender}
                  onChange={(value) => update('gender', value)}
                />
              </section>
            </div>
          )}

          {currentStep === 'metrics' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricSlider
                label={t.form.heightLabel}
                unit={t.form.heightUnit}
                hint={t.form.heightHint}
                value={stats.height}
                min={HEIGHT_LIMITS.min}
                max={HEIGHT_LIMITS.max}
                onChange={(value) => update('height', value)}
                error={touched ? heightError : undefined}
              />
              <MetricSlider
                label={t.form.weightLabel}
                unit={t.form.weightUnit}
                hint={t.form.weightHint}
                value={stats.weight}
                min={WEIGHT_LIMITS.min}
                max={WEIGHT_LIMITS.max}
                onChange={(value) => update('weight', value)}
                error={touched ? weightError : undefined}
              />
              <div className="glass col-span-full flex items-start gap-3 border-frost-400/20 bg-frost-500/[0.06] p-4">
                <SparkIcon className="mt-0.5 h-5 w-5 shrink-0 text-frost-300" />
                <p className="text-xs leading-relaxed text-slate-300">{t.form.metricsInfo}</p>
              </div>
            </div>
          )}

          {currentStep === 'ability' && (
            <div className="space-y-6">
              <section>
                <SectionLabel icon={<SparkIcon className="h-4 w-4" />} text={t.form.sections.abilityLevel} />
                <OptionGrid
                  name={t.form.sections.abilityLevel}
                  options={LEVEL_OPTIONS}
                  value={stats.level}
                  onChange={(value) => update('level', value)}
                />
              </section>
              <section>
                <SectionLabel icon={<MountainIcon className="h-4 w-4" />} text={t.form.sections.ridingStyle} />
                <OptionGrid
                  name={t.form.sections.ridingStyle}
                  options={STYLE_OPTIONS}
                  value={stats.style}
                  onChange={(value) => update('style', value)}
                />
              </section>
            </div>
          )}

          {currentStep === 'conditions' && (
            <div className="space-y-6">
              <section>
                <SectionLabel
                  icon={<ThermometerIcon className="h-4 w-4" />}
                  text={t.form.sections.typicalConditions}
                />
                <OptionGrid
                  name={t.form.sections.typicalConditions}
                  columns={3}
                  options={TEMPERATURE_OPTIONS}
                  value={stats.temperature}
                  onChange={(value) => update('temperature', value)}
                />
              </section>
              <div className="glass flex items-start gap-3 border-frost-400/20 bg-frost-500/[0.06] p-4">
                <ThermometerIcon className="mt-0.5 h-5 w-5 shrink-0 text-frost-300" />
                <p className="text-xs leading-relaxed text-slate-300">{t.form.conditionsInfo}</p>
              </div>
            </div>
          )}

          {currentStep === 'budget' && (
            <div className="space-y-6">
              <section>
                <SectionLabel icon={<TagIcon className="h-4 w-4" />} text={t.form.sections.budgetTier} />
                <div
                  role="radiogroup"
                  aria-label={t.form.sections.budgetTier}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {BUDGET_OPTIONS.map((option) => {
                    const active = option.value === stats.budgetTier;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => update('budgetTier', option.value)}
                        className={`option-card group ${active ? 'option-card-active' : ''}`}
                      >
                        <span
                          className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 ${
                            active ? 'bg-neon-violet/30 opacity-100' : 'opacity-0'
                          }`}
                        />
                        <span className="flex w-full items-center justify-between">
                          <span
                            className={`font-display text-base font-bold ${active ? 'text-white' : 'text-slate-200'}`}
                          >
                            {option.label}
                          </span>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                              active
                                ? 'border-frost-300 bg-frost-400 text-glacier-1000'
                                : 'border-white/20 text-transparent'
                            }`}
                          >
                            <CheckIcon className="h-3 w-3" />
                          </span>
                        </span>
                        <span className="text-xs leading-relaxed text-slate-400">
                          {option.description}
                        </span>
                        <span className="mt-2 inline-flex rounded-md bg-white/5 px-2 py-1 text-[11px] font-semibold tabular-nums text-frost-200">
                          {BUDGET_RANGE[option.value]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="glass p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {t.form.yourProfile}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="pill">
                    {stats.activity === 'ski' ? t.form.activity.ski.label : t.form.activity.snowboard.label}
                  </span>
                  <span className="pill">
                    {stats.height} {t.form.heightUnit}
                  </span>
                  <span className="pill">
                    {stats.weight} {t.form.weightUnit}
                  </span>
                  <span className="pill">{levelLabel(stats.level, language)}</span>
                  <span className="pill">{styleLabel(stats.style, language)}</span>
                  <span className="pill">{temperatureLabel(stats.temperature, language)}</span>
                  <span className="pill">{tierLabel(stats.budgetTier, language)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-white/[0.02] px-5 py-4 sm:px-7">
        <button type="button" onClick={goBack} disabled={step === 0} className="btn-ghost !py-2.5">
          <ArrowLeftIcon className="h-4 w-4" />
          {t.form.back}
        </button>

        {!isLastStep ? (
          <button key="continue" type="button" onClick={goNext} className="btn-primary !py-2.5">
            {t.form.continueBtn}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        ) : (
          <button key="submit" type="submit" disabled={isLoading} className="btn-primary !py-2.5">
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-glacier-1000/30 border-t-glacier-1000" />
                {t.form.matching}
              </>
            ) : (
              <>
                <SparkIcon className="h-4 w-4" />
                {t.form.matchMyGear}
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-frost-300">{icon}</span>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{text}</h3>
    </div>
  );
}
