/**
 * Freezed — matching engine
 * Made by Eric Yu
 *
 * Pure, dependency-free functions. Everything here is deterministic so the same
 * profile always produces the same recommendation set.
 */

import { computeCompatibility } from './compatibilityScore';
import gearDatabase from './gearDatabase';
import { itemMatchReason } from './i18n/gearCopy';
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
/*  The `*Label` helpers here, like every narrative generator in this  */
/*  file (buildReasoning, buildReasonBullets, buildCalculatedSpecs,    */
/*  calculateLength …), take a language and are called at render time, */
/*  so switching language re-renders an already-generated result.      */
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
 * Base offset from standing height, in cm, by riding style. Modern
 * all-mountain and powder skis lean heavily on tip/tail rocker, which
 * shortens effective edge contact — so they're sized much closer to (or
 * above) standing height than older camber-only norms. Carving and park
 * skis stay shorter since their sidecut/tricks reward a quicker-turning,
 * more manageable length.
 */
const SKI_STYLE_OFFSET: Record<RidingStyle, number> = {
  piste: -8, // shorter = quicker edge-to-edge on groomers
  'all-mountain': -3, // roughly nose height — modern rockered all-mountain norm
  freestyle: -10, // shortest = spins & switch landings
  backcountry: 3, // at or above height = float and stability on rockered pow skis
};

/** Ability modifier. Beginners go shorter, experts go longer. */
const SKI_LEVEL_OFFSET: Record<Level, number> = {
  beginner: -8,
  intermediate: 0,
  advanced: 4,
  expert: 8,
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

/**
 * Powder/backcountry skis carry most of their rocker in the tip and tail,
 * which shortens effective edge contact — so the whole ski needs to run
 * longer than an all-mountain camber ski to hold the same edge grip and
 * float the same rider. Scales with ability because faster, more
 * aggressive backcountry skiers push that float harder and benefit most.
 */
const SKI_BACKCOUNTRY_FLOAT_BONUS: Record<Level, number> = {
  beginner: 2,
  intermediate: 4,
  advanced: 7,
  expert: 9,
};

/** Broca-style expected mass for a given height, used for the load modifier. */
const expectedWeightKg = (heightCm: number, gender: Gender): number => {
  const base = (heightCm - 100) * 0.9;
  if (gender === 'female') return base - 3;
  return base;
};

/**
 * Heavier riders flex a ski more, so they benefit from extra length (and
 * vice-versa). Capped at ±6 cm so it never dominates the calculation.
 */
const weightModifier = (stats: UserStats): number => {
  const delta = stats.weight - expectedWeightKg(stats.height, stats.gender);
  return clamp(Math.round(delta / 5), -6, 6);
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
          ? '进一步缩短——更容易入弯和收弯'
          : 'Shorter — easier to initiate and finish turns'
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

  // Freeride / powder bonus. Skis scale this with ability since it's driven
  // by how much rocker-float the rider actually pushes; boards keep the
  // simpler flat bonus for advanced/expert riders only.
  if (stats.style === 'backcountry') {
    const bonus = isBoard
      ? stats.level === 'advanced' || stats.level === 'expert'
        ? 2
        : 0
      : SKI_BACKCOUNTRY_FLOAT_BONUS[stats.level];
    if (bonus !== 0) {
      steps.push({
        label: zh ? '自由滑雪浮力加成' : 'Freeride float bonus',
        delta: bonus,
        note: zh ? '增加板面面积以应对深雪高速滑行' : 'Additional surface area for deep snow at speed',
      });
      value += bonus;
    }
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

  const final = clamp(round(value), isBoard ? 128 : 140, isBoard ? 168 : 200);

  return {
    value: final,
    range: { min: final - 5, max: final + 5 },
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

const needsWideBoard = (stats: UserStats): boolean => estimateMondoSize(stats) >= 27.5;

export const calculateWaistWidth = (stats: UserStats): NumericRange => {
  if (stats.activity === 'snowboard') {
    return needsWideBoard(stats) ? { min: 256, max: 265 } : { min: 245, max: 255 };
  }
  return SKI_WAIST[stats.style];
};

/** Caption for the waist window, rendered at display time in the current language. */
export const waistWidthLabel = (stats: UserStats, language: Language = 'en'): string => {
  const zh = language === 'zh';
  if (stats.activity === 'snowboard') {
    if (needsWideBoard(stats)) return zh ? '宽板腰(防止脚尖/脚跟拖雪)' : 'Wide board waist (prevents toe/heel drag)'; // zh: needs review
    return zh ? '标准板腰' : 'Standard board waist'; // zh: needs review
  }
  return zh ? `${styleLabel(stats.style, 'zh')}腰宽区间` : `${STYLE_LABEL[stats.style]} waist window`; // zh: needs review
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

export const calculateBootFlex = (stats: UserStats): NumericRange => {
  if (stats.activity === 'snowboard') return BOARD_FLEX[stats.level];
  return (stats.gender === 'female' ? SKI_FLEX_WOMEN : SKI_FLEX_MEN)[stats.level];
};

/** Caption for the boot flex target, rendered at display time in the current language. */
export const bootFlexLabel = (stats: UserStats, language: Language = 'en'): string => {
  const zh = language === 'zh';
  if (stats.activity === 'snowboard') return zh ? '硬度等级(1–10)' : 'Flex rating (1–10 scale)'; // zh: needs review
  const isTopEnd = stats.level === 'advanced' || stats.level === 'expert';
  if (zh) {
    // zh: needs review
    return `${stats.gender === 'female' ? '女款' : '男款 / 中性'}硬度指数${isTopEnd ? '(竞技级可达 140+)' : ''}`;
  }
  return `${stats.gender === 'female' ? "Women's" : "Men's / unisex"} flex index${isTopEnd ? ' (140+ for race)' : ''}`;
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

const LENS_GUIDANCE: Record<Temperature, Record<Language, string>> = {
  freezing: {
    en: 'Deep-cold days usually mean storms and flat light. A high-VLT rose, yellow or amber lens lifts terrain contrast so you can read moguls and rollovers you would otherwise ski straight into.',
    // zh: needs review
    zh: '严寒天往往伴随降雪和平光。高透光率的玫瑰色、黄色或琥珀色镜片能拉高地形对比度，让你看清那些本来会一头撞上的雪包和起伏。',
  },
  moderate: {
    en: 'Mixed light calls for a mid-VLT lens in the 18–40% window — usable in sun, still workable when a cloud bank moves over.',
    // zh: needs review
    zh: '光线多变时，选 18–40% 透光率的中间档镜片——出太阳能用，云层压过来也还看得清。',
  },
  spring: {
    en: 'Above 0 °C means wet, highly reflective snow and hard glare. A low-VLT polarised or mirrored lens cuts that reflection and reduces eye fatigue over a long day.',
    // zh: needs review
    zh: '0°C 以上意味着湿雪、强反光和刺眼的眩光。低透光率的偏光或镀膜镜片能压住反射，滑一整天眼睛也不那么累。',
  },
};

export const lensGuidance = (temperature: Temperature, language: Language = 'en'): string =>
  LENS_GUIDANCE[temperature][language];

/** Target jacket warmth on the 1–5 scale used in the gear database. */
const WARMTH_TARGET: Record<Temperature, NumericRange> = {
  freezing: { min: 4, max: 5 },
  moderate: { min: 3, max: 4 },
  spring: { min: 1, max: 2 },
};

const JACKET_GUIDANCE: Record<Temperature, Record<Language, string>> = {
  freezing: {
    en: 'At -15 °C and below, chairlift time is the enemy. You want a high-loft down or hybrid-down jacket with an insulated helmet-compatible hood — loft you cannot add back with a mid-layer.',
    // zh: needs review
    zh: '零下 15°C 及以下，最难熬的是坐缆车的时间。你需要一件高蓬松度的羽绒或混合羽绒外套，再配一个能罩住头盔的保暖帽兜——这种蓬松度是靠加中间层补不回来的。',
  },
  moderate: {
    en: 'Between -5 °C and 0 °C a moderately insulated 2L or 3L jacket hits the balance: warm on the lift, vented on the way down.',
    // zh: needs review
    zh: '零下 5°C 到 0°C 之间，一件中等填充的 2L 或 3L 外套最平衡：缆车上够暖，滑下来也能开拉链散热。',
  },
  spring: {
    en: 'Above 0 °C, insulation becomes dead weight. An uninsulated 2L/3L shell with real pit zips lets you dump heat and add a mid-layer only if the wind picks up.',
    // zh: needs review
    zh: '0°C 以上，填充就成了累赘。选一件无填充的 2L/3L 硬壳，带真正好用的腋下拉链，热了就散热，风大了再加中间层。',
  },
};

export const jacketGuidance = (temperature: Temperature, language: Language = 'en'): string =>
  JACKET_GUIDANCE[temperature][language];

/* ------------------------------------------------------------------ */
/*  5. Helmet sizing                                                   */
/* ------------------------------------------------------------------ */

const helmetSizing = (stats: UserStats): { size: string; circumferenceCm: number } => {
  // Head circumference correlates loosely with stature; presented as an estimate.
  const est = 40 + stats.height * 0.098 + (stats.gender === 'female' ? -1.5 : 0);
  const cm = round(clamp(est, 51, 63));
  let size = 'M';
  if (cm <= 53) size = 'S';
  else if (cm <= 55) size = 'S/M';
  else if (cm <= 58) size = 'M';
  else if (cm <= 61) size = 'L';
  else size = 'XL';
  return { size, circumferenceCm: cm };
};

export const helmetCircumferenceLabel = (cm: number, language: Language = 'en'): string =>
  language === 'zh' ? `≈ ${cm} 厘米——请实际测量确认` : `≈ ${cm} cm — measure to confirm`; // zh: needs review

/* ------------------------------------------------------------------ */
/*  Full spec sheet                                                    */
/* ------------------------------------------------------------------ */

/**
 * Language-neutral spec sheet. Every caption and guidance sentence derived
 * from it (`waistWidthLabel`, `bootFlexLabel`, `lensGuidance`,
 * `jacketGuidance`, `helmetCircumferenceLabel`) is generated at render time
 * in the current language, so switching language updates results already on
 * screen.
 */
export const calculateSpecs = (stats: UserStats): CalculatedSpecs => {
  const helmet = helmetSizing(stats);

  return {
    length: calculateLength(stats),
    waistWidth: calculateWaistWidth(stats),
    bootFlex: calculateBootFlex(stats),
    mondoSize: estimateMondoSize(stats),
    poleLength: stats.activity === 'ski' ? round((stats.height * 0.68) / 5) * 5 : null,
    vlt: VLT_TARGET[stats.temperature],
    warmth: WARMTH_TARGET[stats.temperature],
    helmetSize: helmet.size,
    helmetCircumferenceCm: helmet.circumferenceCm,
  };
};

/* ------------------------------------------------------------------ */
/*  6. Budget filtering                                                */
/* ------------------------------------------------------------------ */

/**
 * The one hard constraint left in the pipeline, and it is deliberately
 * asymmetric: spending less than planned is rarely a fit problem, spending
 * more is. Items cheaper than the rider's tier always stay in the pool (they
 * still take the budget penalty in `computeCompatibility`); only items more
 * than one tier MORE expensive are removed. Everything else is scored
 * continuously (see `compatibilityScore.ts`).
 */
export const filterByBudget = (items: GearItem[], budgetTier: BudgetTier): GearItem[] => {
  const affordable = items.filter((item) => TIER_INDEX[item.priceTier] - TIER_INDEX[budgetTier] <= 1);
  return affordable.length > 0 ? affordable : items;
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
        value: zh
          ? `${item.specs.waistWidth} mm(目标 ${specs.waistWidth.min}–${specs.waistWidth.max} mm)`
          : `${item.specs.waistWidth} mm (target ${specs.waistWidth.min}–${specs.waistWidth.max} mm)`,
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
            : zh
              ? `硬度指数 ${item.specs.flex}`
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
      rows.push({
        label: zh ? '头围' : 'Head circumference',
        value: helmetCircumferenceLabel(specs.helmetCircumferenceCm, language),
      });
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

/** Short zh names for price tiers, matching the questionnaire's budget option labels. */
const TIER_NAME_ZH: Record<BudgetTier, string> = { budget: '经济型', 'mid-range': '中端', premium: '高端' };

/**
 * Short bullet justifications for one item, in the requested language.
 * Generated at render time (like `buildCalculatedSpecs`) so switching
 * language updates a result that is already on screen.
 */
export const buildReasonBullets = (
  item: GearItem,
  stats: UserStats,
  specs: CalculatedSpecs,
  language: Language = 'en',
): string[] => {
  const zh = language === 'zh';
  const bullets: string[] = [];
  const level = levelLabel(stats.level, language);
  const style = styleLabel(stats.style, language);
  const temperature = temperatureLabel(stats.temperature, language);
  const tierOffset = TIER_INDEX[item.priceTier] - TIER_INDEX[stats.budgetTier];
  const tierWord = zh
    ? // zh: needs review
      tierOffset === 0
      ? `正好落在你的「${TIER_NAME_ZH[stats.budgetTier]}」预算档位`
      : tierOffset < 0
        ? `比你的「${TIER_NAME_ZH[stats.budgetTier]}」预算低${tierOffset === -1 ? '一' : '两'}档——花得比计划少，评分会${tierOffset === -1 ? '略' : '多'}扣一些，但仍参与排序`
        : tierOffset === 1
          ? `比你的「${TIER_NAME_ZH[stats.budgetTier]}」预算高一档，评分会因此扣分`
          : `比你的「${TIER_NAME_ZH[stats.budgetTier]}」预算高两档——只因没有更接近的选择才显示，评分扣分较多`
    : tierOffset === 0
      ? `sits exactly in your ${item.priceTier} bracket`
      : tierOffset < 0
        ? `is ${tierOffset === -1 ? 'one tier' : 'two tiers'} below your ${stats.budgetTier} bracket — it costs less than you planned, so it takes a ${tierOffset === -1 ? '' : 'larger '}budget penalty in the score but stays in the running`
        : tierOffset === 1
          ? `is one tier above your ${stats.budgetTier} bracket, so it takes a budget penalty in the score`
          : `is two tiers above your ${stats.budgetTier} bracket — shown only because nothing closer was available, and it takes a larger budget penalty in the score`;

  switch (item.category) {
    case 'skis': {
      const waist = numericSpec(item, 'waistWidth');
      if (waist !== null) {
        const { min, max } = specs.waistWidth;
        const inRange = waist >= min && waist <= max;
        const wider = waist > max;
        bullets.push(
          zh
            ? // zh: needs review
              inRange
              ? `${waist} mm 腰宽落在「${style}」所需的 ${min}–${max} mm 区间内。`
              : `${waist} mm 腰宽略超出你 ${min}–${max} mm 的目标——${wider ? '浮力更好，但换刃会慢一些' : '换刃更快，但浮力会弱一些'}。`
            : inRange
              ? `${waist} mm waist lands inside the ${min}–${max} mm window for ${STYLE_LABEL[stats.style].toLowerCase()} riding.`
              : `${waist} mm waist sits just outside your ${min}–${max} mm target — expect ${wider ? 'more float but slower edge-to-edge' : 'quicker edging but less float'}.`,
        );
      }
      bullets.push(
        zh
          ? `按你 ${stats.height} 厘米、${stats.weight} 公斤、${level}的水平计算，推荐长度为 ${specs.length.value} 厘米。` // zh: needs review
          : `At ${stats.height} cm and ${stats.weight} kg riding ${LEVEL_LABEL[stats.level].toLowerCase()}, your calculated length is ${specs.length.value} cm.`,
      );
      break;
    }
    case 'boots': {
      const flex = numericSpec(item, 'flex');
      if (flex !== null) {
        const { min, max } = specs.bootFlex;
        const inRange = flex >= min && flex <= max;
        const stiffer = flex > max;
        bullets.push(
          zh
            ? // zh: needs review
              inRange
              ? `硬度 ${flex} 落在${stats.gender === 'female' ? '女性' : ''}${level}玩家 ${min}–${max} 的目标区间内。`
              : `硬度 ${flex} 比你 ${min}–${max} 的目标${stiffer ? '更硬——支撑和传导更强，但容错更低' : '更软——更舒适，但驱动力弱一些'}。`
            : inRange
              ? `Flex ${flex} is inside your ${min}–${max} target for a ${LEVEL_LABEL[stats.level].toLowerCase()} ${stats.gender === 'female' ? 'female' : ''} rider.`.replace('  ', ' ')
              : `Flex ${flex} is ${stiffer ? 'stiffer' : 'softer'} than your ${min}–${max} target — ${stiffer ? 'more power, less forgiveness' : 'more comfort, less drive'}.`,
        );
      }
      bullets.push(
        zh
          ? `你的预估 Mondopoint 尺码是 ${specs.mondoSize.toFixed(1)}——请到雪具店做一次壳测确认。` // zh: needs review
          : `Your estimated Mondopoint size is ${specs.mondoSize.toFixed(1)} — get shell-fitted to confirm.`,
      );
      break;
    }
    case 'bindings': {
      const easy = stats.level === 'beginner' || stats.level === 'intermediate';
      if (stats.activity === 'snowboard') {
        bullets.push(
          zh
            ? `硬度等级 ${item.specs.flexRating}，适合想要${easy ? '柔和、好上手的反馈' : '更硬、更直接的力量传导'}的${level}玩家。` // zh: needs review
            : `Flex rating ${item.specs.flexRating} suits ${LEVEL_LABEL[stats.level].toLowerCase()} riders who want ${
                easy ? 'a forgiving, easy-to-load response' : 'a stiffer, more direct power transfer'
              }.`,
        );
      } else {
        bullets.push(
          zh
            ? `${item.specs.dinRange} 的 DIN 范围让${level}双板玩家的脱离值上下都留有余量。` // zh: needs review
            : `A ${item.specs.dinRange} DIN range gives a ${LEVEL_LABEL[stats.level].toLowerCase()} skier a release setting with real headroom either side.`,
        );
      }
      break;
    }
    case 'goggles': {
      const vlt = numericSpec(item, 'vlt');
      if (vlt !== null) {
        bullets.push(
          zh
            ? `${vlt}% 透光率，对应「${temperature}」条件下 ${specs.vlt.min}–${specs.vlt.max}% 的目标。` // zh: needs review
            : `${vlt}% VLT against a ${specs.vlt.min}–${specs.vlt.max}% target for ${TEMPERATURE_LABEL[stats.temperature].toLowerCase()} conditions.`,
        );
      }
      break;
    }
    case 'jacket': {
      const warmth = numericSpec(item, 'warmth');
      if (warmth !== null) {
        bullets.push(
          zh
            ? `保暖等级 ${warmth}/5，对应「${temperature}」的 ${specs.warmth.min}–${specs.warmth.max}/5 目标。` // zh: needs review
            : `Warmth ${warmth}/5 against a ${specs.warmth.min}–${specs.warmth.max}/5 target for ${TEMPERATURE_LABEL[stats.temperature].toLowerCase()}.`,
        );
      }
      break;
    }
    case 'helmet': {
      const circumference = helmetCircumferenceLabel(specs.helmetCircumferenceCm, language);
      bullets.push(
        zh
          ? `建议尺码 ${specs.helmetSize}(${circumference})，通过 ${item.specs.certification} 认证。` // zh: needs review
          : `Sized ${specs.helmetSize} (${circumference}) with ${item.specs.certification} certification.`,
      );
      break;
    }
    default:
      break;
  }

  if (item.styles?.includes(stats.style)) {
    bullets.push(zh ? `专为「${style}」设计。` : `Designed around ${STYLE_LABEL[stats.style].toLowerCase()} riding.`); // zh: needs review
  }
  if (item.levels?.includes(stats.level)) {
    bullets.push(zh ? `为${level}玩家调校。` : `Tuned for ${LEVEL_LABEL[stats.level].toLowerCase()} riders.`); // zh: needs review
  }
  // Prices are region-specific and shown in the card's own price block; this
  // bullet only explains how the price *tier* affected the score.
  bullets.push(zh ? `价格档位:${tierWord}。` : `Price tier: ${tierWord}.`); // zh: needs review

  return bullets;
};

/**
 * The "why this matches you" paragraph for one item, in the requested
 * language. `rank` is the item's 1-based position in its category, so only
 * the top pick is described as the strongest match.
 */
export const buildReasoning = (
  item: GearItem,
  stats: UserStats,
  specs: CalculatedSpecs,
  language: Language = 'en',
  rank = 1,
): string => {
  const zh = language === 'zh';
  const matchReason = itemMatchReason(item, language);
  const isBoard = stats.activity === 'snowboard';
  const level = levelLabel(stats.level, language);
  const product = `${item.brand} ${item.name}`;

  if (zh) {
    // zh: needs review
    const rider = `身高 ${stats.height} 厘米、体重 ${stats.weight} 公斤的${level}${isBoard ? '单板' : '双板'}玩家`;
    const vlt = numericSpec(item, 'vlt');
    switch (item.category) {
      case 'skis':
        return `对于主要在「${styleLabel(stats.style, 'zh')}」地形滑行的${rider}，${product} 推荐长度 ${specs.length.value} 厘米，腰宽 ${item.specs.waistWidth} mm。${matchReason}${
          rank === 1
            ? `在你的「${tierLabel(stats.budgetTier, 'zh')}」预算范围内，它是目录里和你最匹配的${isBoard ? '单板' : '雪板'}。`
            : `在你的「${tierLabel(stats.budgetTier, 'zh')}」预算范围内，它在这一类里排第 ${rank}。`
        }`;
      case 'boots':
        return `雪靴是整套装备里最关键的一件。按你的档案，硬度应在 ${specs.bootFlex.min}–${specs.bootFlex.max}${isBoard ? '/10' : ''}，${product} 为 ${item.specs.flex}。${matchReason}下单前先去雪具店做个壳测——预估的 Mondo ${specs.mondoSize.toFixed(1)} 只是起点，不是定论。`;
      case 'bindings':
        return `${product} 以${isBoard ? `${item.specs.flexRating} 的硬度` : `${item.specs.dinRange} 的 DIN 范围`}为${rider}而设定。${matchReason}第一趟滑行前，仍应请雪具店技师根据你的雪靴${isBoard ? '调好绑带' : '设定并检查 DIN 脱离值'}。`;
      case 'helmet':
        return `${product}，尺码 ${specs.helmetSize}。${matchReason}它和下面推荐的护目镜也能严丝合缝地贴合——这比大多数人想的更重要：帽檐和雪镜之间一留缝，额头最先冻僵。`;
      case 'goggles': {
        const inRange = vlt !== null && vlt >= specs.vlt.min && vlt <= specs.vlt.max;
        const position = inRange
          ? `落在你 ${specs.vlt.min}–${specs.vlt.max}% 的目标区间内`
          : `略超出你 ${specs.vlt.min}–${specs.vlt.max}% 的目标区间(偏${vlt !== null && vlt < specs.vlt.min ? '暗' : '亮'}一点)`;
        return `${lensGuidance(stats.temperature, 'zh')}${product} 透光率 ${item.specs.vlt}%，${position}。${matchReason}`;
      }
      case 'jacket':
        return `${jacketGuidance(stats.temperature, 'zh')}${product} 保暖等级 ${item.specs.warmth}/5，防水规格为 ${item.specs.waterproofing}。${matchReason}`;
      default:
        return matchReason;
    }
  }

  const rider = `a ${stats.height} cm / ${stats.weight} kg ${LEVEL_LABEL[stats.level].toLowerCase()} ${isBoard ? 'snowboarder' : 'skier'}`;
  const vlt = numericSpec(item, 'vlt');
  switch (item.category) {
    case 'skis':
      return `For ${rider} riding mostly ${STYLE_LABEL[stats.style].toLowerCase()} terrain, the ${product} is sized to ${specs.length.value} cm with a ${item.specs.waistWidth} mm waist. ${matchReason} ${
        rank === 1
          ? `Filtered to your ${TIER_LABEL[stats.budgetTier].toLowerCase()} budget, it was the strongest hardgood match in the database.`
          : `Filtered to your ${TIER_LABEL[stats.budgetTier].toLowerCase()} budget, it ranks #${rank} for you in this category.`
      }`;
    case 'boots':
      return `Boots are the highest-leverage purchase in the kit. Your profile calls for a ${specs.bootFlex.min}–${specs.bootFlex.max} flex${isBoard ? '/10' : ''}, and the ${product} sits at ${item.specs.flex}. ${matchReason} Get a shell fit at a shop before you commit — the estimated Mondo ${specs.mondoSize.toFixed(1)} is a starting point, not a verdict.`;
    case 'bindings':
      return `The ${product} is set up around ${
        isBoard ? `a ${item.specs.flexRating} flex rating` : `a ${item.specs.dinRange} DIN range`
      } for ${rider}. ${matchReason} A shop tech should still set and check the ${
        isBoard ? 'strap tension' : 'release DIN'
      } against your boot before the first run.`;
    case 'helmet':
      return `${product} in size ${specs.helmetSize}. ${matchReason} It also pairs cleanly with the goggle recommendation below, which matters more than most riders expect — a gap between brim and goggle is the fastest way to a cold forehead.`;
    case 'goggles': {
      const inRange = vlt !== null && vlt >= specs.vlt.min && vlt <= specs.vlt.max;
      const position = inRange
        ? `inside your ${specs.vlt.min}–${specs.vlt.max}% target`
        : `just outside your ${specs.vlt.min}–${specs.vlt.max}% target (a touch ${vlt !== null && vlt < specs.vlt.min ? 'darker' : 'brighter'})`;
      return `${lensGuidance(stats.temperature, 'en')} The ${product} runs ${item.specs.vlt}% VLT, ${position}. ${matchReason}`;
    }
    case 'jacket':
      return `${jacketGuidance(stats.temperature, 'en')} The ${product} rates ${item.specs.warmth}/5 for warmth with ${item.specs.waterproofing} protection. ${matchReason}`;
    default:
      return matchReason;
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
          !item.hidden &&
          item.category === category &&
          (!item.activity || item.activity === 'both' || item.activity === stats.activity),
      ),
      stats.budgetTier,
    );

    if (pool.length === 0) return null;

    const ranked: RankedCandidate[] = pool
      .map((item) => {
        const { score, contributions } = computeCompatibility(item, stats, specs);
        return { item, score, breakdown: contributions };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_CANDIDATES);

    if (ranked.length === 0) return null;

    const winner = ranked[0];

    // Narrative copy is not baked in here: GearCard builds it at render time
    // with the current language (buildReasoning / buildReasonBullets).
    return {
      category,
      item: winner.item,
      score: winner.score,
      candidates: ranked,
    } satisfies Recommendation;
  }).filter((entry): entry is Recommendation => entry !== null);

  return {
    stats,
    specs,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
};

export default matchGear;
