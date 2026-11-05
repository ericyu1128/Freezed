/**
 * Freezed — gear database
 * Made by Eric Yu
 *
 * Prices are NOT stored here. They live in `data/prices.json`, keyed by item
 * id then retailer id, and are entered by hand: `npm run prices:template`
 * writes a CSV with a search link per item × retailer, and
 * `npm run prices:import` validates the filled-in CSV and rewrites the JSON.
 * Anything not yet checked is `null` and is never shown as a number.
 *
 * Retailer links are generated at module load (see `buildRetailerUrl` in
 * `retailers.ts`): the product page a price was checked on (`sourceUrl` in
 * data/prices.json) when there is one, otherwise a live search query against
 * that retailer's own site, so an unchecked link still lands on real results.
 *
 * Product images are likewise generated, not stored: `buildGearImage` in
 * `gearImages.ts` draws each item from the very spec values listed below, so
 * a 78 mm carver and a 118 mm powder ski render with visibly different
 * silhouettes and a 12% VLT lens renders darker than a 65% one.
 *
 * Spec keys consumed by `matcherLogic.ts`:
 *   skis     -> specs.waistWidth (mm, number)
 *   boots    -> specs.flex (number; 1–10 scale for snowboard boots, 60–140 for ski boots)
 *   goggles  -> specs.vlt (percentage, number)
 *   jacket   -> specs.warmth (1–5, number)
 *   helmet   -> specs.warmth (1–5, number)
 *   bindings -> specs.dinRange (ski, string range) / specs.flexRating (snowboard, "n/10")
 */

import type { GearItem, PriceMatch, RetailerPrice } from './types';
import { buildGearImage } from './gearImages';
import { computePerformanceProfile } from './performanceProfile';
import { buildRetailerUrl, isRetailerUrl, RETAILER_IDS, RETAILERS, type RetailerId } from './retailers';
import pricesJson from '../data/prices.json';

/** One cell of `data/prices.json`. `priceFrom` and `sourceUrl` are optional so older files still read. */
export interface PriceCell {
  match?: PriceMatch | null;
  price: number | null;
  priceFrom?: boolean;
  checkedAt: string | null;
  sourceUrl?: string | null;
}

/** Shape of `data/prices.json`: item id → retailer id → hand-checked price. */
export type PriceTable = Record<string, Record<string, PriceCell>>;

const priceTable = pricesJson as PriceTable;

/** Database rows are authored without prices, links or performance scores; all three are derived on export. */
type GearListing = Omit<GearItem, 'prices' | 'image' | 'performance'> & {
  /**
   * Optional override for the retailer search string, for when the brand +
   * name the catalogue shows differ from how retailers index the product.
   */
  searchTerm?: string;
};

const listings: GearListing[] = [
  /* ================================================================ */
  /*  SKIS                                                            */
  /* ================================================================ */
  {
    id: 'ski-k2-disruption-78c',
    category: 'skis',
    brand: 'K2',
    name: 'Disruption 78C',
    priceTier: 'budget',
    activity: 'ski',
    styles: ['piste'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'unisex'],
    specs: {
      waistWidth: 78,
      lengths: '156 / 163 / 170 / 177',
      turnRadius: '14.5 m @ 170',
      profile: 'Camber underfoot, early-rise tip',
      core: 'Aspen composite + carbon web',
      weight: '1,720 g @ 170',
      binding: 'Marker M3 10 Quikclik (system)',
    },
    description:
      'A forgiving, groomer-focused carver with a soft flex pattern that rewards clean technique without punishing mistakes. The narrow 78 mm waist snaps edge-to-edge with very little input.',
    matchReason:
      'Built for riders learning to carve on hardpack who want a stable, confidence-inspiring ski at a value price.',
    // zh: needs review
    descriptionZh:
      '一支好驾驭、专注压雪道的刻滑板，软中带韧的硬度分布会奖励干净的技术动作，又不会因为一点失误就惩罚你。78 mm 的窄腰换刃非常轻快，稍一用力就能从一侧刃切到另一侧。',
    // zh: needs review
    matchReasonZh:
      '适合在硬雪道上学刻滑、想要一支稳定又给信心、价格还亲民的雪板的人。',
  },
  {
    id: 'ski-salomon-stance-84',
    category: 'skis',
    brand: 'Salomon',
    name: 'Stance 84',
    priceTier: 'budget',
    activity: 'ski',
    styles: ['piste', 'all-mountain'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      waistWidth: 84,
      lengths: '160 / 168 / 176 / 184',
      turnRadius: '17 m @ 176',
      profile: 'Camber with tip rocker',
      core: 'Poplar / caruba + single Titanal band',
      weight: '1,890 g @ 176',
      damping: 'Cork ply damplifier',
    },
    description:
      'The frontside member of the Stance family: one sheet of Titanal keeps it quiet at speed while the 84 mm platform still handles a lap through soft snow.',
    matchReason:
      'A do-most-things frontside ski for riders who spend 80% of the day on groomers but want a little margin off-piste.',
    // zh: needs review
    descriptionZh:
      'Stance 家族里偏压雪道的一支：一层钛合金让它在高速下依然安静，84 mm 的板面遇到软雪也能应付一趟。',
    // zh: needs review
    matchReasonZh:
      '八成时间在压雪道、但想留点余量偶尔下道钻野雪的人，用它基本什么都能干。',
  },
  {
    id: 'ski-salomon-qst-92',
    category: 'skis',
    brand: 'Salomon',
    name: 'QST 92',
    priceTier: 'mid-range',
    activity: 'ski',
    styles: ['all-mountain', 'freestyle'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      waistWidth: 92,
      lengths: '162 / 169 / 176 / 183 / 189',
      turnRadius: '18 m @ 176',
      profile: 'Rocker / camber / rocker',
      core: 'Poplar + cork damplifier + carbon/flax',
      weight: '1,830 g @ 176',
      tail: 'Semi-twin',
    },
    description:
      'The benchmark 90-something all-mountain ski. Light enough to throw around in trees, damp enough to hold a line on refrozen morning corduroy.',
    matchReason:
      'Ideal for the rider whose day is genuinely mixed — groomers to the lift line, then side-country and chopped-up snow after lunch.',
    // zh: needs review
    descriptionZh:
      '90 出头腰宽全山板的标杆。轻到在树林里能随手甩，又稳到能在早上冻硬的灯芯绒雪面上咬住线路。',
    // zh: needs review
    matchReasonZh:
      '适合一天真的什么都滑的人——上午压雪道刷到缆车口，下午去道边野雪和被铲碎的雪里玩。',
  },
  {
    id: 'ski-k2-mindbender-89ti',
    category: 'skis',
    brand: 'K2',
    name: 'Mindbender 89Ti',
    priceTier: 'mid-range',
    activity: 'ski',
    styles: ['all-mountain', 'piste'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      waistWidth: 89,
      lengths: '163 / 170 / 177 / 184',
      turnRadius: '17.4 m @ 177',
      profile: 'All-terrain rocker',
      core: 'Aspen + Titanal Y-beam',
      weight: '2,050 g @ 177',
      construction: 'Carbon spectral braid',
    },
    description:
      'Titanal Y-beam gives torsional bite where it matters and tapers out toward the tip so the ski still releases in soft snow. A hard-charging daily driver.',
    matchReason:
      'For strong skiers who want metal underfoot and a narrow enough waist to still carve a proper arc on firm snow.',
    // zh: needs review
    descriptionZh:
      '钛合金 Y 形梁在最需要的地方提供抗扭咬雪力，往板头逐渐收窄，在软雪里依然容易松刃。一支能狠冲的日常主力板。',
    // zh: needs review
    matchReasonZh:
      '适合技术扎实、想要脚下有金属、腰宽又够窄、能在硬雪上切出漂亮弧线的人。',
  },
  {
    id: 'ski-atomic-bent-100',
    category: 'skis',
    brand: 'Atomic',
    name: 'Bent 100',
    priceTier: 'mid-range',
    activity: 'ski',
    styles: ['freestyle', 'all-mountain'],
    levels: ['intermediate', 'advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      waistWidth: 100,
      lengths: '164 / 172 / 180 / 188',
      turnRadius: '19 m @ 180',
      profile: 'HRZN Tech tip & tail rocker',
      core: 'Poplar ultra-light + carbon backbone',
      weight: '1,900 g @ 180',
      tail: 'True twin',
    },
    description:
      'Chris Benchetler’s playful twin-tip: surfy, buttery and switch-friendly, but with enough width to float through a storm day.',
    matchReason:
      'The pick for park-and-powder riders who ride switch, hit side hits and want one ski for the whole mountain.',
    // zh: needs review
    descriptionZh:
      'Chris Benchetler 风格的好玩双翘板：像冲浪一样灵活、好做平花、反脚也顺，宽度又足以在暴雪天浮起来。',
    // zh: needs review
    matchReasonZh:
      '公园加粉雪两手抓的首选——喜欢反脚、喜欢道边飞小包、想一支板滑全山的人。',
  },
  {
    id: 'ski-k2-poacher',
    category: 'skis',
    brand: 'K2',
    name: 'Poacher',
    priceTier: 'budget',
    activity: 'ski',
    styles: ['freestyle'],
    levels: ['beginner', 'intermediate', 'advanced'],
    genders: ['male', 'unisex'],
    specs: {
      waistWidth: 96,
      lengths: '159 / 169 / 179 / 189',
      turnRadius: '17 m @ 179',
      profile: 'All-terrain twin rocker',
      core: 'Aspen + fir stringers',
      weight: '1,880 g @ 179',
      tail: 'True twin',
    },
    description:
      'A durable, impact-tolerant park twin with reinforced edges and a symmetrical flex that lands switch as happily as forward.',
    matchReason:
      'Value-focused freestyle ski for riders learning rails and jumps who do not want to babysit an expensive topsheet.',
    // zh: needs review
    descriptionZh:
      '耐砸耐撞的公园双翘板，边刃加强，前后对称的硬度让反脚落地和正脚一样踏实。',
    // zh: needs review
    matchReasonZh:
      '主打性价比的自由式板，适合刚开始练道具和跳台、不想心疼昂贵板面的人。',
  },
  {
    id: 'ski-volkl-mantra-m7',
    category: 'skis',
    brand: 'Völkl',
    name: 'Mantra M7',
    priceTier: 'premium',
    activity: 'ski',
    styles: ['all-mountain', 'piste'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'unisex'],
    specs: {
      waistWidth: 96,
      lengths: '163 / 170 / 177 / 184 / 191',
      turnRadius: '18.9 m @ 177',
      profile: 'Tailored Titanal Frame 3D',
      core: 'Multi-layer wood + full Titanal frame',
      weight: '2,150 g @ 177',
      construction: '3D Radius sidecut',
    },
    description:
      'The reference hard-charging all-mountain ski. Titanal thickness is tuned per length so a 170 and a 191 ride with the same intent.',
    matchReason:
      'For powerful, aggressive skiers who want maximum damping and edge hold and are willing to work for it.',
    // zh: needs review
    descriptionZh:
      '能狠冲的全山板标杆。钛合金厚度按长度单独调校，170 和 191 滑起来是同一个性格。',
    // zh: needs review
    matchReasonZh:
      '适合力量大、滑得凶、想要最强减震和抓雪力，也愿意为此多出点力的人。',
  },
  {
    id: 'ski-atomic-redster-x9',
    category: 'skis',
    brand: 'Atomic',
    name: 'Redster X9S Revoshock S',
    priceTier: 'premium',
    activity: 'ski',
    styles: ['piste'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      waistWidth: 65,
      lengths: '160 / 165 / 170 / 175 / 180',
      turnRadius: '14.9 m @ 175',
      profile: 'Full camber',
      core: 'Densolite + Titanium Powered',
      weight: '2,240 g @ 175 (with plate)',
      damping: 'Revoshock S elastomer',
    },
    description:
      'A race-room carver detuned just enough for the public. Revoshock damping keeps the edge glued through rutted, icy turns.',
    matchReason:
      'Built for advanced piste specialists who measure a good day in clean, high-angle arcs on firm snow.',
    // zh: needs review
    descriptionZh:
      '从赛道车间走出来、只为大众稍稍调软了一点的刻滑板。Revoshock 减震让边刃在坑洼结冰的弯里依然死死咬住雪面。',
    // zh: needs review
    matchReasonZh:
      '为高级压雪道玩家打造——好的一天就是在硬雪上切出一道道干净的大倾角弧线。',
  },
  {
    id: 'ski-black-crows-camox',
    category: 'skis',
    brand: 'Black Crows',
    name: 'Camox',
    priceTier: 'mid-range',
    activity: 'ski',
    styles: ['all-mountain', 'freestyle'],
    levels: ['intermediate', 'advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      waistWidth: 97,
      lengths: '166.1 / 172.1 / 178.2 / 184.3',
      turnRadius: '19 m @ 178',
      profile: 'Double rocker, semi-twin tail',
      core: 'Poplar + biaxial glass',
      weight: '1,860 g @ 178',
      tail: 'Semi-twin',
    },
    description:
      'Chamonix-bred freeride all-rounder. Light, lively and quick to pivot in tight terrain without feeling nervous at speed.',
    matchReason:
      'A great match for playful all-mountain skiers who ride trees, chutes and side hits more than they ride the fall line.',
    // zh: needs review
    descriptionZh:
      '出生在霞慕尼的自由滑全能板。轻巧、灵动，在狭窄地形里转向很快，高速下也不发飘。',
    // zh: needs review
    matchReasonZh:
      '非常适合喜欢玩的全山玩家——钻树林、下沟槽、飞道边小包，比单纯顺着滚落线冲更多。',
  },
  {
    id: 'ski-black-crows-corvus',
    category: 'skis',
    brand: 'Black Crows',
    name: 'Corvus',
    priceTier: 'premium',
    activity: 'ski',
    styles: ['backcountry', 'all-mountain'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'unisex'],
    specs: {
      waistWidth: 110,
      lengths: '175.4 / 183.3 / 188.4',
      turnRadius: '21 m @ 183',
      profile: 'Double rocker, directional',
      core: 'Poplar + titanal reinforcement',
      weight: '2,180 g @ 183',
      tail: 'Flat directional',
    },
    description:
      'A big-mountain plank with a stiff shovel that punches through crud and stays composed at genuinely high speed in open terrain.',
    matchReason:
      'For expert freeriders hunting deep days and committed lines who need float first and groomer manners second.',
    // zh: needs review
    descriptionZh:
      '一支大山野雪板，板头硬朗，能劈开烂雪，在开阔地形里真正高速时依然沉稳。',
    // zh: needs review
    matchReasonZh:
      '适合追粉雪日、敢下硬核线路的专家级野滑玩家——浮力第一，压雪道表现其次。',
  },
  {
    id: 'ski-atomic-backland-107',
    // Hidden from matching: discontinued (successor: Backland 109) — see docs/catalogue-audit.md.
    hidden: true,
    category: 'skis',
    brand: 'Atomic',
    name: 'Backland 107',
    priceTier: 'premium',
    activity: 'ski',
    styles: ['backcountry'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      waistWidth: 107,
      lengths: '168 / 176 / 182 / 189',
      turnRadius: '20 m @ 182',
      profile: 'HRZN Tech tip, tail rocker',
      core: 'Ultra-light poplar + carbon backbone',
      weight: '1,590 g @ 182',
      skinAttachment: 'Backland skin clip',
    },
    description:
      'A touring-first powder ski: under 1,600 g per ski at 182 cm, yet the carbon backbone keeps it honest on the descent.',
    matchReason:
      'The pick for riders earning turns — light enough for long skin tracks, wide enough to float on the way back down.',
    // zh: needs review
    descriptionZh:
      '以登山为先的粉雪板：182 cm 每支不到 1,600 g，碳纤维脊梁又让它下坡时依然靠谱。',
    // zh: needs review
    matchReasonZh:
      '刷坡党首选——轻到能走长长的上山路线，宽到下山时能浮在粉雪上。',
  },
  {
    id: 'ski-volkl-blaze-114',
    category: 'skis',
    brand: 'Völkl',
    name: 'Blaze 114',
    priceTier: 'mid-range',
    activity: 'ski',
    styles: ['backcountry', 'all-mountain'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      waistWidth: 114,
      lengths: '165 / 172 / 179 / 186',
      turnRadius: '20.5 m @ 179',
      profile: 'Tip & tail rocker, camber underfoot',
      core: '3D Suspension Tip, hybrid wood',
      weight: '1,690 g @ 179',
      versatility: 'Touring or resort binding compatible',
    },
    description:
      'A genuinely light 114 that still tolerates a resort day. The suspension tip cuts chatter without adding swing weight.',
    matchReason:
      'For riders splitting time between lift-served powder laps and short tours who do not want two separate setups.',
    // zh: needs review
    descriptionZh:
      '一支真正轻量、却还扛得住一天雪场滑行的 114。悬挂式板头减少抖动，又不增加挥重。',
    // zh: needs review
    matchReasonZh:
      '适合一半时间坐缆车刷粉、一半时间做短途登山，不想准备两套装备的人。',
  },

  /* ================================================================ */
  /*  SNOWBOARDS (stored under the `skis` hardgood category)          */
  /* ================================================================ */
  {
    id: 'board-burton-cultivator',
    category: 'skis',
    brand: 'Burton',
    name: 'Cultivator Flat Top',
    priceTier: 'budget',
    activity: 'snowboard',
    styles: ['all-mountain', 'piste'],
    levels: ['beginner', 'intermediate'],
    // Burton: "gender neutral sizing" — tagged unisex (universal fit), not women's-specific.
    genders: ['unisex'],
    // Replaces the K2 Raygun (not stocked in Canada). Specs: burton.com/en-ca/products/burton-cultivator-flat-top-snowboard-311741, checked 2026-11-05.
    // waistWidth is the 155 cm size. Burton states no ability level; levels follow its "progression" / "soft flex" copy.
    specs: {
      waistWidth: 252,
      lengths: '135 / 140 / 145 / 150 / 155 / 160 / 155W / 160W / 165W',
      profile: 'Flat Top with Easy Bevel',
      core: 'Fly 900G wood core, Biax fibreglass',
      flexRating: 'Soft & Playful (Burton personality scale)',
      shape: 'Twin, twin flex',
      base: 'Extruded',
    },
    description:
      "Burton's progression board: a Flat Top profile with Easy Bevel edges for a catch-free ride, a true twin shape and flex, and gender-neutral sizing from 135 to 165W.",
    matchReason:
      'Burton built it for riders still learning — soft, forgiving and happy anywhere on the mountain.',
    // zh: needs review
    descriptionZh:
      'Burton 的进阶单板：Flat Top 板型配 Easy Bevel 板刃，不易卡刃；真双向板形与硬度，男女通用尺码 135 到 165W。',
    // zh: needs review
    matchReasonZh:
      'Burton 为还在学习阶段的玩家打造——软、宽容，全山地都能玩。',
  },
  {
    id: 'board-salomon-assassin',
    category: 'skis',
    brand: 'Salomon',
    name: 'Assassin',
    priceTier: 'mid-range',
    activity: 'snowboard',
    styles: ['all-mountain', 'freestyle'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'unisex'],
    specs: {
      waistWidth: 254,
      lengths: '150 / 153 / 155W / 156 / 159 / 159W / 162W',
      profile: 'Rock Out Camber',
      core: 'Aspen Superlight + Ghost Basalt',
      flexRating: '6 / 10',
      shape: 'Directional twin',
      base: 'Sintered EG',
    },
    description:
      'The quiver-killer twin: camber between the feet for pop, rocker at the contact points so it never hooks up unexpectedly.',
    matchReason:
      'Perfect for riders who lap the park in the morning and chase side hits and soft snow in the afternoon.',
    // zh: needs review
    descriptionZh:
      '一块顶一个板库的双翘板：两脚之间是正弧带来弹性，接触点是反翘，不会突然卡刃。',
    // zh: needs review
    matchReasonZh:
      '完美适合上午刷公园、下午去追道边小包和软雪的人。',
  },
  {
    id: 'board-burton-custom',
    category: 'skis',
    brand: 'Burton',
    name: 'Custom Camber',
    priceTier: 'premium',
    activity: 'snowboard',
    styles: ['all-mountain', 'piste'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'unisex'],
    specs: {
      waistWidth: 253,
      lengths: '150 / 154 / 156W / 158 / 162 / 162W',
      profile: 'Full camber',
      core: 'Dragonfly 600G + Squeezebox High',
      flexRating: '6 / 10',
      shape: 'Directional twin',
      base: 'Sintered WFO',
    },
    description:
      'Thirty-plus seasons of refinement. Traditional camber, carbon Squeezebox and a fast sintered base — precise, poppy and unforgiving of laziness.',
    matchReason:
      'For confident riders who load the board hard through turns and want maximum edge hold and rebound.',
    // zh: needs review
    descriptionZh:
      '三十多个雪季的打磨。传统正弧、碳纤维 Squeezebox 加上高速烧结板底——精准、弹性十足，但对偷懒的动作毫不宽容。',
    // zh: needs review
    matchReasonZh:
      '适合自信的玩家：转弯时会狠狠压板，想要最强的立刃抓雪和回弹。',
  },
  {
    id: 'board-burton-process',
    category: 'skis',
    brand: 'Burton',
    name: 'Process Flying V',
    priceTier: 'mid-range',
    activity: 'snowboard',
    styles: ['freestyle'],
    levels: ['beginner', 'intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      waistWidth: 250,
      lengths: '148 / 152 / 155 / 157W / 159 / 162W',
      profile: 'Flying V (hybrid rocker)',
      core: 'FSC Super Fly II 700G',
      flexRating: '5 / 10',
      shape: 'True twin',
      base: 'Sintered WFO',
    },
    description:
      'A true twin with a loose, playful rocker-dominant profile that presses easily and stays catch-free on rails.',
    matchReason:
      'A forgiving freestyle platform for riders drilling butters, boxes and switch riding in the park.',
    // zh: needs review
    descriptionZh:
      '一块真双翘板，以反翘为主的板型松快好玩，压板很轻松，上道具也不容易卡刃。',
    // zh: needs review
    matchReasonZh:
      '一块宽容的自由式平台，适合在公园里练平花、箱子和反脚的人。',
  },
  {
    id: 'board-k2-party-platter',
    category: 'skis',
    brand: 'K2',
    name: 'Party Platter',
    priceTier: 'mid-range',
    activity: 'snowboard',
    styles: ['freestyle', 'backcountry'],
    levels: ['intermediate', 'advanced', 'expert'],
    genders: ['male', 'unisex'],
    specs: {
      waistWidth: 262,
      lengths: '142 / 148 / 154',
      profile: 'Volume-shifted flat/rocker',
      core: 'Bamboo + carbon',
      flexRating: '5 / 10',
      shape: 'Swallowtail powder twin',
      base: 'Sintered 4000',
    },
    description:
      'A short, fat, volume-shifted powder toy. Ride it 8–10 cm shorter than your usual length and let the surface area do the work.',
    matchReason:
      'For surfy riders on storm days who want a playful powder board rather than a straight-lining big-mountain deck.',
    // zh: needs review
    descriptionZh:
      '一块短、胖、体积前移的粉雪玩具。比你平时的长度短 8–10 cm，剩下的交给板面面积。',
    // zh: needs review
    matchReasonZh:
      '适合暴雪天想像冲浪一样玩粉雪的人，而不是要一块直线狂冲的大山板。',
  },
  {
    id: 'board-burton-hometown-hero',
    category: 'skis',
    brand: 'Burton',
    name: 'Family Tree Hometown Hero',
    priceTier: 'premium',
    activity: 'snowboard',
    styles: ['backcountry', 'all-mountain'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'unisex'],
    specs: {
      waistWidth: 258,
      lengths: '148 / 152 / 156 / 160',
      profile: 'Directional camber',
      core: 'Dragonfly 600G + FSC certified',
      flexRating: '7 / 10',
      shape: 'Directional, tapered tail',
      base: 'Sintered WFO',
    },
    description:
      'A directional freeride weapon with a tapered tail that sinks on demand and a stiff nose that stays afloat in deep snow.',
    matchReason:
      'For expert riders charging big backcountry lines who still want the board to carve on the traverse out.',
    // zh: needs review
    descriptionZh:
      '一把定向自由滑利器：收窄的板尾想沉就沉，硬朗的板头在深粉里稳稳浮着。',
    // zh: needs review
    matchReasonZh:
      '适合在野雪大线路上猛冲的专家级玩家，横切出山时还想让板子能刻滑。',
  },
  {
    id: 'board-salomon-huck-knife',
    category: 'skis',
    brand: 'Salomon',
    name: 'Huck Knife',
    priceTier: 'mid-range',
    activity: 'snowboard',
    styles: ['freestyle'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'unisex'],
    specs: {
      waistWidth: 251,
      lengths: '147 / 150 / 152 / 154 / 155W / 156 / 158W',
      profile: 'Rock Out Camber',
      core: 'Aspen Superlight + Popster booster',
      flexRating: '6 / 10',
      shape: 'True twin',
      base: 'Sintered EG',
    },
    description:
      'A stiff-ish true twin built for jump lines and hard-charging park riding, with Popster milling that stores and releases energy off the lip.',
    matchReason:
      'For strong freestyle riders sending medium-to-large jumps who need a board that stays stable on landings.',
    // zh: needs review
    descriptionZh:
      '一块偏硬的真双翘板，为跳台线路和狠冲公园而生，Popster 铣槽在起跳台边缘储存并释放能量。',
    // zh: needs review
    matchReasonZh:
      '适合能飞中大型跳台、需要落地稳的自由式玩家。',
  },

  /* ================================================================ */
  /*  BOOTS — SKI                                                     */
  /* ================================================================ */
  {
    id: 'boot-k2-bfc-90',
    category: 'boots',
    brand: 'K2',
    name: 'BFC 90',
    priceTier: 'budget',
    activity: 'ski',
    styles: ['piste', 'all-mountain'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'unisex'],
    // Replaces the Atomic Hawx Prime 90 GW (no current version at 2+ CA shops). Specs: k2snow.com/en-ca/p/bfc-90-mens-ski-boots-ks261938, checked 2026-11-05.
    specs: {
      flex: 90,
      lastWidth: '103 mm (high volume)',
      liner: 'CushFit Comfort',
      soleStandard: 'GripWalk',
      construction: 'Heat-mouldable TPU shell, PP cuff',
    },
    description:
      "K2's comfort boot: a wide 103 mm, high-volume shell that heat-moulds to your foot, a 90 flex that stays forgiving, and GripWalk soles for the walk to the lift.",
    matchReason:
      'K2 builds it for beginner and intermediate resort skiers who want an easygoing fit without giving up real support.',
    // zh: needs review
    descriptionZh:
      'K2 的舒适型雪靴：103 mm 宽楦、高容积外壳可热塑贴合脚型，硬度 90 不压人，GripWalk 鞋底走去缆车也方便。',
    // zh: needs review
    matchReasonZh:
      'K2 专为初中级雪场玩家设计——想要宽松好穿、又不失真实支撑的双板玩家之选。',
  },
  {
    id: 'boot-dalbello-veloce-space-100',
    category: 'boots',
    brand: 'Dalbello',
    name: 'Veloce Space 100 BOA',
    priceTier: 'budget',
    activity: 'ski',
    styles: ['all-mountain', 'piste'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'unisex'],
    // Added so budget riders have a boot rated for advanced skiing (Dalbello: Intermediate, Advanced).
    // Specs: dalbelloboots.com/en-ca/p/veloce-space-100-ski-boots-d2503103, checked 2026-11-05.
    specs: {
      flex: 100,
      lastWidth: '101 mm',
      liner: 'Space IF Sport',
      closure: 'BOA Fit System (single dial) + 40 mm power strap',
      walkMode: 'Yes',
      soleStandard: 'GripWalk (pre-mounted)',
      construction: 'PU shell, DB Hyperlite cuff',
    },
    description:
      "Dalbello's BOA all-mountain boot: a single BOA dial wraps a 101 mm PU shell with a 100 flex, plus a walk mode and pre-mounted GripWalk soles.",
    matchReason:
      'Dalbello rates it for intermediate and advanced skiers — a stiffer, more precise boot that still steps in easily and walks well.',
    // zh: needs review
    descriptionZh:
      'Dalbello 的 BOA 全山地雪靴：单旋钮 BOA 包裹 101 mm PU 外壳，硬度 100，带行走模式和预装 GripWalk 鞋底。',
    // zh: needs review
    matchReasonZh:
      'Dalbello 将它定位于中级到高级玩家——更硬、更精准，同时穿脱方便、走路也舒服。',
  },
  {
    id: 'boot-k2-anthem-85',
    category: 'boots',
    brand: 'K2',
    name: 'Anthem 85 BOA',
    priceTier: 'budget',
    activity: 'ski',
    styles: ['piste', 'all-mountain'],
    levels: ['beginner', 'intermediate'],
    genders: ['female'],
    specs: {
      flex: 85,
      lastWidth: '100 mm (medium, women’s)',
      liner: 'Precision fit, faux-fur cuff',
      soleStandard: 'GripWalk',
      closure: 'BOA H+i1 forefoot dial',
      weight: '1,590 g @ 24.5',
    },
    description:
      'Women’s-specific shell with a lower cuff height, warmer liner and a BOA forefoot dial that wraps the foot evenly instead of clamping it.',
    matchReason:
      'A warm, easy-entry women’s boot for progressing skiers who want precision without a punishing flex.',
    // zh: needs review
    descriptionZh:
      '女款专属外壳，靴筒更低、内胆更暖，前掌 BOA 旋钮均匀包裹脚面，而不是死死夹住。',
    // zh: needs review
    matchReasonZh:
      '一双温暖、好穿脱的女款雪靴，适合想要精准操控、又不想被硬度折磨的进阶玩家。',
  },
  {
    id: 'boot-salomon-shift-pro-110w',
    // Hidden from matching: discontinued (successor: Shift Alpha BOA 115 W) — see docs/catalogue-audit.md.
    hidden: true,
    category: 'boots',
    brand: 'Salomon',
    name: 'Shift Pro 110 W',
    priceTier: 'mid-range',
    activity: 'ski',
    styles: ['all-mountain', 'backcountry'],
    levels: ['intermediate', 'advanced'],
    genders: ['female'],
    specs: {
      flex: 110,
      lastWidth: '100 mm (women’s)',
      liner: 'Custom Shell HD + My Custom Fit 4D',
      soleStandard: 'GripWalk',
      walkMode: '55° cuff rotation',
      weight: '1,650 g @ 24.5',
    },
    description:
      'A freeride-leaning women’s boot with a real walk mode and a fully mouldable shell, tuned stiffer for skiers who drive the tongue.',
    matchReason:
      'For advancing women skiers who ride aggressively inbounds but want hike mode for boot-packs and short tours.',
    // zh: needs review
    descriptionZh:
      '一双偏自由滑的女款雪靴，有真正能用的行走模式和可全热塑外壳，硬度调得更高，适合习惯压鞋舌的人。',
    // zh: needs review
    matchReasonZh:
      '适合在雪场内滑得很凶、又想为徒步爬坡和短途登山留个行走模式的进阶女性玩家。',
  },
  {
    id: 'boot-k2-method-100',
    // Hidden from matching: no boot by this name exists (K2 Method Pro / Recon 100 MV do) — see docs/catalogue-audit.md.
    hidden: true,
    category: 'boots',
    brand: 'K2',
    name: 'Method 100 MV',
    priceTier: 'mid-range',
    activity: 'ski',
    styles: ['freestyle', 'all-mountain'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'unisex'],
    specs: {
      flex: 100,
      lastWidth: '100 mm (medium volume)',
      liner: 'Powerfuse Intuition, heat mouldable',
      soleStandard: 'GripWalk',
      cuff: 'Progressive freestyle flex',
      weight: '1,690 g @ 27.5',
    },
    description:
      'Intuition liner, medium-volume shell and a progressive flex pattern that absorbs landings instead of spiking through them.',
    matchReason:
      'A freestyle-friendly 100 flex for park skiers who need shock absorption and a liner that packs out to their foot.',
    // zh: needs review
    descriptionZh:
      'Intuition 内胆、中等容积外壳，渐进式硬度分布能吸收落地冲击，而不是硬生生顶回来。',
    // zh: needs review
    matchReasonZh:
      '对公园玩家友好的 100 硬度，适合需要缓冲、想要一双会贴合脚型的内胆的人。',
  },
  {
    id: 'boot-salomon-spro-supra-120',
    category: 'boots',
    brand: 'Salomon',
    name: 'S/Pro Supra S BOA 120',
    priceTier: 'premium',
    activity: 'ski',
    styles: ['piste', 'all-mountain'],
    levels: ['advanced'],
    genders: ['male', 'unisex'],
    // Updated to the 2027 single-dial S BOA version. Specs: salomon.com/en-ca/product/s-pro-supra-s-boa-120-li1498/L45420600 (Level of practice: Advanced), checked 2026-11-05.
    specs: {
      flex: 120,
      lastWidth: '100 mm (medium)',
      liner: 'S/Pro CF Expert + Custom Tongue 2',
      soleStandard: 'GripWalk (ISO 23223)',
      closure: 'BOA Fit System (single dial), Exowrap',
      weight: '1,870 g',
      construction: 'PU shell and cuff, Custom Shell HD, power spine',
    },
    description:
      "Salomon's single-dial BOA boot: a 120-flex PU shell and cuff on a 100 mm last, an Exowrap shell-and-liner wrap, and a Custom Shell HD that bootfitters can mould in about ten minutes.",
    matchReason:
      'Salomon rates it for advanced all-mountain skiers who want a precise, powerful boot that is quick to fit.',
    // zh: needs review
    descriptionZh:
      'Salomon 的单旋钮 BOA 雪靴：100 mm 鞋楦、硬度 120 的 PU 外壳与靴筒，Exowrap 外壳与内胆一体包裹，Custom Shell HD 外壳约十分钟即可由调靴师定制。',
    // zh: needs review
    matchReasonZh:
      'Salomon 将它定位于高级全山地玩家——想要精准、有力又能快速调好的雪靴。',
  },
  {
    id: 'boot-atomic-hawx-ultra-130',
    category: 'boots',
    brand: 'Atomic',
    name: 'Hawx Ultra XTD 130 BOA',
    priceTier: 'premium',
    activity: 'ski',
    styles: ['all-mountain', 'backcountry', 'piste'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      flex: 130,
      lastWidth: '98 mm (low volume)',
      liner: 'Mimic Platinum, fully mouldable',
      soleStandard: 'GripWalk / tech inserts',
      walkMode: '54° cuff rotation',
      weight: '1,530 g @ 26.5',
    },
    description:
      'A 130-flex hybrid: low-volume performance last, tech fittings for touring, and a walk mode that actually walks.',
    matchReason:
      'The one-boot answer for expert skiers who ride hard inbounds and occasionally clip into a touring binding.',
    // zh: needs review
    descriptionZh:
      '一双 130 硬度的混合型雪靴：低容积性能鞋楦、带登山用的 tech 插孔，行走模式也是真的能走。',
    // zh: needs review
    matchReasonZh:
      '专家级玩家的一靴通吃方案——在雪场里狠滑，偶尔也会卡进登山固定器。',
  },
  {
    id: 'boot-volkl-secret-105',
    // Hidden from matching: no boot by this name exists (Secret is a Völkl women's ski line) — see docs/catalogue-audit.md.
    hidden: true,
    category: 'boots',
    brand: 'Völkl',
    name: 'Secret Pro 105 W',
    priceTier: 'premium',
    activity: 'ski',
    styles: ['all-mountain', 'piste'],
    levels: ['advanced', 'expert'],
    genders: ['female'],
    specs: {
      flex: 105,
      lastWidth: '98 mm (women’s low volume)',
      liner: 'Thermo-formable performance liner',
      soleStandard: 'GripWalk',
      cuffAlignment: 'Dual canting',
      weight: '1,610 g @ 24.5',
    },
    description:
      'A women’s performance shell with a genuinely low-volume last and a stiff, supportive cuff for skiers who ski at the front of the boot.',
    matchReason:
      'For expert women skiers who have outgrown 90-flex boots and need real lateral support at speed.',
    // zh: needs review
    descriptionZh:
      '女款性能外壳，鞋楦真正低容积，靴筒硬朗有支撑，适合重心压在雪靴前部滑的人。',
    // zh: needs review
    matchReasonZh:
      '适合已经驾驭不了 90 硬度、高速时需要真正侧向支撑的专家级女性玩家。',
  },

  /* ================================================================ */
  /*  BOOTS — SNOWBOARD (flex on a 1–10 scale)                        */
  /* ================================================================ */
  {
    id: 'boot-salomon-launch-boa',
    category: 'boots',
    brand: 'Salomon',
    name: 'Launch BOA SJ',
    priceTier: 'budget',
    activity: 'snowboard',
    styles: ['all-mountain', 'freestyle', 'piste'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'unisex'],
    specs: {
      flex: 4,
      flexScale: '1–10 (soft/medium)',
      lacing: 'BOA Dual Zone',
      liner: 'Ortholite C2 custom fit',
      footbed: 'Custom Fit 2.0',
      weight: '880 g @ 27.0',
    },
    description:
      'Dual-zone BOA gives independent upper/lower tension so the ankle stays locked while the toes stay comfortable. Soft, tourable flex.',
    matchReason:
      'A comfortable, low-effort entry boot for riders still building ankle strength and board feel.',
    // zh: needs review
    descriptionZh:
      '双区 BOA 可以分别调节上下松紧，脚踝锁得住，脚趾又不难受。硬度偏软，走路也轻松。',
    // zh: needs review
    matchReasonZh:
      '一双舒服、省力的入门单板鞋，适合脚踝力量和板感还在建立中的人。',
  },
  {
    id: 'boot-burton-ruler',
    category: 'boots',
    brand: 'Burton',
    name: 'Ruler BOA',
    priceTier: 'mid-range',
    activity: 'snowboard',
    styles: ['all-mountain', 'freestyle'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'unisex'],
    specs: {
      flex: 6,
      flexScale: '1–10 (medium)',
      lacing: 'BOA Fit System (Double)',
      liner: 'Imprint 2 heat mouldable',
      outsole: 'DynoLITE',
      weight: '940 g @ 27.0',
    },
    description:
      'The default all-mountain snowboard boot: medium flex, heat-mouldable liner and a shock-absorbing DynoLITE outsole.',
    matchReason:
      'Balanced support for riders who mix park laps with all-mountain riding and want one boot for everything.',
    // zh: needs review
    descriptionZh:
      '全山单板鞋的默认选择：中等硬度、可热塑内胆，还有减震的 DynoLITE 外底。',
    // zh: needs review
    matchReasonZh:
      '支撑平衡，适合公园和全山混着滑、想一双鞋搞定一切的人。',
  },
  {
    id: 'boot-k2-maysis',
    category: 'boots',
    brand: 'K2',
    name: 'Maysis Clicker X HB',
    priceTier: 'mid-range',
    activity: 'snowboard',
    styles: ['all-mountain', 'backcountry'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'unisex'],
    specs: {
      flex: 7,
      flexScale: '1–10 (medium-stiff)',
      lacing: 'Conda dual BOA (heel-hold)',
      liner: 'Intuition Control Foam 3D',
      outsole: 'Endo 2.0',
      weight: '990 g @ 27.0',
    },
    description:
      'The Conda BOA zone wraps the ankle independently and eliminates heel lift — the reason this boot has a cult following.',
    matchReason:
      'For riders whose heels lift in standard boots and who want stiffer support for bigger terrain.',
    // zh: needs review
    descriptionZh:
      'Conda BOA 区独立包裹脚踝，彻底消除脚跟上浮——这正是这双鞋拥有一群铁粉的原因。',
    // zh: needs review
    matchReasonZh:
      '适合穿普通单板鞋会脚跟上浮、想在更大地形里获得更硬支撑的人。',
  },
  {
    id: 'boot-burton-photon-step-on',
    category: 'boots',
    brand: 'Burton',
    name: 'Photon Step On',
    priceTier: 'premium',
    activity: 'snowboard',
    styles: ['all-mountain', 'piste', 'backcountry'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      flex: 8,
      flexScale: '1–10 (stiff)',
      lacing: 'Double BOA + Step On cleats',
      liner: 'Life liner, heat mouldable',
      outsole: 'Vibram EcoStep',
      weight: '1,020 g @ 27.0',
    },
    description:
      'A stiff, responsive boot that clicks straight into Step On bindings — no strapping in, and a very direct power transfer to the edge.',
    matchReason:
      'For advanced riders who charge hard and value response and fast entry over a soft, playful feel.',
    // zh: needs review
    descriptionZh:
      '一双硬朗、反应直接的雪鞋，直接踩进 Step On 固定器——不用绑绑带，力量传到板刃非常直接。',
    // zh: needs review
    matchReasonZh:
      '适合狠冲的高级玩家，比起软而好玩的脚感，更看重反馈和快速穿脱。',
  },

  /* ================================================================ */
  /*  HELMETS                                                         */
  /* ================================================================ */
  {
    id: 'helmet-k2-phase-pro',
    category: 'helmet',
    brand: 'K2',
    name: 'Phase Pro',
    priceTier: 'budget',
    activity: 'both',
    styles: ['piste', 'all-mountain', 'freestyle'],
    levels: ['beginner', 'intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing', 'moderate'],
    specs: {
      warmth: 4,
      construction: 'ABS hardshell',
      certification: 'ASTM F2040 / CE EN1077',
      vents: 10,
      ventControl: 'Active matrix venting',
      fit: 'K2 Dialed Fit',
      weight: '480 g (M)',
    },
    description:
      'A warm, durable ABS hardshell with adjustable venting and a plush liner — the practical value pick for cold resort days.',
    matchReason:
      'Reliable certified protection and real warmth without paying for rotational-impact tech.',
    // zh: needs review
    descriptionZh:
      '保暖耐用的 ABS 硬壳头盔，通风可调、内衬柔软——寒冷雪场日的实用性价比之选。',
    // zh: needs review
    matchReasonZh:
      '可靠的认证防护和实打实的保暖，不必为防旋转冲击技术多花钱。',
  },
  {
    id: 'helmet-salomon-pioneer-lt',
    // Hidden from matching: Visor version discontinued (the non-visor Pioneer LT is current) — see docs/catalogue-audit.md.
    hidden: true,
    category: 'helmet',
    brand: 'Salomon',
    name: 'Pioneer LT Visor',
    priceTier: 'budget',
    activity: 'both',
    styles: ['piste', 'all-mountain'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing', 'moderate'],
    specs: {
      warmth: 4,
      construction: 'EPS 4D in-mould',
      certification: 'CE EN1077 / ASTM F2040',
      vents: 8,
      ventControl: 'Fixed vents',
      fit: 'Custom Dial 3D',
      weight: '450 g (M)',
    },
    description:
      'Lightweight in-mould shell with a warm fleece liner and a simple dial fit system. Straightforward and comfortable.',
    matchReason:
      'A well-priced, warm helmet for riders who mostly stay on-piste in cold conditions.',
    // zh: needs review
    descriptionZh:
      '轻量一体成型外壳，配保暖抓绒内衬和简单的旋钮调节。简单直接，戴着舒服。',
    // zh: needs review
    matchReasonZh:
      '一顶价格实在又保暖的头盔，适合天冷时主要在压雪道上滑的人。',
  },
  {
    id: 'helmet-smith-descend-mips',
    category: 'helmet',
    brand: 'Smith',
    name: 'Descend MIPS',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['all-mountain', 'piste', 'freestyle'],
    levels: ['beginner', 'intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing', 'moderate', 'spring'],
    // Replaces the Smith Mission MIPS (no longer on smithoptics.com). Specs: smithoptics.com/en-ca/products/descend-mips-r, checked 2026-11-05.
    // warmth is the Freezed 1–5 rating, not a Smith figure.
    specs: {
      warmth: 3,
      construction: 'In-mould shell + EPS with Zonal Koroyd',
      certification: 'ASTM F2040 / CE EN1077:2007 Class B / CPSC',
      vents: 16,
      ventControl: 'Regulator adjustable vents + AirEvac goggle integration',
      rotational: 'MIPS',
      weight: '400 g (M)',
    },
    description:
      'A light in-mould helmet with MIPS and Zonal Koroyd, 16 vents you open or close with one hand, and AirEvac venting to keep Smith goggles clear.',
    matchReason:
      'A mid-priced all-rounder: rotational protection, adjustable venting for cold and warm days, and removable ear pads.',
    // zh: needs review
    descriptionZh:
      '轻量模内成型头盔，配备 MIPS 与分区 Koroyd，16 个通风孔可单手开合，AirEvac 通风让 Smith 雪镜保持清晰。',
    // zh: needs review
    matchReasonZh:
      '中等价位的全能头盔：防旋转保护、冷暖天都能调的通风，还有可拆卸耳罩。',
  },
  {
    id: 'helmet-oakley-mod3',
    category: 'helmet',
    brand: 'Oakley',
    name: 'MOD3 MIPS',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['freestyle', 'all-mountain', 'piste'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    temps: ['moderate', 'spring'],
    specs: {
      warmth: 2,
      construction: 'In-mould polycarbonate',
      certification: 'ASTM F2040 / CE EN1077 Class B',
      vents: 12,
      ventControl: 'Adjustable slide vents',
      rotational: 'MIPS',
      weight: '410 g (M)',
    },
    description:
      'A light in-mould lid with a Modular Brim System that seals to Oakley goggles and adjustable vents for warm spring laps.',
    matchReason:
      'Best for riders who run hot or ride spring conditions and want big adjustable airflow.',
    // zh: needs review
    descriptionZh:
      '轻量一体成型头盔，模块化帽檐系统能和 Oakley 雪镜贴合，通风可调，适合暖和的春季。',
    // zh: needs review
    matchReasonZh:
      '最适合容易出汗、或常在春雪季滑、想要大流量可调通风的人。',
  },
  {
    id: 'helmet-smith-vantage-mips',
    // Hidden from matching: discontinued (successor: Vantage 2 MIPS) — see docs/catalogue-audit.md.
    hidden: true,
    category: 'helmet',
    brand: 'Smith',
    name: 'Vantage MIPS',
    priceTier: 'premium',
    activity: 'both',
    styles: ['all-mountain', 'piste', 'backcountry'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing', 'moderate'],
    specs: {
      warmth: 4,
      construction: 'Hybrid shell + Koroyd honeycomb',
      certification: 'ASTM F2040 / CE EN1077 Class B',
      vents: 21,
      ventControl: '21 adjustable climate-control vents',
      rotational: 'MIPS',
      weight: '480 g (M)',
    },
    description:
      'Koroyd honeycomb absorbs energy and ventilates at the same time; 21 adjustable vents let you dump or trap heat mid-run.',
    matchReason:
      'Top-tier impact protection with the widest temperature range of any helmet here — the buy-once option.',
    // zh: needs review
    descriptionZh:
      'Koroyd 蜂窝结构同时吸收冲击和通风；21 个可调通风孔让你滑到一半也能随时散热或保温。',
    // zh: needs review
    matchReasonZh:
      '顶级的冲击防护，加上这里所有头盔中最宽的适用温度范围——买一次用很久的选择。',
  },
  {
    id: 'helmet-oakley-mod5',
    category: 'helmet',
    brand: 'Oakley',
    name: 'MOD5 MIPS',
    priceTier: 'premium',
    activity: 'both',
    styles: ['all-mountain', 'freestyle', 'backcountry'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['moderate', 'spring'],
    specs: {
      warmth: 3,
      construction: 'Hybrid ABS / in-mould',
      certification: 'ASTM F2040 / CE EN1077 Class B',
      vents: 16,
      ventControl: 'BOA 270 fit + adjustable vents',
      rotational: 'MIPS',
      weight: '460 g (M)',
    },
    description:
      'A BOA dial fit system, MIPS and a three-position Modular Brim that lets you dial the goggle gap out completely.',
    matchReason:
      'For riders who want a precise micro-adjustable fit and a seamless goggle seal across changing conditions.',
    // zh: needs review
    descriptionZh:
      'BOA 旋钮调节、MIPS，再加上三档可调的模块化帽檐，能把头盔和雪镜之间的缝完全消除。',
    // zh: needs review
    matchReasonZh:
      '适合想要可微调的精准贴合、在多变天气里也想让头盔和雪镜无缝衔接的人。',
  },

  /* ================================================================ */
  /*  GOGGLES                                                         */
  /* ================================================================ */
  {
    id: 'goggle-oakley-target-line-persimmon',
    category: 'goggles',
    brand: 'Oakley',
    name: 'Target Line L — Persimmon',
    priceTier: 'budget',
    activity: 'both',
    styles: ['piste', 'all-mountain', 'freestyle'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing'],
    // Replaces the Smith Squad — Yellow Sensor Mirror (no shop sells a Squad with a 40–70% VLT installed lens). Specs: oakley.com/en-ca/product/W0OO7120S (Persimmon, OO7120-02), checked 2026-11-05.
    specs: {
      vlt: 61,
      lensTint: 'Persimmon (Cat. 1)',
      lensShape: 'Cylindrical',
      lensTech: 'Plutonite, 100% UVA / UVB / UVC',
      antiFog: 'Dual lens with F3 anti-fog',
      spareLens: 'None',
      fit: 'Large',
    },
    description:
      "Oakley's budget goggle with a jumbo cylindrical lens; the Persimmon tint lets 61% of light through for snowy, overcast days.",
    matchReason:
      'A simple low-light goggle that works over most glasses and sits flush with Oakley helmets. No spare lens, so it is for flat-light days.',
    // zh: needs review
    descriptionZh:
      'Oakley 入门款雪镜，超大柱面镜片；Persimmon 色调透光率 61%，适合下雪和阴天。',
    // zh: needs review
    matchReasonZh:
      '简单的弱光雪镜，可兼容大多数近视眼镜并贴合 Oakley 头盔。没有备用镜片，专为平光天准备。',
  },
  {
    id: 'goggle-salomon-radium-pro',
    category: 'goggles',
    brand: 'Salomon',
    name: 'Radium Pro S Sigma',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['all-mountain', 'piste', 'backcountry'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    temps: ['spring', 'moderate'],
    // Updated to the version Canadian shops sell (Black Gold installed + Silver Pink). Specs: salomon.com/en-ca/product/radium-pro-s-sigma-and-extra-lens-li6577/L47891000, checked 2026-11-05.
    specs: {
      vlt: 11,
      lensTint: 'Sigma Black Gold (Cat. 3)',
      lensShape: 'Spherical',
      lensTech: 'Sigma contrast enhancement',
      antiFog: 'Anti-fog treatment',
      spareLens: 'Included (Sigma Silver Pink, 35% VLT, Cat. 2)',
      fit: 'Small (reduced size, narrower faces)',
    },
    description:
      'A frameless, spherical-lens goggle in a reduced size, shipped with Sigma Black Gold for sun and a Sigma Silver Pink lens for partly cloudy days.',
    matchReason:
      'Two lenses with an easy swap cover bright and mixed light; Salomon designs this smaller size for narrower faces.',
    // zh: needs review
    descriptionZh:
      '无框球面镜片雪镜，尺寸较小，标配 Sigma Black Gold 晴天镜片，并附一片 Sigma Silver Pink 多云镜片。',
    // zh: needs review
    matchReasonZh:
      '两片镜片可快速更换，覆盖强光与多变光线；Salomon 把这款小尺寸设计给脸型较窄的人。',
  },
  {
    id: 'goggle-oakley-line-miner',
    category: 'goggles',
    brand: 'Oakley',
    name: 'Line Miner L — Prizm Sapphire',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['freestyle', 'all-mountain', 'piste'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    temps: ['spring', 'moderate'],
    specs: {
      vlt: 13,
      lensTint: 'Prizm Snow Sapphire Iridium',
      lensShape: 'Cylindrical (Ridgelock)',
      lensTech: 'Prizm contrast tuning + Iridium mirror',
      antiFog: 'F3 anti-fog coating',
      uv: '100% UVA/UVB/UVC',
      fit: 'Large',
    },
    description:
      'The cult cylindrical frame with a low-VLT Prizm mirror that cuts glare on bluebird days without flattening terrain detail.',
    matchReason:
      'A bright-light lens for sunny, high-albedo days — spring corn and mid-winter bluebird.',
    // zh: needs review
    descriptionZh:
      '圈粉无数的柱面镜框，配低透光率的 Prizm 镀膜镜片，蓝鸟天能压住眩光，又不会把地形细节抹平。',
    // zh: needs review
    matchReasonZh:
      '强光天专用镜片——春天的玉米雪和隆冬的蓝鸟天都合适。',
  },
  {
    id: 'goggle-burton-anon-m4',
    category: 'goggles',
    brand: 'Anon',
    name: 'M4 Toric — Perceive Variable Blue',
    priceTier: 'premium',
    activity: 'both',
    styles: ['freestyle', 'all-mountain', 'backcountry'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['moderate', 'freezing'],
    // Updated to the Black colourway Canadian shops sell (Variable Blue installed, Cloudy Pink bonus). Specs: burton.com/en-ca/products/anon-m4-goggles-toric-bonus-perceive-lens-mfi-face-mask-203551, checked 2026-11-05.
    specs: {
      vlt: 21,
      lensTint: 'Perceive Variable Blue (S2)',
      lensShape: 'Toric',
      lensTech: 'Perceive contrast + Magna-Tech magnetic lens change',
      spareLens: 'Included (Perceive Cloudy Pink, 53% VLT, S1)',
      faceMask: 'MFI magnetic face mask included',
      fit: 'Regular or Low Bridge',
    },
    description:
      "Anon's magnetic toric goggle in the Black colourway: Perceive Variable Blue (21% VLT) installed, Perceive Cloudy Pink (53%) as the bonus lens, plus an MFI face mask.",
    matchReason:
      'One goggle for mixed light, with a low-light lens that swaps in by magnet when the storm rolls in.',
    // zh: needs review
    descriptionZh:
      'Anon 磁吸环面雪镜（黑色款）：标配 Perceive Variable Blue 镜片（透光率 21%），附送 Perceive Cloudy Pink（53%）备用镜片和 MFI 面罩。',
    // zh: needs review
    matchReasonZh:
      '一副雪镜应对多变光线，暴风雪来时用磁吸快速换上弱光镜片。',
  },
  {
    id: 'goggle-smith-io-mag-storm',
    category: 'goggles',
    brand: 'Smith',
    name: 'I/O MAG — ChromaPop Storm Rose',
    priceTier: 'premium',
    activity: 'both',
    styles: ['all-mountain', 'backcountry', 'piste'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing', 'moderate'],
    specs: {
      vlt: 50,
      lensTint: 'ChromaPop Storm Rose Flash',
      lensShape: 'Spherical',
      lensTech: 'ChromaPop + MAG magnetic lens system',
      antiFog: '5X anti-fog inner lens',
      spareLens: 'Included (ChromaPop Sun Platinum, 13% VLT)',
      fit: 'Medium / large',
    },
    description:
      'Spherical ChromaPop optics with a magnetic lens system; the Storm Rose lens is the reference low-light tint for grey days.',
    matchReason:
      'Storm-day clarity with a low-VLT spare included, so one goggle covers freezing overcast and bright sun.',
    // zh: needs review
    descriptionZh:
      '球面 ChromaPop 光学镜片配磁吸换片系统；Storm Rose 是阴天弱光时的标杆色调。',
    // zh: needs review
    matchReasonZh:
      '暴雪天也看得清，还附送一片低透光率的备用镜片，一副雪镜就能兼顾阴冷天和大晴天。',
  },
  {
    id: 'goggle-smith-4d-mag-sun',
    category: 'goggles',
    brand: 'Smith',
    name: '4D MAG — ChromaPop Sun Black',
    priceTier: 'premium',
    activity: 'both',
    styles: ['piste', 'all-mountain', 'backcountry'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['spring'],
    specs: {
      vlt: 12,
      lensTint: 'ChromaPop Sun Black (polarised option)',
      lensShape: 'BirdsEye Vision spherical',
      lensTech: 'ChromaPop + 25% more field of view downward',
      antiFog: '5X anti-fog inner lens',
      spareLens: 'Included (ChromaPop Storm Blue Sensor Mirror)',
      fit: 'Large',
    },
    description:
      'The BirdsEye lens curve extends your downward field of view so you can see your feet without dropping your chin. Very dark sun tint.',
    matchReason:
      'Built for high-glare spring sun and reflective snowpack where standard tints let too much light through.',
    // zh: needs review
    descriptionZh:
      'BirdsEye 镜片曲面向下延伸视野，不用低头就能看见自己的雪板。墨镜色调非常深。',
    // zh: needs review
    matchReasonZh:
      '为春季强烈阳光和高反光雪面而生，普通色调在这种环境下透光太多。',
  },
  {
    id: 'goggle-oakley-flight-deck-torch',
    category: 'goggles',
    brand: 'Oakley',
    name: 'Flight Deck L — Prizm Torch',
    priceTier: 'premium',
    activity: 'both',
    styles: ['all-mountain', 'backcountry', 'freestyle'],
    levels: ['intermediate', 'advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['moderate'],
    specs: {
      vlt: 17,
      lensTint: 'Prizm Snow Torch Iridium',
      lensShape: 'Rimless spherical',
      lensTech: 'Prizm contrast tuning',
      antiFog: 'F3 anti-fog',
      uv: '100% UVA/UVB/UVC',
      fit: 'Large — helmet compatible',
    },
    description:
      'Rimless spherical design borrowed from fighter-pilot helmet optics — the widest unobstructed field of view Oakley makes.',
    matchReason:
      'A mid-low VLT all-rounder for variable light, with peripheral vision that genuinely helps in trees and traffic.',
    // zh: needs review
    descriptionZh:
      '无框球面设计，灵感来自战斗机飞行员头盔光学——Oakley 视野最开阔、遮挡最少的一款。',
    // zh: needs review
    matchReasonZh:
      '适合多变光线的中低透光率全能款，周边视野在树林和人多时真的有帮助。',
  },

  /* ================================================================ */
  /*  JACKETS                                                         */
  /* ================================================================ */
  {
    id: 'jacket-burton-reserve-gtx-insulated',
    category: 'jacket',
    brand: 'Burton',
    name: 'Reserve GORE-TEX 2L Insulated',
    priceTier: 'budget',
    activity: 'both',
    styles: ['all-mountain', 'freestyle', 'piste'],
    levels: ['beginner', 'intermediate', 'advanced'],
    genders: ['male', 'unisex'],
    temps: ['moderate', 'freezing'],
    // Replaces the Oakley Sub Temp RC GORE-TEX (not stocked in Canada). Specs: burton.com/en-ca/products/mens-burton-reserve-gore-tex-2l-insulated-jacket-304111, checked 2026-11-05.
    specs: {
      warmth: 3,
      insulation: '80 g ThermacoreEco synthetic',
      waterproofing: 'GORE-TEX 2L',
      seams: 'Fully taped',
      pitZips: 'Mesh-lined pit zips',
      powderSkirt: 'Stretch powder skirt',
      hood: 'Helmet compatible',
    },
    description:
      "Burton's insulated GORE-TEX jacket: a fully taped 2-layer GORE-TEX shell over 80 g ThermacoreEco, with mesh-lined pit zips and a stretch powder skirt.",
    matchReason:
      'GORE-TEX storm protection with moderate warmth — one jacket for cold, wet resort days.',
    // zh: needs review
    descriptionZh:
      'Burton 的保暖 GORE-TEX 夹克：全压胶双层 GORE-TEX 外层，内衬 80 g ThermacoreEco 保暖层，配网眼腋下拉链和弹力防雪裙。',
    // zh: needs review
    matchReasonZh:
      'GORE-TEX 级别的防风雨，加上适中的保暖——一件搞定寒冷潮湿的雪场日。',
  },
  {
    id: 'jacket-salomon-brilliant',
    category: 'jacket',
    brand: 'Salomon',
    name: 'Brilliant 2.0 Jacket',
    priceTier: 'budget',
    activity: 'both',
    styles: ['piste', 'all-mountain'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing', 'moderate'],
    specs: {
      warmth: 4,
      insulation: 'PrimaLoft Black Eco synthetic',
      waterproofing: 'AdvancedSkin Dry 20K/20K',
      seams: 'Critically taped',
      pitZips: 'Yes',
      powderSkirt: 'Attached',
      weight: '890 g (M)',
    },
    description:
      'A warm, fully-featured resort jacket with synthetic loft that keeps insulating even when it gets damp.',
    matchReason:
      'Reliable warmth at an entry price for cold lift-served days — synthetic fill handles moisture better than down.',
    // zh: needs review
    descriptionZh:
      '一件保暖、功能齐全的雪场外套，合成填充即使受潮也能继续保暖。',
    // zh: needs review
    matchReasonZh:
      '入门价位的可靠保暖，适合寒冷的缆车日——合成填充比羽绒更不怕潮。',
  },
  {
    id: 'jacket-burton-covert',
    category: 'jacket',
    brand: 'Burton',
    name: 'Covert 2L Insulated',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['freestyle', 'all-mountain', 'piste'],
    levels: ['beginner', 'intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    temps: ['moderate', 'freezing'],
    // Renamed successor of the Covert 2.0 (Burton calls it "the men's Covert 2.0 2L Jacket"). Specs: burton.com/en-ca/products/mens-burton-covert-2l-insulated-jacket-311191, checked 2026-11-05.
    specs: {
      warmth: 3,
      insulation: '80 g ThermacoreEco synthetic',
      waterproofing: 'DRYRIDE 2L, 10,000 mm / 5,000 g',
      seams: 'Fully taped',
      pitZips: 'Mesh-lined pit zips',
      powderSkirt: 'Removable waist gaiter',
      hood: 'Helmet compatible',
    },
    description:
      "Burton's renamed Covert 2.0: 80 g ThermacoreEco insulation under a fully taped DRYRIDE 2L shell (10K / 5K), with pit zips and a removable waist gaiter.",
    matchReason:
      'A warm, simple resort jacket at an easy price — enough insulation for cold chairlifts without the bulk.',
    // zh: needs review
    descriptionZh:
      'Burton 改名后的 Covert 2.0：80 g ThermacoreEco 保暖层，外层为全压胶 DRYRIDE 2L 面料（10K / 5K），带腋下拉链和可拆卸防雪裙。',
    // zh: needs review
    matchReasonZh:
      '温暖、简单、价格友好的雪场夹克——足以应付寒冷的缆车，又不臃肿。',
  },
  {
    id: 'jacket-burton-frostner-down',
    category: 'jacket',
    brand: 'Burton',
    name: 'Frostner Down Jacket',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['piste', 'all-mountain'],
    levels: ['beginner', 'intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing'],
    specs: {
      warmth: 5,
      insulation: '800-fill RDS down',
      waterproofing: 'DRYRIDE 2L, 15,000 mm',
      seams: 'Critically taped',
      pitZips: 'Yes',
      hood: 'Insulated, helmet compatible',
      weight: '950 g (M)',
    },
    description:
      'High-loft 800-fill down under a waterproof DRYRIDE 2-layer shell, for the most warmth for the least weight.',
    matchReason:
      'Purpose-built for deep-cold days, when long chairlift rides matter more than breathability.',
    // zh: needs review
    descriptionZh:
      '高蓬松度的 800 蓬羽绒，外面是防水的 DRYRIDE 2 层面料，用最轻的重量换最多的保暖。',
    // zh: needs review
    matchReasonZh:
      '专为极寒天打造——缆车坐得久的日子，保暖比透气更重要。',
  },
  {
    id: 'jacket-rossignol-proclivity-3l',
    category: 'jacket',
    brand: 'Rossignol',
    name: 'Proclivity 3L Shell',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['backcountry', 'all-mountain'],
    levels: ['intermediate', 'advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['spring', 'moderate'],
    // Replaces the Salomon Stance 3L Shell (not stocked in Canada). Specs: rossignol.com/ca-en/mens-proclivity-3l-shell-ski-jacket-RLPMJ12200.html, checked 2026-11-05.
    specs: {
      warmth: 1,
      insulation: 'None (3-layer shell)',
      waterproofing: '20K, 3-layer R-Shell Dry',
      seams: 'Fully seam taped',
      pitZips: 'Extended pit zips',
      hood: 'Fixed, 3D adjustment',
      fit: 'Relaxed',
    },
    description:
      "Rossignol's freeride shell: 3-layer, fully seam-taped fabric rated 20K waterproof and windproof, with extended pit zips and a 3D-adjustable hood.",
    matchReason:
      "No insulation, so you layer it for hikes, storms and spring — developed with Rossignol's freeride athletes for steep terrain.",
    // zh: needs review
    descriptionZh:
      'Rossignol 的自由式滑雪硬壳：三层面料全压胶，防水 20K、防风，配加长腋下拉链和 3D 可调帽兜。',
    // zh: needs review
    matchReasonZh:
      '无填充，适合叠穿应对徒步、风雪和春季——与 Rossignol 自由式滑雪运动员共同开发，面向陡峭地形。',
  },
  {
    id: 'jacket-arcteryx-macai',
    category: 'jacket',
    brand: "Arc'teryx",
    name: 'Macai Down Jacket',
    priceTier: 'premium',
    activity: 'both',
    styles: ['piste', 'all-mountain'],
    levels: ['intermediate', 'advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing'],
    specs: {
      warmth: 5,
      insulation: '750 fill-power European grey goose down + Coreloft in wet zones',
      waterproofing: 'GORE-TEX 2L ePE, 100D face fabric',
      seams: 'Fully taped',
      pitZips: 'Yes',
      hood: 'StormHood, helmet compatible',
      weight: '1,020 g (M)',
    },
    description:
      "Arc'teryx's warmest resort piece: down-filled baffles under a GORE-TEX shell, so the loft never gets wet.",
    matchReason:
      'The definitive deep-cold jacket — for chairlift days at -15 °C and below where nothing else is warm enough.',
    // zh: needs review
    descriptionZh:
      '始祖鸟最保暖的雪场单品：羽绒填充的绗缝格，外面罩着 GORE-TEX，蓬松层永远不会被打湿。',
    // zh: needs review
    matchReasonZh:
      '极寒天的终极外套——零下 15°C 以下坐缆车、别的都不够暖的时候就靠它。',
  },
  {
    id: 'jacket-arcteryx-sabre',
    category: 'jacket',
    brand: "Arc'teryx",
    name: 'Sabre Jacket',
    priceTier: 'premium',
    activity: 'both',
    styles: ['all-mountain', 'backcountry', 'freestyle'],
    levels: ['intermediate', 'advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['moderate', 'spring'],
    specs: {
      warmth: 2,
      insulation: 'Uninsulated, brushed tricot lining',
      waterproofing: 'GORE-TEX 3L, 80D face fabric',
      seams: 'Fully taped',
      pitZips: 'PitZips™',
      powderSkirt: 'RECCO reflector, removable skirt',
      weight: '720 g (M)',
    },
    description:
      'The reference all-mountain 3L shell — burly enough for tree runs, breathable enough to hike in, with a relaxed freeride cut.',
    matchReason:
      'For riders who want one shell for everything and layer underneath to match the day’s temperature.',
    // zh: needs review
    descriptionZh:
      '全山 3L 硬壳的标杆——够耐磨钻树林，够透气能徒步，版型是宽松的自由滑剪裁。',
    // zh: needs review
    matchReasonZh:
      '适合想要一件硬壳打天下、按当天气温在里面加减层的人。',
  },
  {
    id: 'jacket-arcteryx-rush',
    category: 'jacket',
    brand: "Arc'teryx",
    name: 'Rush Jacket',
    priceTier: 'premium',
    activity: 'both',
    styles: ['backcountry'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['spring', 'moderate'],
    specs: {
      warmth: 1,
      insulation: 'Uninsulated, minimal lining',
      waterproofing: 'GORE-TEX Pro 3L, most breathable variant',
      seams: 'Fully taped',
      pitZips: 'Full-length PitZips™',
      pockets: 'Harness- and pack-compatible',
      weight: '505 g (M)',
    },
    description:
      'GORE-TEX Pro in its most breathable configuration, cut for movement and sized to fit over a light insulator on the descent.',
    matchReason:
      'For committed ski tourers and splitboarders where sweat management matters more than raw warmth.',
    // zh: needs review
    descriptionZh:
      '最透气配置的 GORE-TEX Pro，剪裁利于活动，下坡时尺寸也够套一件薄保暖层。',
    // zh: needs review
    matchReasonZh:
      '适合认真的双板登山和分体板玩家——排汗管理比单纯的保暖更重要。',
  },
  {
    id: 'jacket-burton-ak-cyclic',
    category: 'jacket',
    brand: 'Burton',
    name: '[ak] Cyclic GORE-TEX 2L',
    priceTier: 'premium',
    activity: 'snowboard',
    styles: ['backcountry', 'freestyle', 'all-mountain'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['moderate', 'spring'],
    specs: {
      warmth: 2,
      insulation: 'Uninsulated with light taffeta lining',
      waterproofing: 'GORE-TEX 2L with stretch',
      seams: 'Fully taped',
      pitZips: 'Mesh-lined vents',
      fit: 'Regular [ak] freeride cut',
      weight: '680 g (M)',
    },
    description:
      'Burton’s backcountry-focused stretch shell with articulated sleeves that stay put through a full grab.',
    matchReason:
      'A snowboard-specific freeride shell built for movement, hiking and layering across changing conditions.',
    // zh: needs review
    descriptionZh:
      'Burton 主打野雪的弹力硬壳，立体剪裁的袖子做完整的抓板动作也不会往上跑。',
    // zh: needs review
    matchReasonZh:
      '一件专为单板设计的自由滑硬壳，为活动、徒步和多变天气下的叠穿而生。',
  },

  /* ================================================================ */
  /*  BINDINGS — SKI                                                  */
  /* ================================================================ */
  {
    id: 'binding-salomon-strive-10',
    category: 'bindings',
    brand: 'Salomon',
    name: 'Strive 10 GW',
    priceTier: 'budget',
    activity: 'ski',
    styles: ['piste', 'all-mountain'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      dinRange: '3–10',
      weight: '920 g (per binding)',
      brakeWidth: '90–120 mm (adjustable)',
      elasticity: 'Standard (8mm toe / 9mm heel travel)',
      material: 'Composite chassis, steel pins',
      certification: 'ISO 9462 certified',
      soleCompatibility: 'Alpine (ISO 5355) / GripWalk (ISO 23223)',
    },
    description:
      'A light, forgiving release binding built around a low DIN range so a developing skier releases when they should.',
    matchReason:
      'The right release range for beginners and early intermediates — protective without being twitchy.',
    // zh: needs review
    descriptionZh:
      '一副轻量、宽容的固定器，围绕较低的 DIN 范围设计，让进步中的双板玩家在该脱离时就脱离。',
    // zh: needs review
    matchReasonZh:
      '适合初学者和刚入门中级的脱离范围——保护到位，又不会动不动就脱板。',
  },
  {
    id: 'binding-atomic-strive-14-mn',
    category: 'bindings',
    brand: 'Atomic',
    name: 'Strive 14 MN',
    priceTier: 'mid-range',
    activity: 'ski',
    styles: ['all-mountain', 'freestyle', 'backcountry'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'unisex'],
    // Replaces the Atomic Warden MNC 13 (atomic.com no longer lists a Warden). Specs: atomic.com/en-ca/products/strive-14-mn-ad0400-202600, checked 2026-11-05.
    // levels follow Atomic's copy ("Pro-level stability", "most at home when it's charging hard"); Atomic states no ability rating.
    specs: {
      dinRange: '5–14',
      weight: '1,002 g (single binding)',
      brakeWidth: '90 / 100 / 115 / 130 mm',
      material: 'Aluminium / PA',
      certification: 'TÜV certified',
      soleCompatibility: 'Multi-Norm: alpine (DIN), touring and WTR soles',
    },
    description:
      "Atomic's multi-norm freeski binding: a low LDN toe for snow feel, a 3-Part Heel, release values 5–14 and manual toe height for alpine, touring and WTR soles.",
    matchReason:
      "The Atomic Freeski team's binding, made for strong skiers who charge all-mountain, freeride and park terrain.",
    // zh: needs review
    descriptionZh:
      'Atomic 的多标准自由式固定器：低重心 LDN 前座提升雪感，三段式后座，释放值 5–14，前座高度可手动调节，兼容高山、登山与 WTR 鞋底。',
    // zh: needs review
    matchReasonZh:
      'Atomic 自由式滑雪队选用的固定器，适合在全山地、野雪和公园里放开滑的强手。',
  },
  {
    id: 'binding-marker-jester-x-16',
    category: 'bindings',
    brand: 'Marker',
    name: 'Jester X 16 MWerks',
    priceTier: 'premium',
    activity: 'ski',
    styles: ['all-mountain', 'freestyle', 'backcountry'],
    levels: ['expert'],
    genders: ['male', 'unisex'],
    // Replaces the Marker Jester 16 ID (Marker's only current Jester). Specs: markerbindings.com/en-ca/p/jester-x-16-mwerks-bindings-2026 (2027 model), checked 2026-11-05.
    specs: {
      dinRange: '6–16',
      weight: '1,130 g',
      brakeWidth: '90 / 105 / 120 mm',
      material: 'Triple Pivot Elite X toe, stainless steel AFD',
      soleCompatibility: 'Alpine and GripWalk',
    },
    description:
      "Marker's freeride binding: DIN 6–16, a Triple Pivot Elite X toe and a stainless-steel AFD gliding plate, for alpine and GripWalk soles.",
    matchReason:
      'Marker rates it for expert and competition skiers — a binding for charging big lines and the park.',
    // zh: needs review
    descriptionZh:
      'Marker 的自由式固定器：DIN 6–16，Triple Pivot Elite X 前座和不锈钢 AFD 滑板，兼容高山与 GripWalk 鞋底。',
    // zh: needs review
    matchReasonZh:
      'Marker 将它定位于专家级和比赛选手——为大线路和公园里的猛冲而生。',
  },

  /* ================================================================ */
  /*  BINDINGS — SNOWBOARD                                            */
  /* ================================================================ */
  {
    id: 'binding-burton-freestyle-reflex',
    category: 'bindings',
    brand: 'Burton',
    name: 'Freestyle Re:Flex',
    priceTier: 'budget',
    activity: 'snowboard',
    styles: ['freestyle', 'all-mountain'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'unisex'],
    specs: {
      highback: 'Shaped, low profile, no canting',
      baseplate: 'Re:Flex EVA cushioned, dampens board flex underfoot',
      straps: 'Single ratchet ankle strap, mini heel hoop',
      flexRating: '4/10 (soft)',
      compatibility: '3D / 4x4 / 2x4',
      weight: '820 g (pair, size M)',
      material: 'Nylon composite baseplate, aluminum buckles',
    },
    description:
      'A soft, forgiving binding with a cushioned baseplate that takes the edge off flat-landing park laps.',
    matchReason:
      'Easy to strap in and forgiving underfoot — a comfortable first binding for riders still building confidence.',
    // zh: needs review
    descriptionZh:
      '一副柔软、宽容的固定器，底板带缓冲，在公园里平落地时能卸掉不少冲击。',
    // zh: needs review
    matchReasonZh:
      '好穿好绑、脚下宽容——还在建立信心的玩家的舒适第一副固定器。',
  },
  {
    id: 'binding-union-force',
    category: 'bindings',
    brand: 'Union',
    name: 'Force',
    priceTier: 'mid-range',
    activity: 'snowboard',
    styles: ['all-mountain', 'freestyle'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'unisex'],
    specs: {
      highback: 'Duraflex, canted, forward-lean adjustable',
      baseplate: 'Aluminum heel hoop, EVA cushioned footbed',
      straps: 'Dual ratchet ladder straps',
      flexRating: '7/10 (medium-stiff)',
      compatibility: '4x4 / 2x4 / Channel',
      weight: '910 g (pair, size M)',
      material: 'Duraflex composite baseplate, aluminum highback',
    },
    description:
      'The reference all-mountain binding: a canted highback and dual ratchet straps that lock the boot down without dead spots.',
    matchReason:
      'Medium-stiff response for riders who charge all-mountain terrain and still want to press a jib on the way down.',
    // zh: needs review
    descriptionZh:
      '全山固定器的标杆：带倾角的高背和双棘轮绑带把雪鞋锁得很牢，没有虚位。',
    // zh: needs review
    matchReasonZh:
      '中偏硬的反馈，适合在全山狠冲、下山路上还想顺手压个道具的人。',
  },
  {
    id: 'binding-burton-genesis-x',
    // Hidden from matching: discontinued, last made for 2020 — see docs/catalogue-audit.md.
    hidden: true,
    category: 'bindings',
    brand: 'Burton',
    name: 'Genesis X',
    priceTier: 'premium',
    activity: 'snowboard',
    styles: ['all-mountain', 'freestyle', 'backcountry'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      highback: 'Carbon-infused, fully canted, forward-lean adjustable',
      baseplate: 'Hammockstrap suspension, Living Hinge toe strap',
      straps: 'Dual ratchet, Living Hinge toe wrap',
      flexRating: '8/10 (stiff)',
      compatibility: 'Channel / EST / 4x4 (adjustable)',
      weight: '760 g (pair, size M)',
      material: 'Carbon-infused nylon baseplate, aluminum highback',
    },
    description:
      'Burton’s flagship binding: a carbon highback and Hammockstrap suspension that wrap the boot instead of clamping it, at a genuinely light weight.',
    matchReason:
      'Stiff, precise and light enough to disappear underfoot — for expert riders who feel every dead spot in a lesser binding.',
    // zh: needs review
    descriptionZh:
      'Burton 的旗舰固定器：碳纤维高背和 Hammockstrap 悬挂系统是包裹雪鞋而不是夹住它，重量也真的轻。',
    // zh: needs review
    matchReasonZh:
      '硬朗、精准、轻到脚下几乎感觉不到——适合能感觉到普通固定器每一处虚位的专家级玩家。',
  },
];

/**
 * Defensive read of one price cell — anything malformed reads as unchecked,
 * a price always means `found` (and `found` needs a price), "from" only counts
 * on a real price, and a source URL off the retailer's own storefront is dropped.
 */
const readPrice = (
  itemId: string,
  retailerId: RetailerId,
): Pick<RetailerPrice, 'match' | 'price' | 'priceFrom' | 'checkedAt' | 'sourceUrl'> => {
  const entry = priceTable[itemId]?.[retailerId];
  const price = typeof entry?.price === 'number' && Number.isFinite(entry.price) && entry.price > 0 ? entry.price : null;
  const match: PriceMatch | null =
    price !== null ? 'found' : entry?.match === 'ambiguous' || entry?.match === 'not_found' ? entry.match : null;
  const priceFrom = price !== null && entry?.priceFrom === true;
  const checkedAt = typeof entry?.checkedAt === 'string' && entry.checkedAt ? entry.checkedAt : null;
  const sourceUrl =
    typeof entry?.sourceUrl === 'string' && isRetailerUrl(retailerId, entry.sourceUrl) ? entry.sourceUrl : null;
  return { match, price, priceFrom, checkedAt, sourceUrl };
};

/**
 * Public database.
 *
 * Every item carries one `RetailerPrice` per known retailer, in registry
 * order, priced or not — the UI filters to the selected region. Links are
 * generated here: the checked product page when there is one, else a live
 * search on that retailer's own site for the exact product. Cards render
 * these with `target="_blank" rel="noopener noreferrer sponsored"`.
 */
export const gearDatabase: GearItem[] = listings.map(({ searchTerm, ...item }) => ({
  ...item,
  image: buildGearImage(item),
  performance: computePerformanceProfile(item),
  prices: RETAILER_IDS.map<RetailerPrice>((retailerId) => {
    const cell = readPrice(item.id, retailerId);
    return {
      retailerId,
      currency: RETAILERS[retailerId].currency,
      ...cell,
      link: buildRetailerUrl(retailerId, searchTerm ?? `${item.brand} ${item.name}`, cell.sourceUrl),
    };
  }),
}));

/** Items the matcher can recommend: everything not `hidden`. Use this for counts shown to riders. */
export const matchableGear: GearItem[] = gearDatabase.filter((item) => !item.hidden);

/** Lookup helper. Finds hidden items too, so saved setups that include one still total. */
export const getGearById = (id: string): GearItem | undefined =>
  gearDatabase.find((item) => item.id === id);

/** Every item in a category. */
export const getGearByCategory = (category: GearItem['category']): GearItem[] =>
  gearDatabase.filter((item) => item.category === category);

export default gearDatabase;
