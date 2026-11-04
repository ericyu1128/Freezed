/**
 * Freezed — weighted fit scoring
 * Made by Eric Yu
 *
 * Replaces hard pass/fail spec matching with a deterministic weighted fit
 * model (no probability distribution, random variable or inference is
 * involved). Each feature produces a fit in [0, 1]. Every numeric spec
 * (waist width, boot flex, DIN, VLT, warmth) is scored against its target
 * with a Gaussian-shaped falloff instead of an in-range/out-of-range cliff,
 * so gear that's slightly too long or too stiff loses points proportionally
 * instead of being discarded outright. Ability level is ordinal: the fit
 * falls with the distance between the rider's level and the nearest level
 * the item is rated for. Categorical preferences (style, gender,
 * temperature, budget) contribute floored fits — a mismatch reduces the
 * score but never zeroes it.
 * The final score is the weight-normalized average of every applicable
 * feature fit, expressed as a 0-100% Compatibility Score.
 */

import type {
  BudgetTier,
  CalculatedSpecs,
  FeatureContribution,
  Gender,
  GearCategory,
  GearItem,
  Level,
  NumericRange,
  UserStats,
} from './types';

const TIER_INDEX: Record<BudgetTier, number> = { budget: 0, 'mid-range': 1, premium: 2 };

const LEVEL_INDEX: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Gaussian falloff from a target window: fit = 1.0 for any value inside
 * [min, max], decaying smoothly outside it. `sigma` — the distance at which
 * fit has dropped to ~61% — scales with the window's own width by default,
 * so a rider whose target window is wide (e.g. all-mountain waist width)
 * tolerates more absolute deviation than one whose window is narrow (e.g. a
 * dialed-in park ski), rather than applying one fixed cutoff to everyone.
 * `minSigma` guards narrow/zero-width windows so the falloff never becomes
 * a near-vertical cliff.
 */
const windowFit = (
  value: number,
  range: NumericRange,
  opts: { minSigma: number; widthRatio?: number },
): number => {
  if (value >= range.min && value <= range.max) return 1;
  const distance = value < range.min ? range.min - value : value - range.max;
  const width = range.max - range.min;
  const sigma = Math.max(width * (opts.widthRatio ?? 0.6), opts.minSigma);
  return clamp(Math.exp(-0.5 * (distance / sigma) ** 2), 0, 1);
};

/** Same falloff, but around a single ideal point rather than a window (DIN, binding flex rating). */
const pointFit = (value: number, target: number, sigma: number): number =>
  clamp(Math.exp(-0.5 * ((value - target) / sigma) ** 2), 0, 1);

const numericSpec = (item: GearItem, key: string): number | null => {
  const raw = item.specs[key];
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const parsed = Number.parseFloat(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

/** Exact tier is a perfect fit; one tier away is still a usable compromise; two tiers is steep but never zero. */
const budgetFit = (item: GearItem, budgetTier: BudgetTier): number => {
  const distance = Math.abs(TIER_INDEX[item.priceTier] - TIER_INDEX[budgetTier]);
  if (distance === 0) return 1;
  if (distance === 1) return 0.5;
  return 0.08;
};

/** Binary preference match, softly floored so a non-match dents the score rather than zeroing it. */
const inclusionFit = (matches: boolean, floor = 0.15): number => (matches ? 1 : floor);

/**
 * Ordinal level fit. Distance is measured to the nearest level the item is
 * rated for: 0 steps → 1.0 (made for you), 1 step → 0.5 (a stretch or a
 * little conservative, still sensible), 2+ steps → 0.05 (a race ski for a
 * beginner, a soft rental boot for an expert — effectively disqualifying).
 */
const LEVEL_DISTANCE_FIT = [1, 0.5, 0.05] as const;

export const levelFit = (levels: Level[], level: Level): number => {
  if (levels.length === 0) return 1;
  const distance = Math.min(...levels.map((candidate) => Math.abs(LEVEL_INDEX[candidate] - LEVEL_INDEX[level])));
  return LEVEL_DISTANCE_FIT[Math.min(distance, LEVEL_DISTANCE_FIT.length - 1)];
};

const genderFit = (genders: Gender[], gender: Gender): number => {
  if (genders.includes(gender)) return 1;
  if (gender === 'unisex' && genders.includes('male')) return 0.6;
  if (genders.includes('unisex')) return 0.45;
  return 0.08; // e.g. a women's-specific boot scored for a male rider
};

const idealDin: Record<Level, number> = { beginner: 5, intermediate: 8, advanced: 11, expert: 14 };
const idealBindingFlex: Record<Level, number> = { beginner: 3, intermediate: 5, advanced: 7, expert: 9 };

/** The numeric spec compared per category, and how forgiving that comparison is. */
const sizingFit = (item: GearItem, stats: UserStats, specs: CalculatedSpecs): number | null => {
  switch (item.category) {
    case 'skis': {
      const waist = numericSpec(item, 'waistWidth');
      if (waist === null) return null;
      return windowFit(waist, specs.waistWidth, { minSigma: stats.activity === 'snowboard' ? 6 : 4 });
    }
    case 'boots': {
      const flex = numericSpec(item, 'flex');
      if (flex === null) return null;
      return windowFit(flex, specs.bootFlex, { minSigma: stats.activity === 'snowboard' ? 0.6 : 5 });
    }
    case 'bindings': {
      if (stats.activity === 'snowboard') {
        const match = String(item.specs.flexRating ?? '').match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
        const rating = match ? Number(match[1]) : null;
        return rating === null ? null : pointFit(rating, idealBindingFlex[stats.level], 2);
      }
      const dinNumbers = String(item.specs.dinRange ?? '').match(/[\d.]+/g)?.map(Number) ?? [];
      const dinMax = dinNumbers[dinNumbers.length - 1];
      return dinMax === undefined ? null : pointFit(dinMax, idealDin[stats.level], 3);
    }
    case 'goggles': {
      const vlt = numericSpec(item, 'vlt');
      if (vlt === null) return null;
      return windowFit(vlt, specs.vlt, { minSigma: 3 });
    }
    case 'jacket':
    case 'helmet': {
      const warmth = numericSpec(item, 'warmth');
      if (warmth === null) return null;
      return windowFit(warmth, specs.warmth, { minSigma: 0.4, widthRatio: 0.9 });
    }
    default:
      return null;
  }
};

const SIZING_LABEL: Record<GearCategory, string> = {
  skis: 'Waist width fit',
  boots: 'Flex fit',
  bindings: 'Release / flex fit',
  goggles: 'Lens VLT fit',
  jacket: 'Warmth fit',
  helmet: 'Warmth fit',
};

interface FeatureWeights {
  sizing: number;
  style: number;
  level: number;
  gender: number;
  temps: number;
  budget: number;
}

/**
 * Nominal weight of each feature per category (each row sums to 1.0). When
 * an item is missing an optional field — e.g. no `styles` tag — that
 * feature is dropped and the remaining weights are renormalized so they
 * still sum to 100% of the score, rather than penalizing items for
 * undocumented metadata.
 *
 * Why level is weighted so heavily for skis, boots and bindings: these are
 * the pieces where ability mismatch is a safety and progression problem, not
 * a taste one. The binding constraint is "an item two levels off must lose to
 * one that is one level off, even when the closer item is a tier off budget
 * and the far one is otherwise perfect":
 *
 *     0.95 · level  >  0.5 · level + 0.5 · budget   ⇒   level > 1.11 × budget
 *
 * (0.95 = 1 − levelFit at 2+ steps, 0.5 = 1 − levelFit at 1 step and
 * 1 − budgetFit at one tier.) Each row keeps level at ≥ 1.3× budget for
 * margin. The weight comes mostly out of `sizing` and `style`: flex, DIN and
 * waist width already track ability, so they were partly double-counting it.
 * Verified by the property test in `lib/__tests__/levelFit.test.ts`.
 */
export const CATEGORY_WEIGHTS: Record<GearCategory, FeatureWeights> = {
  skis: { sizing: 0.3, style: 0.16, level: 0.28, gender: 0.08, temps: 0.0, budget: 0.18 },
  boots: { sizing: 0.3, style: 0.06, level: 0.3, gender: 0.12, temps: 0.0, budget: 0.22 },
  bindings: { sizing: 0.28, style: 0.04, level: 0.34, gender: 0.08, temps: 0.0, budget: 0.26 },
  goggles: { sizing: 0.34, style: 0.04, level: 0.04, gender: 0.06, temps: 0.22, budget: 0.3 },
  jacket: { sizing: 0.3, style: 0.06, level: 0.04, gender: 0.1, temps: 0.18, budget: 0.32 },
  helmet: { sizing: 0.26, style: 0.02, level: 0.02, gender: 0.1, temps: 0.1, budget: 0.5 },
};

export interface CompatibilityBreakdown {
  /** 0-100 Compatibility Score — the weight-normalized average of every applicable feature fit. */
  score: number;
  /** Per-feature fit and its (renormalized) weight, most-influential first — powers the "why this score" breakdown in the UI. */
  contributions: FeatureContribution[];
}

/**
 * Weighted-average compatibility between one gear item and a rider profile,
 * expressed as a 0-100% Compatibility Score. Every applicable feature
 * contributes a [0,1] "fit" — 1 = ideal, decaying continuously as the item
 * drifts from the target — and the final score is the weight-normalized
 * average of those fits. Category/activity mismatches are still handled
 * upstream as a hard filter (a snowboard is never a ski recommendation);
 * everything that reaches this function is scored, never zeroed outright.
 */
export const computeCompatibility = (
  item: GearItem,
  stats: UserStats,
  specs: CalculatedSpecs,
): CompatibilityBreakdown => {
  const weights = CATEGORY_WEIGHTS[item.category];
  const raw: FeatureContribution[] = [];

  const sizing = sizingFit(item, stats, specs);
  if (sizing !== null) {
    raw.push({ key: 'sizing', label: SIZING_LABEL[item.category], weight: weights.sizing, fit: sizing });
  }
  if (item.styles) {
    raw.push({
      key: 'style',
      label: 'Riding style match',
      weight: weights.style,
      fit: inclusionFit(item.styles.includes(stats.style)),
    });
  }
  if (item.levels) {
    raw.push({
      key: 'level',
      label: 'Ability level match',
      weight: weights.level,
      fit: levelFit(item.levels, stats.level),
    });
  }
  if (item.genders) {
    raw.push({
      key: 'gender',
      label: 'Gendered fit',
      weight: weights.gender,
      fit: genderFit(item.genders, stats.gender),
    });
  }
  if (item.temps) {
    raw.push({
      key: 'temps',
      label: 'Condition match',
      weight: weights.temps,
      fit: inclusionFit(item.temps.includes(stats.temperature), 0.2),
    });
  }
  raw.push({ key: 'budget', label: 'Budget alignment', weight: weights.budget, fit: budgetFit(item, stats.budgetTier) });

  const totalWeight = raw.reduce((sum, c) => sum + c.weight, 0) || 1;
  const contributions = raw
    .map((c) => ({ ...c, weight: c.weight / totalWeight }))
    .sort((a, b) => b.weight * b.fit - a.weight * a.fit);

  const score = clamp(Math.round(contributions.reduce((sum, c) => sum + c.weight * c.fit, 0) * 100), 0, 100);

  return { score, contributions };
};
