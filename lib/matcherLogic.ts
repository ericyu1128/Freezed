/**
 * Freezed — matching engine
 * Made by Eric Yu
 *
 * Pure, dependency-free functions. Everything here is deterministic so the same
 * profile always produces the same recommendation set.
 */

import gearDatabase from './gearDatabase';
import type {
  BudgetTier,
  CalculatedSpecs,
  DerivationStep,
  GearCategory,
  GearItem,
  Gender,
  LengthCalculation,
  Level,
  MatchResult,
  NumericRange,
  Recommendation,
  RetailerPrice,
  RidingStyle,
  Temperature,
  UserStats,
} from './types';

/* ------------------------------------------------------------------ */
/*  Small utilities                                                    */
/* ------------------------------------------------------------------ */

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const round = (value: number) => Math.round(value);

export const CATEGORY_ORDER: GearCategory[] = ['skis', 'boots', 'helmet', 'goggles', 'jacket'];

const TIER_INDEX: Record<BudgetTier, number> = {
  budget: 0,
  'mid-range': 1,
  premium: 2,
};

export const TIER_LABEL: Record<BudgetTier, string> = {
  budget: 'Entry-level / Value',
  'mid-range': 'Balanced performance / price',
  premium: 'Top-tier / Pro construction',
};

export const TEMPERATURE_LABEL: Record<Temperature, string> = {
  freezing: 'Freezing — -15 °C and below',
  moderate: 'Moderate — -5 °C to 0 °C',
  spring: 'Spring — above 0 °C',
};

export const STYLE_LABEL: Record<RidingStyle, string> = {
  piste: 'Piste / Carving',
  'all-mountain': 'All-Mountain',
  freestyle: 'Freestyle / Park',
  backcountry: 'Backcountry / Powder',
};

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export const categoryLabel = (category: GearCategory, activity: UserStats['activity']): string => {
  switch (category) {
    case 'skis':
      return activity === 'snowboard' ? 'Snowboard' : 'Skis';
    case 'boots':
      return activity === 'snowboard' ? 'Snowboard Boots' : 'Ski Boots';
    case 'helmet':
      return 'Helmet';
    case 'goggles':
      return 'Goggles';
    case 'jacket':
      return 'Jacket';
    default:
      return category;
  }
};

/* ------------------------------------------------------------------ */
/*  1. Length calculation                                              */
/* ------------------------------------------------------------------ */

/**
 * Base offset from standing height, in cm, by riding style.
 * Spec: "Height minus 5 cm to 15 cm depending on style."
 */
const SKI_STYLE_OFFSET: Record<RidingStyle, number> = {
  piste: -12, // shorter = quicker edge-to-edge on groomers
  'all-mountain': -9,
  freestyle: -14, // shortest = spins & switch landings
  backcountry: -5, // longest = float and stability
};

/** Ability modifier. Beginners go shorter, experts go longer. */
const SKI_LEVEL_OFFSET: Record<Level, number> = {
  beginner: -5,
  intermediate: 0,
  advanced: 3,
  expert: 6,
};

/** Snowboards are sized as a ratio of height rather than a fixed subtraction. */
const BOARD_STYLE_OFFSET: Record<RidingStyle, number> = {
  piste: 1,
  'all-mountain': 0,
  freestyle: -4,
  backcountry: 4,
};

const BOARD_LEVEL_OFFSET: Record<Level, number> = {
  beginner: -3,
  intermediate: 0,
  advanced: 1,
  expert: 2,
};

/** Broca-style expected mass for a given height, used for the load modifier. */
const expectedWeightKg = (heightCm: number, gender: Gender): number => {
  const base = (heightCm - 100) * 0.9;
  if (gender === 'female') return base - 3;
  return base;
};

/**
 * Heavier riders flex a ski more, so they benefit from extra length (and
 * vice-versa). Capped at ±5 cm so it never dominates the calculation.
 */
const weightModifier = (stats: UserStats): number => {
  const delta = stats.weight - expectedWeightKg(stats.height, stats.gender);
  return clamp(Math.round(delta / 6), -5, 5);
};

export const calculateLength = (stats: UserStats): LengthCalculation => {
  const isBoard = stats.activity === 'snowboard';
  const steps: DerivationStep[] = [];

  let value: number;

  if (isBoard) {
    const base = stats.height * 0.88;
    steps.push({
      label: 'Base (height × 0.88)',
      delta: round(base),
      note: `${stats.height} cm rider height`,
    });
    value = base;
  } else {
    steps.push({ label: 'Standing height', delta: stats.height, note: 'Starting point' });
    value = stats.height;
  }

  const styleOffset = isBoard ? BOARD_STYLE_OFFSET[stats.style] : SKI_STYLE_OFFSET[stats.style];
  steps.push({
    label: STYLE_LABEL[stats.style],
    delta: styleOffset,
    note:
      stats.style === 'backcountry'
        ? 'Longer for float and high-speed stability in soft snow'
        : stats.style === 'freestyle'
          ? 'Shorter for spins, switch landings and rail control'
          : stats.style === 'piste'
            ? 'Shorter for quicker edge-to-edge on hardpack'
            : 'Balanced length for mixed terrain',
  });
  value += styleOffset;

  const levelOffset = isBoard ? BOARD_LEVEL_OFFSET[stats.level] : SKI_LEVEL_OFFSET[stats.level];
  steps.push({
    label: LEVEL_LABEL[stats.level],
    delta: levelOffset,
    note:
      stats.level === 'beginner'
        ? 'Extra 5 cm shorter — easier to initiate and finish turns'
        : stats.level === 'expert'
          ? 'Longer for stability at speed'
          : stats.level === 'advanced'
            ? 'Slightly longer for edge hold at speed'
            : 'Standard length for this ability',
  });
  value += levelOffset;

  // Freeride / powder bonus for strong riders — the "add 5 to 10 cm" case.
  if (stats.style === 'backcountry' && (stats.level === 'advanced' || stats.level === 'expert')) {
    const bonus = isBoard ? 2 : 4;
    steps.push({
      label: 'Freeride float bonus',
      delta: bonus,
      note: 'Additional surface area for deep snow at speed',
    });
    value += bonus;
  }

  const wMod = weightModifier(stats);
  if (wMod !== 0) {
    steps.push({
      label: 'Rider load',
      delta: wMod,
      note:
        wMod > 0
          ? `${stats.weight} kg is above the reference mass for ${stats.height} cm — more length to avoid over-flexing`
          : `${stats.weight} kg is below the reference mass for ${stats.height} cm — less length to keep the flex accessible`,
    });
    value += wMod;
  }

  if (stats.gender === 'female' && !isBoard) {
    steps.push({
      label: "Women's construction",
      delta: -2,
      note: "Women's skis are typically built lighter and ride best slightly shorter",
    });
    value -= 2;
  }

  const final = clamp(round(value), isBoard ? 128 : 140, isBoard ? 168 : 195);

  return {
    value: final,
    range: { min: final - 4, max: final + 4 },
    steps,
    label: isBoard ? 'Board length' : 'Ski length',
  };
};

/* ------------------------------------------------------------------ */
/*  2. Waist width                                                     */
/* ------------------------------------------------------------------ */

/** Spec-defined waist windows (mm) for skis. */
const SKI_WAIST: Record<RidingStyle, NumericRange> = {
  piste: { min: 72, max: 84 },
  'all-mountain': { min: 85, max: 98 },
  freestyle: { min: 90, max: 102 },
  backcountry: { min: 105, max: 118 },
};

/** Estimated Mondopoint size from standing height (used for board waist + boot sizing). */
export const estimateMondoSize = (stats: UserStats): number => {
  const raw = stats.height * (stats.gender === 'female' ? 0.1455 : 0.152);
  return Math.round(clamp(raw, 22, 31.5) * 2) / 2;
};

export const calculateWaistWidth = (stats: UserStats): { range: NumericRange; label: string } => {
  if (stats.activity === 'snowboard') {
    const mondo = estimateMondoSize(stats);
    const wide = mondo >= 27.5;
    return {
      range: wide ? { min: 256, max: 265 } : { min: 245, max: 255 },
      label: wide
        ? 'Wide board waist (prevents toe/heel drag)'
        : 'Standard board waist',
    };
  }

  return { range: SKI_WAIST[stats.style], label: `${STYLE_LABEL[stats.style]} waist window` };
};

/* ------------------------------------------------------------------ */
/*  3. Boot flex                                                       */
/* ------------------------------------------------------------------ */

const SKI_FLEX_MEN: Record<Level, NumericRange> = {
  beginner: { min: 70, max: 90 },
  intermediate: { min: 90, max: 110 },
  advanced: { min: 120, max: 140 },
  expert: { min: 120, max: 140 },
};

const SKI_FLEX_WOMEN: Record<Level, NumericRange> = {
  beginner: { min: 60, max: 75 },
  intermediate: { min: 75, max: 90 },
  advanced: { min: 100, max: 115 },
  expert: { min: 100, max: 115 },
};

/** Snowboard boots use a 1–10 subjective scale. */
const BOARD_FLEX: Record<Level, NumericRange> = {
  beginner: { min: 2, max: 4 },
  intermediate: { min: 4, max: 6 },
  advanced: { min: 6, max: 8 },
  expert: { min: 7, max: 10 },
};

export const calculateBootFlex = (stats: UserStats): { range: NumericRange; label: string } => {
  if (stats.activity === 'snowboard') {
    return { range: BOARD_FLEX[stats.level], label: 'Flex rating (1–10 scale)' };
  }

  const table = stats.gender === 'female' ? SKI_FLEX_WOMEN : SKI_FLEX_MEN;
  const range = table[stats.level];
  const isTopEnd = stats.level === 'advanced' || stats.level === 'expert';

  return {
    range,
    label: `${stats.gender === 'female' ? "Women's" : "Men's / unisex"} flex index${isTopEnd ? ' (140+ for race)' : ''}`,
  };
};

/* ------------------------------------------------------------------ */
/*  4. Apparel & optics by temperature                                 */
/* ------------------------------------------------------------------ */

/** Target goggle VLT (Visible Light Transmission) window, in percent. */
const VLT_TARGET: Record<Temperature, NumericRange> = {
  freezing: { min: 40, max: 70 }, // storm / flat light — let light in
  moderate: { min: 18, max: 40 }, // mixed light all-rounder
  spring: { min: 5, max: 20 }, // high glare — cut light hard
};

const LENS_GUIDANCE: Record<Temperature, string> = {
  freezing:
    'Deep-cold days usually mean storms and flat light. A high-VLT rose, yellow or amber lens lifts terrain contrast so you can read moguls and rollovers you would otherwise ski straight into.',
  moderate:
    'Mixed light calls for a mid-VLT lens in the 18–40% window — usable in sun, still workable when a cloud bank moves over.',
  spring:
    'Above 0 °C means wet, highly reflective snow and hard glare. A low-VLT polarised or mirrored lens cuts that reflection and reduces eye fatigue over a long day.',
};

/** Target jacket warmth on the 1–5 scale used in the gear database. */
const WARMTH_TARGET: Record<Temperature, NumericRange> = {
  freezing: { min: 4, max: 5 },
  moderate: { min: 3, max: 4 },
  spring: { min: 1, max: 2 },
};

const JACKET_GUIDANCE: Record<Temperature, string> = {
  freezing:
    'At -15 °C and below, chairlift time is the enemy. You want a high-loft down or hybrid-down jacket with an insulated helmet-compatible hood — loft you cannot add back with a mid-layer.',
  moderate:
    'Between -5 °C and 0 °C a moderately insulated 2L or 3L jacket hits the balance: warm on the lift, vented on the way down.',
  spring:
    'Above 0 °C, insulation becomes dead weight. An uninsulated 2L/3L shell with real pit zips lets you dump heat and add a mid-layer only if the wind picks up.',
};

/* ------------------------------------------------------------------ */
/*  5. Helmet sizing                                                   */
/* ------------------------------------------------------------------ */

const helmetSizing = (stats: UserStats): { size: string; circumference: string } => {
  // Head circumference correlates loosely with stature; presented as an estimate.
  const est = 40 + stats.height * 0.098 + (stats.gender === 'female' ? -1.5 : 0);
  const cm = round(clamp(est, 51, 63));
  let size = 'M';
  if (cm <= 53) size = 'S';
  else if (cm <= 55) size = 'S/M';
  else if (cm <= 58) size = 'M';
  else if (cm <= 61) size = 'L';
  else size = 'XL';
  return { size, circumference: `≈ ${cm} cm — measure to confirm` };
};

/* ------------------------------------------------------------------ */
/*  Full spec sheet                                                    */
/* ------------------------------------------------------------------ */

export const calculateSpecs = (stats: UserStats): CalculatedSpecs => {
  const length = calculateLength(stats);
  const waist = calculateWaistWidth(stats);
  const flex = calculateBootFlex(stats);
  const helmet = helmetSizing(stats);

  return {
    length,
    waistWidth: waist.range,
    waistWidthLabel: waist.label,
    bootFlex: flex.range,
    bootFlexLabel: flex.label,
    mondoSize: estimateMondoSize(stats),
    poleLength: stats.activity === 'ski' ? round((stats.height * 0.68) / 5) * 5 : null,
    vlt: VLT_TARGET[stats.temperature],
    lensGuidance: LENS_GUIDANCE[stats.temperature],
    warmth: WARMTH_TARGET[stats.temperature],
    jacketGuidance: JACKET_GUIDANCE[stats.temperature],
    helmetSize: helmet.size,
    helmetCircumference: helmet.circumference,
  };
};

/* ------------------------------------------------------------------ */
/*  6. Budget filtering & scoring                                      */
/* ------------------------------------------------------------------ */

/**
 * Budget alignment score. An exact tier match dominates; one tier away is a
 * usable compromise; two tiers away is heavily penalised so a premium item
 * never surfaces for a budget rider.
 */
export const budgetScore = (item: GearItem, budgetTier: BudgetTier): number => {
  const distance = Math.abs(TIER_INDEX[item.priceTier] - TIER_INDEX[budgetTier]);
  if (distance === 0) return 60;
  if (distance === 1) return 22;
  return -30;
};

/** Items that survive the hard budget filter (never more than one tier away). */
export const filterByBudget = (items: GearItem[], budgetTier: BudgetTier): GearItem[] => {
  const withinOneTier = items.filter(
    (item) => Math.abs(TIER_INDEX[item.priceTier] - TIER_INDEX[budgetTier]) <= 1,
  );
  return withinOneTier.length > 0 ? withinOneTier : items;
};

const numericSpec = (item: GearItem, key: string): number | null => {
  const raw = item.specs[key];
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const parsed = Number.parseFloat(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

/** Distance-from-window penalty: 0 inside the window, scaled outside it. */
const rangePenalty = (value: number, range: NumericRange, perUnit: number): number => {
  if (value >= range.min && value <= range.max) return 0;
  const distance = value < range.min ? range.min - value : value - range.max;
  return distance * perUnit;
};

export const scoreItem = (item: GearItem, stats: UserStats, specs: CalculatedSpecs): number => {
  let score = 0;

  // --- activity ------------------------------------------------------
  if (item.activity && item.activity !== 'both' && item.activity !== stats.activity) {
    return -Infinity; // hard filter: a snowboard is never a ski recommendation
  }
  score += item.activity === stats.activity ? 30 : 20;

  // --- budget --------------------------------------------------------
  score += budgetScore(item, stats.budgetTier);

  // --- style / level / gender ---------------------------------------
  if (item.styles) score += item.styles.includes(stats.style) ? 26 : -6;
  if (item.levels) score += item.levels.includes(stats.level) ? 22 : -10;
  if (item.genders) {
    if (item.genders.includes(stats.gender)) score += 12;
    else if (stats.gender === 'unisex' && item.genders.includes('male')) score += 6;
    else if (item.genders.includes('unisex')) score += 4;
    else score -= 26; // e.g. a women's-specific boot for a male rider
  }

  // --- conditions ----------------------------------------------------
  if (item.temps) score += item.temps.includes(stats.temperature) ? 24 : -8;

  // --- category-specific numeric fit ---------------------------------
  switch (item.category) {
    case 'skis': {
      const waist = numericSpec(item, 'waistWidth');
      if (waist !== null) {
        const penalty = rangePenalty(
          waist,
          specs.waistWidth,
          stats.activity === 'snowboard' ? 1.2 : 2.4,
        );
        score += penalty === 0 ? 40 : Math.max(-40, 40 - penalty);
      }
      break;
    }
    case 'boots': {
      const flex = numericSpec(item, 'flex');
      if (flex !== null) {
        const perUnit = stats.activity === 'snowboard' ? 9 : 1.6;
        const penalty = rangePenalty(flex, specs.bootFlex, perUnit);
        score += penalty === 0 ? 40 : Math.max(-40, 40 - penalty);
      }
      break;
    }
    case 'goggles': {
      const vlt = numericSpec(item, 'vlt');
      if (vlt !== null) {
        // Weighted heavily: a lens outside the light window is the wrong lens,
        // even if it is a perfect budget match.
        const penalty = rangePenalty(vlt, specs.vlt, 2.2);
        score += penalty === 0 ? 44 : Math.max(-40, 44 - penalty);
      }
      break;
    }
    case 'jacket':
    case 'helmet': {
      const warmth = numericSpec(item, 'warmth');
      if (warmth !== null) {
        const penalty = rangePenalty(warmth, specs.warmth, item.category === 'jacket' ? 16 : 7);
        score += penalty === 0 ? 36 : Math.max(-30, 36 - penalty);
      }
      break;
    }
    default:
      break;
  }

  return score;
};

/**
 * Normalise a raw score into a friendly 0–100 confidence figure.
 * The divisor is deliberately above the practical maximum so near-perfect
 * matches still land in the high 80s / low 90s rather than all reading 99.
 */
const toConfidence = (raw: number): number => clamp(Math.round(((raw + 40) / 262) * 100), 40, 99);

/* ------------------------------------------------------------------ */
/*  7. Dynamic card specs + generated reasoning                        */
/* ------------------------------------------------------------------ */

const cheapest = (prices: RetailerPrice[]): RetailerPrice =>
  prices.reduce((best, current) => (current.price < best.price ? current : best), prices[0]);

const buildCalculatedSpecs = (
  item: GearItem,
  stats: UserStats,
  specs: CalculatedSpecs,
): Recommendation['calculatedSpecs'] => {
  const rows: Recommendation['calculatedSpecs'] = [];

  switch (item.category) {
    case 'skis':
      rows.push({
        label: `Recommended ${specs.length.label.toLowerCase()}`,
        value: `${specs.length.value} cm`,
        highlight: true,
      });
      rows.push({
        label: 'Acceptable window',
        value: `${specs.length.range.min}–${specs.length.range.max} cm`,
      });
      rows.push({
        label: stats.activity === 'snowboard' ? 'Board waist' : 'Waist width',
        value: `${item.specs.waistWidth} mm (target ${specs.waistWidth.min}–${specs.waistWidth.max} mm)`,
        highlight: true,
      });
      rows.push({ label: 'Available lengths', value: String(item.specs.lengths ?? '—') });
      break;

    case 'boots':
      rows.push({
        label: 'Recommended flex',
        value:
          stats.activity === 'snowboard'
            ? `${specs.bootFlex.min}–${specs.bootFlex.max} / 10`
            : `${specs.bootFlex.min}–${specs.bootFlex.max}`,
        highlight: true,
      });
      rows.push({
        label: 'This boot',
        value:
          stats.activity === 'snowboard'
            ? `${item.specs.flex} / 10`
            : `${item.specs.flex} flex index`,
        highlight: true,
      });
      rows.push({ label: 'Estimated Mondo size', value: `${specs.mondoSize.toFixed(1)}` });
      if (item.specs.lastWidth) rows.push({ label: 'Last width', value: String(item.specs.lastWidth) });
      break;

    case 'helmet':
      rows.push({ label: 'Recommended size', value: specs.helmetSize, highlight: true });
      rows.push({ label: 'Head circumference', value: specs.helmetCircumference });
      rows.push({ label: 'Certification', value: String(item.specs.certification ?? '—') });
      rows.push({ label: 'Venting', value: String(item.specs.ventControl ?? item.specs.vents ?? '—') });
      break;

    case 'goggles':
      rows.push({
        label: 'Target VLT for your conditions',
        value: `${specs.vlt.min}–${specs.vlt.max}%`,
        highlight: true,
      });
      rows.push({ label: 'This lens', value: `${item.specs.vlt}% VLT`, highlight: true });
      rows.push({ label: 'Tint', value: String(item.specs.lensTint ?? '—') });
      if (item.specs.spareLens) rows.push({ label: 'Spare lens', value: String(item.specs.spareLens) });
      break;

    case 'jacket':
      rows.push({
        label: 'Target warmth',
        value: `${specs.warmth.min}–${specs.warmth.max} / 5`,
        highlight: true,
      });
      rows.push({ label: 'This jacket', value: `${item.specs.warmth} / 5`, highlight: true });
      rows.push({ label: 'Insulation', value: String(item.specs.insulation ?? '—') });
      rows.push({ label: 'Waterproofing', value: String(item.specs.waterproofing ?? '—') });
      break;

    default:
      break;
  }

  return rows;
};

const buildReasonBullets = (
  item: GearItem,
  stats: UserStats,
  specs: CalculatedSpecs,
): string[] => {
  const bullets: string[] = [];
  const tierWord =
    item.priceTier === stats.budgetTier
      ? `sits exactly in your ${item.priceTier} bracket`
      : `is one tier from your ${stats.budgetTier} bracket, and was kept because nothing in-tier scored higher`;

  switch (item.category) {
    case 'skis': {
      const waist = numericSpec(item, 'waistWidth');
      if (waist !== null) {
        const inRange = waist >= specs.waistWidth.min && waist <= specs.waistWidth.max;
        bullets.push(
          inRange
            ? `${waist} mm waist lands inside the ${specs.waistWidth.min}–${specs.waistWidth.max} mm window for ${STYLE_LABEL[stats.style].toLowerCase()} riding.`
            : `${waist} mm waist sits just outside your ${specs.waistWidth.min}–${specs.waistWidth.max} mm target — expect ${waist > specs.waistWidth.max ? 'more float but slower edge-to-edge' : 'quicker edging but less float'}.`,
        );
      }
      bullets.push(
        `At ${stats.height} cm and ${stats.weight} kg riding ${LEVEL_LABEL[stats.level].toLowerCase()}, your calculated length is ${specs.length.value} cm.`,
      );
      break;
    }
    case 'boots': {
      const flex = numericSpec(item, 'flex');
      if (flex !== null) {
        const inRange = flex >= specs.bootFlex.min && flex <= specs.bootFlex.max;
        bullets.push(
          inRange
            ? `Flex ${flex} is inside your ${specs.bootFlex.min}–${specs.bootFlex.max} target for a ${LEVEL_LABEL[stats.level].toLowerCase()} ${stats.gender === 'female' ? 'female' : ''} rider.`.replace('  ', ' ')
            : `Flex ${flex} is ${flex > specs.bootFlex.max ? 'stiffer' : 'softer'} than your ${specs.bootFlex.min}–${specs.bootFlex.max} target — ${flex > specs.bootFlex.max ? 'more power, less forgiveness' : 'more comfort, less drive'}.`,
        );
      }
      bullets.push(`Your estimated Mondopoint size is ${specs.mondoSize.toFixed(1)} — get shell-fitted to confirm.`);
      break;
    }
    case 'goggles': {
      const vlt = numericSpec(item, 'vlt');
      if (vlt !== null) {
        bullets.push(
          `${vlt}% VLT against a ${specs.vlt.min}–${specs.vlt.max}% target for ${TEMPERATURE_LABEL[stats.temperature].toLowerCase()} conditions.`,
        );
      }
      break;
    }
    case 'jacket': {
      const warmth = numericSpec(item, 'warmth');
      if (warmth !== null) {
        bullets.push(
          `Warmth ${warmth}/5 against a ${specs.warmth.min}–${specs.warmth.max}/5 target for ${TEMPERATURE_LABEL[stats.temperature].toLowerCase()}.`,
        );
      }
      break;
    }
    case 'helmet': {
      bullets.push(`Sized ${specs.helmetSize} (${specs.helmetCircumference}) with ${item.specs.certification} certification.`);
      break;
    }
    default:
      break;
  }

  if (item.styles?.includes(stats.style)) {
    bullets.push(`Designed around ${STYLE_LABEL[stats.style].toLowerCase()} riding.`);
  }
  if (item.levels?.includes(stats.level)) {
    bullets.push(`Tuned for ${LEVEL_LABEL[stats.level].toLowerCase()} riders.`);
  }
  bullets.push(`Price: ${tierWord} — cheapest listing $${cheapest(item.prices).price.toFixed(2)}.`);

  return bullets;
};

const buildReasoning = (item: GearItem, stats: UserStats, specs: CalculatedSpecs): string => {
  const rider = `a ${stats.height} cm / ${stats.weight} kg ${LEVEL_LABEL[stats.level].toLowerCase()} ${
    stats.activity === 'ski' ? 'skier' : 'snowboarder'
  }`;

  switch (item.category) {
    case 'skis':
      return `For ${rider} riding mostly ${STYLE_LABEL[stats.style].toLowerCase()} terrain, the ${item.brand} ${item.name} is sized to ${specs.length.value} cm with a ${item.specs.waistWidth} mm waist. ${item.matchReason} Filtered to your ${TIER_LABEL[stats.budgetTier].toLowerCase()} budget, it was the strongest hardgood match in the database.`;
    case 'boots':
      return `Boots are the highest-leverage purchase in the kit. Your profile calls for a ${specs.bootFlex.min}–${specs.bootFlex.max} flex${stats.activity === 'snowboard' ? '/10' : ''}, and the ${item.brand} ${item.name} sits at ${item.specs.flex}. ${item.matchReason} Get a shell fit at a shop before you commit — the estimated Mondo ${specs.mondoSize.toFixed(1)} is a starting point, not a verdict.`;
    case 'helmet':
      return `${item.brand} ${item.name} in size ${specs.helmetSize}. ${item.matchReason} It also pairs cleanly with the goggle recommendation below, which matters more than most riders expect — a gap between brim and goggle is the fastest way to a cold forehead.`;
    case 'goggles':
      return `${specs.lensGuidance} The ${item.brand} ${item.name} runs ${item.specs.vlt}% VLT, inside your ${specs.vlt.min}–${specs.vlt.max}% target. ${item.matchReason}`;
    case 'jacket':
      return `${specs.jacketGuidance} The ${item.brand} ${item.name} rates ${item.specs.warmth}/5 for warmth with ${item.specs.waterproofing} protection. ${item.matchReason}`;
    default:
      return item.matchReason;
  }
};

/* ------------------------------------------------------------------ */
/*  8. Public entry point                                              */
/* ------------------------------------------------------------------ */

export const matchGear = (stats: UserStats, database: GearItem[] = gearDatabase): MatchResult => {
  const specs = calculateSpecs(stats);

  const recommendations: Recommendation[] = CATEGORY_ORDER.map((category) => {
    const pool = filterByBudget(
      database.filter(
        (item) =>
          item.category === category &&
          (!item.activity || item.activity === 'both' || item.activity === stats.activity),
      ),
      stats.budgetTier,
    );

    if (pool.length === 0) return null;

    const ranked = pool
      .map((item) => ({ item, score: scoreItem(item, stats, specs) }))
      .filter((entry) => Number.isFinite(entry.score))
      .sort((a, b) => b.score - a.score);

    if (ranked.length === 0) return null;

    const winner = ranked[0];

    return {
      category,
      item: winner.item,
      score: toConfidence(winner.score),
      calculatedSpecs: buildCalculatedSpecs(winner.item, stats, specs),
      reasoning: buildReasoning(winner.item, stats, specs),
      reasonBullets: buildReasonBullets(winner.item, stats, specs),
      bestPrice: cheapest(winner.item.prices),
      alternates: ranked.slice(1, 3).map((entry) => entry.item),
    } satisfies Recommendation;
  }).filter((entry): entry is Recommendation => entry !== null);

  const totalBestPrice = recommendations.reduce((sum, rec) => sum + rec.bestPrice.price, 0);

  return {
    stats,
    specs,
    recommendations,
    totalBestPrice,
    generatedAt: new Date().toISOString(),
  };
};

export default matchGear;
