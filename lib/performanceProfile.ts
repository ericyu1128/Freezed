/**
 * Freezed — gear performance profile
 * Made by Eric Yu
 *
 * Derives the six normalized 0–10 hexagon scores straight from an item's real
 * specs, styles, levels and price tier — nothing here is hand-authored, so
 * every axis value traces back to a concrete field already in the database
 * (waist width, boot flex, VLT, warmth, vent count, construction materials…).
 *
 * The six axis *slots* (`axisA`…`axisF`) are shared by every category, but
 * what each slot means is category-dependent — `GEAR_CATEGORY_AXES` below is
 * the single source of truth for that mapping, and every derivation function
 * fills its slots in the same order its category is defined there.
 */

import type { Language } from './i18n/translations';
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

/* ------------------------------------------------------------------ */
/*  Category-aware attribute mapping                                   */
/* ------------------------------------------------------------------ */

interface PerformanceAxisSource {
  key: PerformanceAxis;
  label: string;
  labelZh: string;
  short: string;
  shortZh: string;
}

export interface PerformanceAxisMeta {
  key: PerformanceAxis;
  label: string;
  short: string;
}

/** The six performance attributes plotted on the hexagon, keyed by gear category. */
export const GEAR_CATEGORY_AXES: Record<GearCategory, PerformanceAxisSource[]> = {
  skis: [
    { key: 'axisA', label: 'Carving', labelZh: '刻滑', short: 'Carve', shortZh: '刻滑' },
    { key: 'axisB', label: 'Powder Float', labelZh: '粉雪浮力', short: 'Float', shortZh: '浮力' },
    { key: 'axisC', label: 'Park', labelZh: '公园', short: 'Park', shortZh: '公园' },
    { key: 'axisD', label: 'Stability', labelZh: '稳定性', short: 'Stable', shortZh: '稳定' },
    { key: 'axisE', label: 'Versatility', labelZh: '全能性', short: 'Range', shortZh: '全能' },
    { key: 'axisF', label: 'Accessibility', labelZh: '易上手度', short: 'Ease', shortZh: '易上手' },
  ],
  boots: [
    { key: 'axisA', label: 'Flex', labelZh: '硬度/韧性', short: 'Flex', shortZh: '硬度' },
    { key: 'axisB', label: 'Comfort', labelZh: '舒适度', short: 'Comfort', shortZh: '舒适' },
    { key: 'axisC', label: 'Heel Hold', labelZh: '锁跟性', short: 'Heel', shortZh: '锁跟' },
    { key: 'axisD', label: 'Walkability / Mobility', labelZh: '步行灵活性', short: 'Walk', shortZh: '灵活' },
    { key: 'axisE', label: 'Warmth', labelZh: '保暖性', short: 'Warmth', shortZh: '保暖' },
    { key: 'axisF', label: 'Response', labelZh: '响应性', short: 'Response', shortZh: '响应' },
  ],
  helmet: [
    { key: 'axisA', label: 'Ventilation', labelZh: '透气性', short: 'Vent', shortZh: '透气' },
    { key: 'axisB', label: 'Impact Protection', labelZh: '抗冲击保护', short: 'Impact', shortZh: '防护' },
    { key: 'axisC', label: 'Weight', labelZh: '重量', short: 'Weight', shortZh: '重量' },
    { key: 'axisD', label: 'Comfort', labelZh: '舒适度', short: 'Comfort', shortZh: '舒适' },
    { key: 'axisE', label: 'Fit Adjustment', labelZh: '贴合调节', short: 'Fit', shortZh: '调节' },
    { key: 'axisF', label: 'Style', labelZh: '外观风格', short: 'Style', shortZh: '风格' },
  ],
  goggles: [
    { key: 'axisA', label: 'Field of View', labelZh: '视野范围', short: 'FOV', shortZh: '视野' },
    { key: 'axisB', label: 'Anti-Fog', labelZh: '防雾性能', short: 'Anti-Fog', shortZh: '防雾' },
    { key: 'axisC', label: 'Lens Clarity', labelZh: '镜片清晰度', short: 'Clarity', shortZh: '清晰度' },
    { key: 'axisD', label: 'Fit', labelZh: '贴合度', short: 'Fit', shortZh: '贴合' },
    { key: 'axisE', label: 'Helmet Compatibility', labelZh: '头盔兼容性', short: 'Helmet', shortZh: '头盔兼容' },
    { key: 'axisF', label: 'Lens Interchangeability', labelZh: '镜片可更换性', short: 'Lens Swap', shortZh: '换镜' },
  ],
  jacket: [
    { key: 'axisA', label: 'Waterproofing', labelZh: '防水性', short: 'Waterproof', shortZh: '防水' },
    { key: 'axisB', label: 'Breathability', labelZh: '透气性', short: 'Breathe', shortZh: '透气' },
    { key: 'axisC', label: 'Insulation', labelZh: '保暖性', short: 'Warmth', shortZh: '保暖' },
    { key: 'axisD', label: 'Durability', labelZh: '耐用度', short: 'Durable', shortZh: '耐用' },
    { key: 'axisE', label: 'Weight', labelZh: '重量', short: 'Weight', shortZh: '重量' },
    { key: 'axisF', label: 'Mobility', labelZh: '活动灵活性', short: 'Mobility', shortZh: '灵活' },
  ],
  bindings: [
    { key: 'axisA', label: 'Responsiveness', labelZh: '响应性', short: 'React', shortZh: '响应' },
    { key: 'axisB', label: 'Adjustability', labelZh: '可调节性', short: 'Adjust', shortZh: '可调' },
    { key: 'axisC', label: 'Retention / Hold', labelZh: '锁定力', short: 'Hold', shortZh: '锁定' },
    { key: 'axisD', label: 'Comfort', labelZh: '舒适度', short: 'Comfort', shortZh: '舒适' },
    { key: 'axisE', label: 'Weight', labelZh: '重量', short: 'Weight', shortZh: '重量' },
    { key: 'axisF', label: 'Durability', labelZh: '耐用度', short: 'Durable', shortZh: '耐用' },
  ],
};

/** The ordered, localized axis metadata (key, label, short) for one gear category. */
export const getPerformanceAxes = (
  category: GearCategory,
  language: Language = 'en',
): PerformanceAxisMeta[] =>
  GEAR_CATEGORY_AXES[category].map(({ key, label, labelZh, short, shortZh }) => ({
    key,
    label: language === 'zh' ? labelZh : label,
    short: language === 'zh' ? shortZh : short,
  }));

/** Structural subset of `GearItem` needed to derive a performance profile. */
interface PerformanceInput {
  /** Used only to seed deterministic variety for subjective attributes (e.g. helmet "Style"). */
  id?: string;
  category: GearCategory;
  activity?: Activity | 'both';
  styles?: RidingStyle[];
  levels?: Level[];
  temps?: Temperature[];
  priceTier: BudgetTier;
  specs: Record<string, string | number>;
}

const clamp10 = (value: number) => Math.round(Math.min(Math.max(value, 0), 10) * 10) / 10;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

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

/** Pulls the gram figure out of a "1,850 g @ 27.5" style weight string. */
const parseGrams = (raw: string): number | null => {
  const match = raw.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*g/i);
  return match ? Number(match[1]) : null;
};

/** Stable FNV-1a hash used to give purely subjective attributes deterministic per-item variety. */
const hash = (value: string): number => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
};

const hashScore = (seed: string): number => clamp10((hash(seed) % 1000) / 100);

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

  const park = clamp10(
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

  return { axisA: carving, axisB: powderFloat, axisC: park, axisD: stability, axisE: versatility, axisF: accessibility };
}

function bootProfile(item: PerformanceInput): PerformanceProfile {
  const isBoard = item.activity === 'snowboard';
  const { styles, levels } = item;
  const rawFlex = numeric(item.specs, 'flex');
  // Ski boots run 60–140 flex; snowboard boots already sit on a 1–10 scale.
  const flex = rawFlex === null ? 5 : isBoard ? clamp10(rawFlex) : clamp10((rawFlex - 60) / 8);

  const linerText = text(item.specs, 'liner');
  const closureText = `${text(item.specs, 'closure')} ${text(item.specs, 'lacing')}`;
  const heelText = `${closureText} ${text(item.specs, 'cuffAlignment')} ${text(item.specs, 'cuff')}`;
  const weightG = parseGrams(text(item.specs, 'weight'));

  const comfort = clamp10(
    5 +
      (/heat|custom|thermo|memory|plush|fur/.test(linerText) ? 2 : 0) +
      (/boa/.test(closureText) ? 1.5 : 0) -
      (flex > 7 ? 1 : 0),
  );

  const heelHold = clamp10(5 + (/heel|conda|wrap|dual/.test(heelText) ? 2.5 : 0) + (flex > 6 ? 1 : 0));

  const walkability = clamp10(
    (isBoard ? 7 : 4) +
      (item.specs.walkMode ? 3 : 0) -
      flex * 0.3 +
      (weightG !== null ? clamp((1800 - weightG) / 300, -2, 2) : 0),
  );

  const warmth = clamp10(
    5 + (/fur|warm|thermo|heat/.test(linerText) ? 2.5 : 0) + (has(styles, 'backcountry') ? -1 : 0),
  );

  const response = clamp10(
    flex * 0.6 +
      (/boa|precision/.test(closureText) ? 1.5 : 0) +
      (weightG !== null ? clamp((1900 - weightG) / 250, -1.5, 1.5) : 0) +
      levelAverage(levels) * 0.4,
  );

  return { axisA: flex, axisB: comfort, axisC: heelHold, axisD: walkability, axisE: warmth, axisF: response };
}

function helmetProfile(item: PerformanceInput): PerformanceProfile {
  const vents = numeric(item.specs, 'vents') ?? 10;
  const rotational = text(item.specs, 'rotational');
  const certification = text(item.specs, 'certification');
  const construction = text(item.specs, 'construction');
  const fitText = `${text(item.specs, 'fit')} ${text(item.specs, 'ventControl')}`;
  const warmthSpec = numeric(item.specs, 'warmth');
  const weightG = parseGrams(text(item.specs, 'weight'));

  const ventilation = clamp10(vents / 2.1);

  const impactProtection = clamp10(
    5 +
      (/mips/.test(rotational) ? 3 : 0) +
      (/class b/.test(certification) ? 1 : 0) +
      (/koroyd|honeycomb|hybrid/.test(construction) ? 1 : 0),
  );

  const weight = weightG !== null ? clamp10(10 - (weightG - 400) / 12) : 5;

  const comfort = clamp10(
    5 +
      (/dial|custom|boa|precision/.test(fitText) ? 2 : 0) +
      (warmthSpec !== null ? clamp((warmthSpec - 3) * 0.5, -1, 1) : 0),
  );

  const fitAdjustment = clamp10(4 + (/dial|adjustable|boa|custom/.test(fitText) ? 4 : 0) + (vents > 12 ? 1 : 0));

  const style = clamp10(
    hashScore(`${item.id ?? ''}-${construction}-${vents}`) * 0.6 +
      (item.priceTier === 'premium' ? 3 : item.priceTier === 'mid-range' ? 1.5 : 0),
  );

  return { axisA: ventilation, axisB: impactProtection, axisC: weight, axisD: comfort, axisE: fitAdjustment, axisF: style };
}

function goggleProfile(item: PerformanceInput): PerformanceProfile {
  const shape = text(item.specs, 'lensShape');
  const techText = text(item.specs, 'lensTech');
  const antiFogText = text(item.specs, 'antiFog');
  const fitText = text(item.specs, 'fit');
  const spareLensText = text(item.specs, 'spareLens');

  const fieldOfView = clamp10(
    5 +
      (/spherical|toric/.test(shape) ? 2 : 0) +
      (/field of view|birdseye|wide/.test(techText) ? 2.5 : 0) +
      (/rimless/.test(shape) ? 1 : 0),
  );

  const antiFogDigits = Number(antiFogText.match(/\d+/)?.[0] ?? 0);
  const antiFog = antiFogText
    ? clamp10(6 + antiFogDigits * 0.3 + (/double|integral|dual/.test(antiFogText) ? 1.5 : 0))
    : 3;

  const lensClarity = clamp10(
    5 +
      (/chromapop|prizm|sigma|perceive/.test(techText) ? 3 : 0) +
      (item.priceTier === 'premium' ? 1 : item.priceTier === 'budget' ? -0.5 : 0),
  );

  const fit = clamp10(5.5 + (/toric/.test(shape) ? 1.5 : 0) + (/large/.test(fitText) ? 0.5 : 0));

  const helmetCompatibility = /helmet compatible/.test(fitText) ? 10 : 7.5;

  const isMagnetic = /mag/.test(techText) || /mag/.test(spareLensText);
  const lensInterchangeability = isMagnetic ? 10 : item.specs.spareLens ? 6.5 : 3;

  return {
    axisA: fieldOfView,
    axisB: antiFog,
    axisC: lensClarity,
    axisD: fit,
    axisE: helmetCompatibility,
    axisF: lensInterchangeability,
  };
}

function jacketProfile(item: PerformanceInput): PerformanceProfile {
  const wpText = text(item.specs, 'waterproofing');
  const pitZipsText = text(item.specs, 'pitZips');
  const seamsText = text(item.specs, 'seams');
  const fitText = text(item.specs, 'fit');
  const warmthSpec = numeric(item.specs, 'warmth');
  const weightG = parseGrams(text(item.specs, 'weight'));

  const ratingMatch = wpText.match(/(\d+)k/);
  const waterproofing = ratingMatch
    ? clamp10(Number(ratingMatch[1]) / 3)
    : /gore-tex|3l/.test(wpText)
      ? 7
      : 5;

  const breathability = clamp10(
    4 + (pitZipsText ? (/full|mesh/.test(pitZipsText) ? 3 : 2) : 0) + (/3l/.test(wpText) ? 1.5 : 0),
  );

  const insulation = warmthSpec !== null ? clamp10(warmthSpec * 2) : 5;

  const durability = clamp10(
    5 +
      (/80d|n80p|ripstop/.test(wpText) ? 1.5 : 0) +
      (/fully taped/.test(seamsText) ? 1 : 0.5) +
      (/3l/.test(wpText) ? 1 : 0),
  );

  const weight = weightG !== null ? clamp10(10 - (weightG - 500) / 60) : 5;

  const mobility = clamp10(
    5 +
      (/stretch|articulated|freeride|regular/.test(fitText) ? 1.5 : 0) -
      (insulation > 7 ? 1.5 : 0) +
      (weightG !== null ? clamp((800 - weightG) / 200, -1.5, 1.5) : 0),
  );

  return { axisA: waterproofing, axisB: breathability, axisC: insulation, axisD: durability, axisE: weight, axisF: mobility };
}

function bindingProfile(item: PerformanceInput): PerformanceProfile {
  const isBoard = item.activity === 'snowboard';
  const weightG = parseGrams(text(item.specs, 'weight'));
  const materialText = text(item.specs, 'material');

  let responsiveness: number;
  let adjustability: number;
  let retention: number;

  if (isBoard) {
    const flexRating = parseRatingOf10(text(item.specs, 'flexRating'));
    responsiveness = clamp10(flexRating ?? 5);

    const highbackText = text(item.specs, 'highback');
    const compatibilitySlashes = (text(item.specs, 'compatibility').match(/\//g) ?? []).length;
    adjustability = clamp10(
      5 + (/adjust|canted|forward-lean/.test(highbackText) ? 2 : 0) + compatibilitySlashes * 0.8,
    );

    const strapsText = text(item.specs, 'straps');
    retention = clamp10(5 + (/dual/.test(strapsText) ? 2 : 0) + (/ratchet|ladder/.test(strapsText) ? 1.5 : 0));
  } else {
    const dinNumbers = text(item.specs, 'dinRange').match(/[\d.]+/g)?.map(Number) ?? [];
    const dinMin = dinNumbers[0];
    const dinMax = dinNumbers[dinNumbers.length - 1];
    responsiveness = clamp10(dinMax !== undefined ? dinMax * 0.7 : 6);

    const brakeText = text(item.specs, 'brakeWidth');
    const soleText = text(item.specs, 'soleCompatibility');
    adjustability = clamp10(
      5 +
        (dinMax !== undefined && dinMin !== undefined ? (dinMax - dinMin) * 0.5 : 0) +
        (/adjustable/.test(brakeText) ? 1.5 : 0) +
        (/adjustable/.test(soleText) ? 1.5 : 0),
    );

    const elasticityText = text(item.specs, 'elasticity');
    const mmMatch = elasticityText.match(/(\d+)\s*mm/);
    retention = clamp10(5 + (mmMatch ? Number(mmMatch[1]) / 6 : 0) + (item.specs.certification ? 1 : 0));
  }

  const comfortText = `${text(item.specs, 'baseplate')} ${text(item.specs, 'soleCompatibility')}`;
  const comfort = clamp10(
    5 + (/eva|cushion|pad/.test(comfortText) ? 2 : 0) + (weightG !== null ? clamp((900 - weightG) / 200, -1, 1) : 0),
  );

  const weight = weightG !== null ? clamp10(10 - (weightG - 600) / 50) : 5;

  const durability = clamp10(
    5 +
      (/aluminum|steel|metal/.test(materialText) ? 2.5 : 0) +
      (item.specs.certification ? 1 : 0) +
      (/nylon|composite|plastic/.test(materialText) && !/aluminum|steel|metal/.test(materialText) ? -0.5 : 0),
  );

  return {
    axisA: responsiveness,
    axisB: adjustability,
    axisC: retention,
    axisD: comfort,
    axisE: weight,
    axisF: durability,
  };
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
    case 'bindings':
      return bindingProfile(item);
    default:
      return { axisA: 5, axisB: 5, axisC: 5, axisD: 5, axisE: 5, axisF: 5 };
  }
}
