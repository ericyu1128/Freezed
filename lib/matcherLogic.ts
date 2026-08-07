/**
 * Freezed — matching engine
 * Made by Eric Yu
 *
 * Pure, dependency-free functions. Everything here is deterministic so the same
 * profile always produces the same recommendation set.
 */

import { computeCompatibility } from './compatibilityScore';
import gearDatabase from './gearDatabase';
import type { Language } from './i18n/translations';
import type {
  BudgetTier,
  CalculatedSpecRow,
  CalculatedSpecs,
  DerivationStep,
  GearCategory,
  GearItem,
  Gender,
  LengthCalculation,
  Level,
  MatchResult,
  NumericRange,
  RankedCandidate,
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

export const CATEGORY_ORDER: GearCategory[] = ['skis', 'boots', 'bindings', 'helmet', 'goggles', 'jacket'];

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

/* ------------------------------------------------------------------ */
/*  Localized (zh) label variants                                      */
/*                                                                      */
/*  These sit alongside the English-only maps above, which stay as the */
/*  ground truth consumed by the narrative generators further down     */
/*  this file (buildReasoning, buildReasonBullets, calculateLength …). */
/*  The `*Label` helpers here are what UI components call at render    */
/*  time, so switching language re-renders these instantly even for an */
/*  already-generated result.                                          */
/* ------------------------------------------------------------------ */

export const TIER_LABEL_ZH: Record<BudgetTier, string> = {
  budget: '入门 / 高性价比',
  'mid-range': '性能与价格均衡',
  premium: '顶级 / 专业级结构',
};

export const TEMPERATURE_LABEL_ZH: Record<Temperature, string> = {
  freezing: '严寒 — 零下 15°C 及以下',
  moderate: '适中 — 零下 5°C 到 0°C',
  spring: '春季 — 0°C 以上',
};

export const STYLE_LABEL_ZH: Record<RidingStyle, string> = {
  piste: '压雪道 / 刻滑',
  'all-mountain': '全地形',
  freestyle: '自由式 / 公园',
  backcountry: '野雪 / 后山穿越',
};

export const LEVEL_LABEL_ZH: Record<Level, string> = {
  beginner: '初学者',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家级',
};

export const tierLabel = (tier: BudgetTier, language: Language): string =>
  language === 'zh' ? TIER_LABEL_ZH[tier] : TIER_LABEL[tier];

export const temperatureLabel = (temperature: Temperature, language: Language): string =>
  language === 'zh' ? TEMPERATURE_LABEL_ZH[temperature] : TEMPERATURE_LABEL[temperature];

export const styleLabel = (style: RidingStyle, language: Language): string =>
  language === 'zh' ? STYLE_LABEL_ZH[style] : STYLE_LABEL[style];

export const levelLabel = (level: Level, language: Language): string =>
  language === 'zh' ? LEVEL_LABEL_ZH[level] : LEVEL_LABEL[level];

const CATEGORY_LABEL_ZH: Record<GearCategory, { ski: string; snowboard: string }> = {
  skis: { ski: '雪板', snowboard: '单板' },
  boots: { ski: '双板雪靴', snowboard: '单板雪靴' },
  bindings: { ski: '双板固定器', snowboard: '单板固定器' },
  helmet: { ski: '头盔', snowboard: '头盔' },
  goggles: { ski: '护目镜', snowboard: '护目镜' },
  jacket: { ski: '外套', snowboard: '外套' },
};

const LENGTH_TYPE_LABEL: Record<UserStats['activity'], { en: string; zh: string }> = {
  ski: { en: 'Ski length', zh: '滑雪板长度' },
  snowboard: { en: 'Board length', zh: '单板长度' },
};

export const lengthTypeLabel = (activity: UserStats['activity'], language: Language): string =>
  LENGTH_TYPE_LABEL[activity][language];

export const categoryLabel = (
  category: GearCategory,
  activity: UserStats['activity'],
  language: Language = 'en',
): string => {
  if (language === 'zh') return CATEGORY_LABEL_ZH[category][activity === 'snowboard' ? 'snowboard' : 'ski'];

  switch (category) {
    case 'skis':
      return activity === 'snowboard' ? 'Snowboard' : 'Skis';
    case 'boots':
      return activity === 'snowboard' ? 'Snowboard Boots' : 'Ski Boots';
    case 'bindings':
      return activity === 'snowboard' ? 'Snowboard Bindings' : 'Ski Bindings';
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

export const calculateLength = (stats: UserStats, language: Language = 'en'): LengthCalculation => {
  const isBoard = stats.activity === 'snowboard';
  const zh = language === 'zh';
  const steps: DerivationStep[] = [];

  let value: number;

  if (isBoard) {
    const base = stats.height * 0.88;
    steps.push({
      label: zh ? '基础值(身高 × 0.88)' : 'Base (height × 0.88)',
      delta: round(base),
      note: zh ? `身高 ${stats.height} 厘米` : `${stats.height} cm rider height`,
    });
    value = base;
  } else {
    steps.push({
      label: zh ? '站立身高' : 'Standing height',
      delta: stats.height,
      note: zh ? '起始基准' : 'Starting point',
    });
    value = stats.height;
  }

  const styleOffset = isBoard ? BOARD_STYLE_OFFSET[stats.style] : SKI_STYLE_OFFSET[stats.style];
  steps.push({
    label: styleLabel(stats.style, language),
    delta: styleOffset,
    note:
      stats.style === 'backcountry'
        ? zh
          ? '增加长度以提升浮力和高速稳定性，适应松软雪况'
          : 'Longer for float and high-speed stability in soft snow'
        : stats.style === 'freestyle'
          ? zh
            ? '缩短长度以便于转体、反脚落地和玩道具'
            : 'Shorter for spins, switch landings and rail control'
          : stats.style === 'piste'
            ? zh
              ? '缩短长度以在硬雪面上更快换刃'
              : 'Shorter for quicker edge-to-edge on hardpack'
            : zh
              ? '适合综合地形的平衡长度'
              : 'Balanced length for mixed terrain',
  });
  value += styleOffset;

  const levelOffset = isBoard ? BOARD_LEVEL_OFFSET[stats.level] : SKI_LEVEL_OFFSET[stats.level];
  steps.push({
    label: levelLabel(stats.level, language),
    delta: levelOffset,
    note:
      stats.level === 'beginner'
        ? zh
          ? '再缩短 5 厘米——更容易入弯和收弯'
          : 'Extra 5 cm shorter — easier to initiate and finish turns'
        : stats.level === 'expert'
          ? zh
            ? '增加长度以提升高速稳定性'
            : 'Longer for stability at speed'
          : stats.level === 'advanced'
            ? zh
              ? '略微增加长度以提升高速抓地力'
              : 'Slightly longer for edge hold at speed'
            : zh
              ? '该水平的标准长度'
              : 'Standard length for this ability',
  });
  value += levelOffset;

  // Freeride / powder bonus for strong riders — the "add 5 to 10 cm" case.
  if (stats.style === 'backcountry' && (stats.level === 'advanced' || stats.level === 'expert')) {
    const bonus = isBoard ? 2 : 4;
    steps.push({
      label: zh ? '自由滑雪浮力加成' : 'Freeride float bonus',
      delta: bonus,
      note: zh ? '增加板面面积以应对深雪高速滑行' : 'Additional surface area for deep snow at speed',
    });
    value += bonus;
  }

  const wMod = weightModifier(stats);
  if (wMod !== 0) {
    steps.push({
      label: zh ? '体重负荷' : 'Rider load',
      delta: wMod,
      note:
        wMod > 0
          ? zh
            ? `体重 ${stats.weight} 公斤高于身高 ${stats.height} 厘米对应的参考体重——增加长度以避免过度形变`
            : `${stats.weight} kg is above the reference mass for ${stats.height} cm — more length to avoid over-flexing`
          : zh
            ? `体重 ${stats.weight} 公斤低于身高 ${stats.height} 厘米对应的参考体重——减少长度以保持硬度易于压弯`
            : `${stats.weight} kg is below the reference mass for ${stats.height} cm — less length to keep the flex accessible`,
    });
    value += wMod;
  }

  if (stats.gender === 'female' && !isBoard) {
    steps.push({
      label: zh ? '女款结构' : "Women's construction",
      delta: -2,
      note: zh
        ? '女款雪板通常更轻，略短的长度骑行效果最佳'
        : "Women's skis are typically built lighter and ride best slightly shorter",
    });
    value -= 2;
  }

  const final = clamp(round(value), isBoard ? 128 : 140, isBoard ? 168 : 195);

  return {
    value: final,
    range: { min: final - 4, max: final + 4 },
    steps,
    label: lengthTypeLabel(stats.activity, language),
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
/*  6. Budget filtering                                                */
/* ------------------------------------------------------------------ */

/**
 * Items that survive the hard budget filter (never more than one tier
 * away). This is the one hard constraint left in the pipeline — category
 * and price tier decide what's even in the running; everything else is
 * scored continuously by `computeCompatibility` (see `compatibilityScore.ts`).
 */
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

/* ------------------------------------------------------------------ */
/*  7. Dynamic card specs + generated reasoning                        */
/* ------------------------------------------------------------------ */

const cheapest = (prices: RetailerPrice[]): RetailerPrice =>
  prices.reduce((best, current) => (current.price < best.price ? current : best), prices[0]);

export const buildCalculatedSpecs = (
  item: GearItem,
  stats: UserStats,
  specs: CalculatedSpecs,
  language: Language = 'en',
): CalculatedSpecRow[] => {
  const rows: CalculatedSpecRow[] = [];
  const zh = language === 'zh';
  const lengthLabel = lengthTypeLabel(stats.activity, language);

  switch (item.category) {
    case 'skis':
      rows.push({
        label: zh ? `推荐${lengthLabel}` : `Recommended ${lengthLabel.toLowerCase()}`,
        value: `${specs.length.value} cm`,
        highlight: true,
      });
      rows.push({
        label: zh ? '推荐适用区间' : 'Acceptable window',
        value: `${specs.length.range.min}–${specs.length.range.max} cm`,
      });
      rows.push({
        label: zh ? '板腰宽度' : stats.activity === 'snowboard' ? 'Board waist' : 'Waist width',
        value: `${item.specs.waistWidth} mm (target ${specs.waistWidth.min}–${specs.waistWidth.max} mm)`,
        highlight: true,
      });
      rows.push({ label: zh ? '可选长度' : 'Available lengths', value: String(item.specs.lengths ?? '—') });
      break;

    case 'boots':
      rows.push({
        label: zh ? '推荐硬度' : 'Recommended flex',
        value:
          stats.activity === 'snowboard'
            ? `${specs.bootFlex.min}–${specs.bootFlex.max} / 10`
            : `${specs.bootFlex.min}–${specs.bootFlex.max}`,
        highlight: true,
      });
      rows.push({
        label: zh ? '这款雪鞋' : 'This boot',
        value:
          stats.activity === 'snowboard'
            ? `${item.specs.flex} / 10`
            : `${item.specs.flex} flex index`,
        highlight: true,
      });
      rows.push({ label: zh ? '预估 Mondo 码' : 'Estimated Mondo size', value: `${specs.mondoSize.toFixed(1)}` });
      if (item.specs.lastWidth)
        rows.push({ label: zh ? '鞋楦宽度 (mm)' : 'Last width', value: String(item.specs.lastWidth) });
      break;

    case 'bindings':
      rows.push({
        label: zh
          ? stats.activity === 'snowboard'
            ? '硬度等级'
            : 'DIN 释放值范围'
          : stats.activity === 'snowboard'
            ? 'Flex rating'
            : 'DIN range',
        value: String(item.specs.flexRating ?? item.specs.dinRange ?? '—'),
        highlight: true,
      });
      rows.push({ label: zh ? '重量' : 'Weight', value: String(item.specs.weight ?? '—') });
      rows.push({
        label: zh
          ? stats.activity === 'snowboard'
            ? '固定器兼容性'
            : '鞋底兼容性'
          : stats.activity === 'snowboard'
            ? 'Mount compatibility'
            : 'Sole compatibility',
        value: String(item.specs.compatibility ?? item.specs.soleCompatibility ?? '—'),
      });
      break;

    case 'helmet':
      rows.push({ label: zh ? '推荐尺码' : 'Recommended size', value: specs.helmetSize, highlight: true });
      rows.push({ label: zh ? '头围' : 'Head circumference', value: specs.helmetCircumference });
      rows.push({ label: zh ? '认证标准' : 'Certification', value: String(item.specs.certification ?? '—') });
      rows.push({
        label: zh ? '通风系统' : 'Venting',
        value: String(item.specs.ventControl ?? item.specs.vents ?? '—'),
      });
      break;

    case 'goggles':
      rows.push({
        label: zh ? '适合你天气条件的目标 VLT' : 'Target VLT for your conditions',
        value: `${specs.vlt.min}–${specs.vlt.max}%`,
        highlight: true,
      });
      rows.push({ label: zh ? '这款镜片' : 'This lens', value: `${item.specs.vlt}% VLT`, highlight: true });
      rows.push({ label: zh ? '镜片色调' : 'Tint', value: String(item.specs.lensTint ?? '—') });
      if (item.specs.spareLens)
        rows.push({ label: zh ? '备用镜片' : 'Spare lens', value: String(item.specs.spareLens) });
      break;

    case 'jacket':
      rows.push({
        label: zh ? '目标保暖等级' : 'Target warmth',
        value: `${specs.warmth.min}–${specs.warmth.max} / 5`,
        highlight: true,
      });
      rows.push({ label: zh ? '这款外套' : 'This jacket', value: `${item.specs.warmth} / 5`, highlight: true });
      rows.push({ label: zh ? '保暖材质' : 'Insulation', value: String(item.specs.insulation ?? '—') });
      rows.push({ label: zh ? '防水等级' : 'Waterproofing', value: String(item.specs.waterproofing ?? '—') });
      break;

    default:
      break;
  }

  return rows;
};

export const buildReasonBullets = (
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
    case 'bindings': {
      if (stats.activity === 'snowboard') {
        bullets.push(
          `Flex rating ${item.specs.flexRating} suits ${LEVEL_LABEL[stats.level].toLowerCase()} riders who want ${
            stats.level === 'beginner' || stats.level === 'intermediate'
              ? 'a forgiving, easy-to-load response'
              : 'a stiffer, more direct power transfer'
          }.`,
        );
      } else {
        bullets.push(
          `A ${item.specs.dinRange} DIN range gives a ${LEVEL_LABEL[stats.level].toLowerCase()} skier a release setting with real headroom either side.`,
        );
      }
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

export const buildReasoning = (item: GearItem, stats: UserStats, specs: CalculatedSpecs): string => {
  const rider = `a ${stats.height} cm / ${stats.weight} kg ${LEVEL_LABEL[stats.level].toLowerCase()} ${
    stats.activity === 'ski' ? 'skier' : 'snowboarder'
  }`;

  switch (item.category) {
    case 'skis':
      return `For ${rider} riding mostly ${STYLE_LABEL[stats.style].toLowerCase()} terrain, the ${item.brand} ${item.name} is sized to ${specs.length.value} cm with a ${item.specs.waistWidth} mm waist. ${item.matchReason} Filtered to your ${TIER_LABEL[stats.budgetTier].toLowerCase()} budget, it was the strongest hardgood match in the database.`;
    case 'boots':
      return `Boots are the highest-leverage purchase in the kit. Your profile calls for a ${specs.bootFlex.min}–${specs.bootFlex.max} flex${stats.activity === 'snowboard' ? '/10' : ''}, and the ${item.brand} ${item.name} sits at ${item.specs.flex}. ${item.matchReason} Get a shell fit at a shop before you commit — the estimated Mondo ${specs.mondoSize.toFixed(1)} is a starting point, not a verdict.`;
    case 'bindings':
      return `The ${item.brand} ${item.name} is set up around ${
        stats.activity === 'snowboard' ? `a ${item.specs.flexRating} flex rating` : `a ${item.specs.dinRange} DIN range`
      } for ${rider}. ${item.matchReason} A shop tech should still set and check the ${
        stats.activity === 'snowboard' ? 'strap tension' : 'release DIN'
      } against your boot before the first run.`;
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

/** How many ranked candidates to surface per category in the UI. */
const MAX_CANDIDATES = 6;

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

    const ranked: RankedCandidate[] = pool
      .map((item) => {
        const { score, contributions } = computeCompatibility(item, stats, specs);
        return { item, score, breakdown: contributions, bestPrice: cheapest(item.prices) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_CANDIDATES);

    if (ranked.length === 0) return null;

    const winner = ranked[0];

    return {
      category,
      item: winner.item,
      score: winner.score,
      reasoning: buildReasoning(winner.item, stats, specs),
      reasonBullets: buildReasonBullets(winner.item, stats, specs),
      bestPrice: winner.bestPrice,
      candidates: ranked,
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
