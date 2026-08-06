/**
 * Freezed — gear performance profile
 * Made by Eric Yu
 *
 * Derives the six normalized 0–10 hexagon scores straight from an item's real
 * specs, styles, levels and price tier — nothing here is hand-authored, so
 * every axis value traces back to a concrete field already in the database
 * (waist width, boot flex, VLT, warmth, vent count, construction materials…).
 */

import type {
  Activity,
  BudgetTier,
  GearCategory,
  Level,
  PerformanceAxis,
  PerformanceProfile,
  RidingStyle,
  Temperature,
} from './types';

export const PERFORMANCE_AXES: { key: PerformanceAxis; label: string; short: string }[] = [
  { key: 'carving', label: 'Carving / Edge Hold', short: 'Carve' },
  { key: 'powderFloat', label: 'Powder Float', short: 'Float' },
  { key: 'playfulness', label: 'Park / Playfulness', short: 'Park' },
  { key: 'stability', label: 'Stability at Speed', short: 'Speed' },
  { key: 'versatility', label: 'Versatility', short: 'Range' },
  { key: 'accessibility', label: 'Accessibility / Ease', short: 'Ease' },
];

/** Structural subset of `GearItem` needed to derive a performance profile. */
interface PerformanceInput {
  category: GearCategory;
  activity?: Activity | 'both';
  styles?: RidingStyle[];
  levels?: Level[];
  temps?: Temperature[];
  priceTier: BudgetTier;
  specs: Record<string, string | number>;
}

const clamp10 = (value: number) => Math.round(Math.min(Math.max(value, 0), 10) * 10) / 10;

const numeric = (specs: Record<string, string | number>, key: string): number | null => {
  const raw = specs[key];
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const parsed = Number.parseFloat(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const text = (specs: Record<string, string | number>, key: string): string =>
  String(specs[key] ?? '').toLowerCase();

/** Pulls the leading number out of a "7 / 10" style rating string. */
const parseRatingOf10 = (raw: string): number | null => {
  const match = raw.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  return match ? Number(match[1]) : null;
};

const LEVEL_WEIGHT: Record<Level, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };

const levelAverage = (levels: Level[] | undefined): number => {
  if (!levels || levels.length === 0) return 2.5;
  return levels.reduce((sum, level) => sum + LEVEL_WEIGHT[level], 0) / levels.length;
};

/** More tagged styles = more versatile, capped at 4 tags = a perfect 10. */
const styleSpread = (styles: RidingStyle[] | undefined): number => clamp10((styles?.length ?? 1) * 3);

const has = (styles: RidingStyle[] | undefined, style: RidingStyle) => Boolean(styles?.includes(style));

/* ------------------------------------------------------------------ */
/*  Category derivations                                               */
/* ------------------------------------------------------------------ */

function skiProfile(item: PerformanceInput): PerformanceProfile {
  const isBoard = item.activity === 'snowboard';
  const { styles, levels } = item;
  const levelAvg = levelAverage(levels);
  const coreConstruction = `${text(item.specs, 'core')} ${text(item.specs, 'construction')}`;
  const hasMetal = /titanal|carbon/.test(coreConstruction);
  const isTwin = /twin/.test(`${text(item.specs, 'tail')} ${text(item.specs, 'shape')}`);

  let carving: number;
  let powderFloat: number;

  if (isBoard) {
    const flexRating = parseRatingOf10(text(item.specs, 'flexRating'));
    const profileText = text(item.specs, 'profile');
    const camberBonus = profileText.includes('camber') && !profileText.includes('rocker')
      ? 2
      : profileText.includes('rocker') || profileText.includes('flat')
        ? -1
        : 0;
    carving = clamp10((flexRating ?? 5) * 0.9 + camberBonus);
    const waist = numeric(item.specs, 'waistWidth');
    powderFloat = clamp10((waist ? (waist - 248) / 2 : 5) + (has(styles, 'backcountry') ? 1.5 : 0));
  } else {
    const waist = numeric(item.specs, 'waistWidth');
    carving = waist ? clamp10(10 - (waist - 68) * (10 / 50) + (hasMetal ? 1 : 0)) : 5;
    powderFloat = waist ? clamp10((waist - 72) * (10 / 46)) : 5;
  }

  const playfulness = clamp10(
    (has(styles, 'freestyle') ? 8 : has(styles, 'all-mountain') ? 5.5 : 3) + (isTwin ? 1 : 0),
  );
  const stability = clamp10(
    (hasMetal ? 2 : 0) + levelAvg * 1.6 + (has(styles, 'piste') || has(styles, 'backcountry') ? 1.5 : 0),
  );
  const versatility = styleSpread(styles);
  const accessibility = clamp10(
    (levels?.includes('beginner')
      ? 8
      : levels?.includes('expert') && !levels.includes('beginner')
        ? 3
        : 6) + (item.priceTier === 'budget' ? 1 : item.priceTier === 'premium' ? -0.5 : 0),
  );

  return { carving, powderFloat, playfulness, stability, versatility, accessibility };
}

function bootProfile(item: PerformanceInput): PerformanceProfile {
  const isBoard = item.activity === 'snowboard';
  const { styles, levels } = item;
  const levelAvg = levelAverage(levels);
  const rawFlex = numeric(item.specs, 'flex');
  // Ski boots run 60–140 flex; snowboard boots already sit on a 1–10 scale.
  const norm = rawFlex === null ? 5 : isBoard ? clamp10(rawFlex) : clamp10((rawFlex - 60) / 8);

  const carving = norm;
  const stability = clamp10(norm * 0.75 + levelAvg * 1.1);
  const playfulness = clamp10(10 - norm * 0.8);
  const accessibility = clamp10(10 - norm * 0.7 + (levels?.includes('beginner') ? 1 : 0));
  const powderFloat = has(styles, 'backcountry') ? 7.5 : 4;
  const versatility = styleSpread(styles);

  return { carving, powderFloat, playfulness, stability, versatility, accessibility };
}

function helmetProfile(item: PerformanceInput): PerformanceProfile {
  const { styles, temps, levels } = item;
  const vents = numeric(item.specs, 'vents') ?? 10;
  const rotational = text(item.specs, 'rotational');
  const levelAvg = levelAverage(levels);

  const carving = clamp10(5 + (has(styles, 'piste') ? 2 : 0));
  const powderFloat = clamp10(
    temps?.includes('freezing') ? 7 : temps?.includes('moderate') ? 5 : temps?.includes('spring') ? 3 : 5,
  );
  const playfulness = clamp10(has(styles, 'freestyle') ? 7.5 : 4);
  const stability = clamp10(5 + (rotational.includes('mips') ? 2 : 0) + (levelAvg > 2.5 ? 1 : 0));
  const versatility = clamp10((temps?.length ?? 1) * 2.6 + (styles?.length ?? 1) * 1.4);
  const accessibility = clamp10(vents / 2.1);

  return { carving, powderFloat, playfulness, stability, versatility, accessibility };
}

function goggleProfile(item: PerformanceInput): PerformanceProfile {
  const { styles, temps } = item;
  const vlt = numeric(item.specs, 'vlt');
  const lensTech = text(item.specs, 'lensTech');
  const hasSpare = Boolean(item.specs.spareLens);
  const isMagnetic = /mag/.test(lensTech) || /mag/.test(text(item.specs, 'lensShape'));

  const carving = clamp10(5 + (has(styles, 'piste') ? 1.5 : 0));
  const powderFloat = vlt !== null ? clamp10(vlt / 10) : 5;
  const playfulness = clamp10(has(styles, 'freestyle') ? 7 : 4);
  const stability = clamp10(5 + (isMagnetic ? 1.5 : 0) + (hasSpare ? 1 : 0));
  const versatility = clamp10((hasSpare ? 8 : 5) + (temps?.length ?? 1) * 0.8);
  const accessibility = clamp10(hasSpare || isMagnetic ? 8 : 5.5);

  return { carving, powderFloat, playfulness, stability, versatility, accessibility };
}

function jacketProfile(item: PerformanceInput): PerformanceProfile {
  const { styles, temps } = item;
  const warmth = numeric(item.specs, 'warmth');
  const waterproofing = text(item.specs, 'waterproofing');
  const isTopTier = /pro|3l/.test(waterproofing);

  const carving = clamp10(5 + (has(styles, 'piste') ? 1.5 : 0));
  const powderFloat = warmth !== null ? clamp10(warmth * 2) : 5;
  const playfulness = clamp10(has(styles, 'freestyle') ? 7 : 4);
  const stability = clamp10(isTopTier ? 7.5 : 5);
  const versatility = clamp10(styleSpread(styles) * 0.6 + (temps?.length ?? 1) * 1.3);
  const accessibility = warmth !== null ? clamp10(10 - Math.abs(warmth - 3) * 2) : 5;

  return { carving, powderFloat, playfulness, stability, versatility, accessibility };
}

/** Compute the six-axis performance profile for a catalogue item. */
export function computePerformanceProfile(item: PerformanceInput): PerformanceProfile {
  switch (item.category) {
    case 'skis':
      return skiProfile(item);
    case 'boots':
      return bootProfile(item);
    case 'helmet':
      return helmetProfile(item);
    case 'goggles':
      return goggleProfile(item);
    case 'jacket':
      return jacketProfile(item);
    default:
      return { carving: 5, powderFloat: 5, playfulness: 5, stability: 5, versatility: 5, accessibility: 5 };
  }
}
