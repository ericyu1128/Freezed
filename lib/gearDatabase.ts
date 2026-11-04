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
 * Retailer links are generated, not stored: every one is generated at module load as a live
 * search query against that retailer's own site (see `buildRetailerUrl` in
 * `retailers.ts`), so a link always lands on real results rather than a dead
 * product-detail URL.
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

import type { GearItem, RetailerPrice } from './types';
import { buildGearImage } from './gearImages';
import { computePerformanceProfile } from './performanceProfile';
import { buildRetailerUrl, RETAILER_IDS, RETAILERS } from './retailers';
import pricesJson from '../data/prices.json';

/** Shape of `data/prices.json`: item id → retailer id → hand-checked price. */
export type PriceTable = Record<string, Record<string, { price: number | null; checkedAt: string | null }>>;

const priceTable = pricesJson as PriceTable;

/** Database rows are authored without prices, links or performance scores; all three are derived on export. */
type GearListing = Omit<GearItem, 'prices' | 'image' | 'performance'> & {
  /**
   * Optional override for the retailer search string. Use when the brand field
   * and the shelf name disagree — e.g. Anon is a Burton company but retailers
   * index it under `Anon`.
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
      waistWidth: 72,
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
      waistWidth: 109,
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
  },
  {
    id: 'ski-atomic-backland-107',
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
  },

  /* ================================================================ */
  /*  SNOWBOARDS (stored under the `skis` hardgood category)          */
  /* ================================================================ */
  {
    id: 'board-k2-raygun',
    category: 'skis',
    brand: 'K2',
    name: 'Raygun',
    priceTier: 'budget',
    activity: 'snowboard',
    styles: ['all-mountain', 'piste'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'unisex'],
    specs: {
      waistWidth: 252,
      lengths: '149 / 152 / 156 / 159W / 162W',
      profile: 'Tweekend — flat to rocker',
      core: 'Bamboo 3D stringers',
      flexRating: '5 / 10',
      shape: 'Directional twin',
      base: 'Extruded 2000',
    },
    description:
      'A forgiving flat-to-rocker directional twin that is famously easy to learn on but still holds together at intermediate speeds.',
    matchReason:
      'One of the best value first boards — catch-free feel, but with enough camber-free stability to progress on.',
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
      flexRating: '7 / 10',
      shape: 'Directional twin',
      base: 'Sintered WFO',
    },
    description:
      'Thirty-plus seasons of refinement. Traditional camber, carbon Squeezebox and a fast sintered base — precise, poppy and unforgiving of laziness.',
    matchReason:
      'For confident riders who load the board hard through turns and want maximum edge hold and rebound.',
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
  },

  /* ================================================================ */
  /*  BOOTS — SKI                                                     */
  /* ================================================================ */
  {
    id: 'boot-atomic-hawx-prime-90',
    category: 'boots',
    brand: 'Atomic',
    name: 'Hawx Prime 90 GW',
    priceTier: 'budget',
    activity: 'ski',
    styles: ['piste', 'all-mountain'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'unisex'],
    specs: {
      flex: 90,
      lastWidth: '100 mm (medium)',
      liner: 'Prolite / Memory Fit 3D',
      soleStandard: 'GripWalk',
      cuffAlignment: 'Single-side canting',
      weight: '1,780 g @ 27.5',
    },
    description:
      'A heat-mouldable 100 mm-last boot with a friendly 90 flex — enough support to drive a ski, soft enough to flex forward comfortably all day.',
    matchReason:
      'The classic first "real" boot: shop-customisable shell, medium volume fit and a flex that will not overpower a developing skier.',
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
  },
  {
    id: 'boot-salomon-shift-pro-110w',
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
  },
  {
    id: 'boot-k2-method-100',
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
  },
  {
    id: 'boot-salomon-spro-supra-120',
    category: 'boots',
    brand: 'Salomon',
    name: 'S/Pro Supra BOA 120',
    priceTier: 'premium',
    activity: 'ski',
    styles: ['piste', 'all-mountain'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'unisex'],
    specs: {
      flex: 120,
      lastWidth: '100 mm (medium)',
      liner: 'Coreframe 360 + My Custom Fit 4D',
      soleStandard: 'GripWalk',
      closure: 'BOA Fit System forefoot',
      weight: '1,850 g @ 27.5',
    },
    description:
      'BOA forefoot closure removes shell distortion and delivers noticeably more even wrap and power transfer than a conventional buckle.',
    matchReason:
      'For advanced skiers who want race-adjacent response and a precise, dialled fit without a 130-flex punishment.',
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
  },
  {
    id: 'boot-volkl-secret-105',
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
  },
  {
    id: 'helmet-salomon-pioneer-lt',
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
  },
  {
    id: 'helmet-smith-mission-mips',
    category: 'helmet',
    brand: 'Smith',
    name: 'Mission MIPS',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['all-mountain', 'piste', 'freestyle'],
    levels: ['beginner', 'intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing', 'moderate', 'spring'],
    specs: {
      warmth: 3,
      construction: 'In-mould with EPS liner',
      certification: 'ASTM F2040 / CE EN1077 Class B',
      vents: 14,
      ventControl: 'Fixed vents + AirEvac goggle integration',
      rotational: 'MIPS',
      weight: '425 g (M)',
    },
    description:
      'MIPS rotational protection, AirEvac ventilation that pulls fog out of your goggles, and a low-profile in-mould shell.',
    matchReason:
      'The sweet spot for value and safety tech — MIPS plus proper goggle integration at a mid-tier price.',
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
  },
  {
    id: 'helmet-smith-vantage-mips',
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
      ventControl: 'BOA 360 fit + adjustable vents',
      rotational: 'MIPS',
      weight: '460 g (M)',
    },
    description:
      'BOA 360 fit system, MIPS and a three-position Modular Brim that lets you dial the goggle gap out completely.',
    matchReason:
      'For riders who want a precise micro-adjustable fit and a seamless goggle seal across changing conditions.',
  },

  /* ================================================================ */
  /*  GOGGLES                                                         */
  /* ================================================================ */
  {
    id: 'goggle-smith-squad-yellow',
    category: 'goggles',
    brand: 'Smith',
    name: 'Squad — Yellow Sensor Mirror',
    priceTier: 'budget',
    activity: 'both',
    styles: ['piste', 'all-mountain', 'freestyle'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing'],
    specs: {
      vlt: 65,
      lensTint: 'Yellow Sensor Mirror',
      lensShape: 'Cylindrical',
      lensTech: 'Carbonic-X with TLT optics',
      antiFog: 'Fog-X inner lens',
      spareLens: 'Included (Clear, 89% VLT)',
      fit: 'Medium',
    },
    description:
      'A high-VLT low-light lens that lifts contrast in flat light and falling snow, with a bonus clear lens for night laps.',
    matchReason:
      'Maximum light transmission for storm days and dusk — the right lens when the light goes flat.',
  },
  {
    id: 'goggle-salomon-radium-pro',
    category: 'goggles',
    brand: 'Salomon',
    name: 'Radium Pro Sigma',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['all-mountain', 'piste', 'backcountry'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    temps: ['moderate'],
    specs: {
      vlt: 28,
      lensTint: 'Sigma Sky Blue',
      lensShape: 'Toric',
      lensTech: 'Sigma contrast-boost coating',
      antiFog: 'Double lens + anti-fog treatment',
      spareLens: 'Included (Low light, 62% VLT)',
      fit: 'Medium / large',
    },
    description:
      'A do-everything mid-VLT toric lens with genuinely wide peripheral vision and a magnetic-free but very quick lens swap.',
    matchReason:
      'The most versatile VLT window there is — usable in bright sun and passable when clouds roll in.',
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
  },
  {
    id: 'goggle-burton-anon-m4',
    searchTerm: 'Anon M4 Toric',
    category: 'goggles',
    brand: 'Burton',
    name: 'Anon M4 Toric — Perceive Cloudy Pink',
    priceTier: 'premium',
    activity: 'both',
    styles: ['freestyle', 'all-mountain', 'backcountry'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing'],
    specs: {
      vlt: 46,
      lensTint: 'Perceive Cloudy Pink',
      lensShape: 'Toric',
      lensTech: 'Perceive contrast + Magna-Tech magnetic swap',
      antiFog: 'Integral Clarity Technology',
      spareLens: 'Included (Sunny Onyx, 6% VLT)',
      faceMask: 'MFI magnetic facemask included',
      fit: 'Large',
    },
    description:
      'Magnetic lens changes in under five seconds, plus a magnetic facemask that seals to the frame and stops fogging at the chin.',
    matchReason:
      'A high-VLT storm lens with a bright spare in the box — one purchase that covers the entire light spectrum.',
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
      spareLens: 'Included (ChromaPop Sun Platinum, 15% VLT)',
      fit: 'Medium / large',
    },
    description:
      'Spherical ChromaPop optics with a magnetic lens system; the Storm Rose lens is the reference low-light tint for grey days.',
    matchReason:
      'Storm-day clarity with a low-VLT spare included, so one goggle covers freezing overcast and bright sun.',
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
      spareLens: 'Included (Storm Rose Flash, 50% VLT)',
      fit: 'Large',
    },
    description:
      'The BirdsEye lens curve extends your downward field of view so you can see your feet without dropping your chin. Very dark sun tint.',
    matchReason:
      'Built for high-glare spring sun and reflective snowpack where standard tints let too much light through.',
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
      vlt: 19,
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
  },

  /* ================================================================ */
  /*  JACKETS                                                         */
  /* ================================================================ */
  {
    id: 'jacket-oakley-sub-temp-rc',
    category: 'jacket',
    brand: 'Oakley',
    name: 'Sub Temp RC GORE-TEX Shell',
    priceTier: 'budget',
    activity: 'both',
    styles: ['all-mountain', 'freestyle', 'piste'],
    levels: ['beginner', 'intermediate', 'advanced'],
    genders: ['male', 'unisex'],
    temps: ['spring', 'moderate'],
    specs: {
      warmth: 1,
      insulation: 'Uninsulated shell',
      waterproofing: 'GORE-TEX 2L, 28k/25k',
      seams: 'Fully taped',
      pitZips: 'Yes — mesh-lined underarm vents',
      powderSkirt: 'Removable',
      weight: '620 g (M)',
    },
    description:
      'A clean 2-layer GORE-TEX shell with big pit zips. No insulation — you control warmth entirely through your mid-layer.',
    matchReason:
      'The right call for warm, wet spring days and for anyone who runs hot and prefers layering to built-in loft.',
  },
  {
    id: 'jacket-salomon-brilliant',
    category: 'jacket',
    brand: 'Salomon',
    name: 'Brilliant Insulated Jacket',
    priceTier: 'budget',
    activity: 'both',
    styles: ['piste', 'all-mountain'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing', 'moderate'],
    specs: {
      warmth: 4,
      insulation: '80 g Advanced Skin Warm synthetic',
      waterproofing: 'AdvancedSkin Dry 10k/10k',
      seams: 'Critically taped',
      pitZips: 'Yes',
      powderSkirt: 'Attached',
      weight: '890 g (M)',
    },
    description:
      'A warm, fully-featured resort jacket with synthetic loft that keeps insulating even when it gets damp.',
    matchReason:
      'Reliable warmth at an entry price for cold lift-served days — synthetic fill handles moisture better than down.',
  },
  {
    id: 'jacket-burton-covert',
    category: 'jacket',
    brand: 'Burton',
    name: 'Covert 2.0 Insulated',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['freestyle', 'all-mountain', 'piste'],
    levels: ['beginner', 'intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    temps: ['moderate', 'freezing'],
    specs: {
      warmth: 3,
      insulation: '40 g Thermolite / 60 g body',
      waterproofing: 'DRYRIDE 2L 10k/10k',
      seams: 'Critically taped',
      pitZips: 'Mesh-lined pit zips',
      powderSkirt: 'Removable',
      weight: '810 g (M)',
    },
    description:
      'The everyday resort jacket: relaxed fit, moderate insulation and every pocket you actually use, at a sane price.',
    matchReason:
      'A balanced mid-weight for typical -5 °C to 0 °C days, cut loose enough for a mid-layer when it gets colder.',
  },
  {
    id: 'jacket-burton-frostner-down',
    category: 'jacket',
    brand: 'Burton',
    name: 'Frostner 2L Down Jacket',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['piste', 'all-mountain'],
    levels: ['beginner', 'intermediate', 'advanced'],
    genders: ['male', 'female', 'unisex'],
    temps: ['freezing'],
    specs: {
      warmth: 5,
      insulation: '650 fill-power responsible down + Thermolite in wet zones',
      waterproofing: 'DRYRIDE 2L 10k/10k',
      seams: 'Critically taped',
      pitZips: 'Yes',
      hood: 'Insulated, helmet compatible',
      weight: '950 g (M)',
    },
    description:
      'Down through the core for maximum warmth-to-weight, synthetic in the shoulders and cuffs where moisture collects.',
    matchReason:
      'Purpose-built for deep-cold days — the hybrid fill avoids down’s classic failure mode in wet weather.',
  },
  {
    id: 'jacket-salomon-stance-3l',
    category: 'jacket',
    brand: 'Salomon',
    name: 'Stance 3L Shell',
    priceTier: 'mid-range',
    activity: 'both',
    styles: ['backcountry', 'all-mountain'],
    levels: ['intermediate', 'advanced', 'expert'],
    genders: ['male', 'female', 'unisex'],
    temps: ['spring', 'moderate'],
    specs: {
      warmth: 1,
      insulation: 'Uninsulated 3L shell',
      waterproofing: 'AdvancedSkin Dry 3L 20k/20k',
      seams: 'Fully taped',
      pitZips: 'Full-length underarm vents',
      pockets: 'Beacon pocket, pass pocket',
      weight: '560 g (M)',
    },
    description:
      'A light, highly breathable 3-layer touring shell with full-length vents and a beacon pocket. Built to move.',
    matchReason:
      'For riders generating their own heat on the skin track who need breathability over insulation.',
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
      waterproofing: 'GORE-TEX 3L with N80p face fabric',
      seams: 'Fully taped',
      pitZips: 'Yes',
      hood: 'StormHood, helmet compatible',
      weight: '1,020 g (M)',
    },
    description:
      "Arc'teryx's warmest resort piece: down-filled baffles under a full 3L GORE-TEX shell, so the loft never gets wet.",
    matchReason:
      'The definitive deep-cold jacket — for chairlift days at -15 °C and below where nothing else is warm enough.',
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
  },

  /* ================================================================ */
  /*  BINDINGS — SKI                                                  */
  /* ================================================================ */
  {
    id: 'binding-salomon-strive-10',
    category: 'bindings',
    brand: 'Salomon',
    name: 'Strive 10',
    priceTier: 'budget',
    activity: 'ski',
    styles: ['piste', 'all-mountain'],
    levels: ['beginner', 'intermediate'],
    genders: ['male', 'female', 'unisex'],
    specs: {
      dinRange: '3.5–10',
      weight: '780 g (pair)',
      brakeWidth: '90–120 mm (adjustable)',
      elasticity: 'Standard (8mm toe / 9mm heel travel)',
      material: 'Composite chassis, steel pins',
      certification: 'ISO 9462 certified',
      soleCompatibility: 'Alpine (adjustable AFD)',
    },
    description:
      'A light, forgiving release binding built around a low DIN range so a developing skier releases when they should.',
    matchReason:
      'The right release range for beginners and early intermediates — protective without being twitchy.',
  },
  {
    id: 'binding-atomic-warden-13',
    category: 'bindings',
    brand: 'Atomic',
    name: 'Warden MNC 13',
    priceTier: 'mid-range',
    activity: 'ski',
    styles: ['all-mountain', 'freestyle'],
    levels: ['intermediate', 'advanced'],
    genders: ['male', 'unisex'],
    specs: {
      dinRange: '4–13',
      weight: '890 g (pair)',
      brakeWidth: '90–120 mm (adjustable)',
      elasticity: 'High (18mm toe / 15mm heel travel)',
      material: 'Aluminum toe piece, steel heel',
      certification: 'ISO 9462 / TÜV certified',
      soleCompatibility: 'Multi-Norm Certified — Alpine / GripWalk / touring (adjustable)',
    },
    description:
      'A wide-range Multi-Norm binding that mounts almost anything in a boot rack, with enough elasticity to shrug off park landings.',
    matchReason:
      'A do-everything all-mountain binding for intermediate-to-advanced skiers who want one setup for groomers and park laps.',
  },
  {
    id: 'binding-marker-jester-16',
    category: 'bindings',
    brand: 'Marker',
    name: 'Jester 16 ID',
    priceTier: 'premium',
    activity: 'ski',
    styles: ['all-mountain', 'freestyle', 'backcountry'],
    levels: ['advanced', 'expert'],
    genders: ['male', 'unisex'],
    specs: {
      dinRange: '6–16',
      weight: '980 g (pair)',
      brakeWidth: '90–130 mm (adjustable)',
      elasticity: 'Very high (24mm toe / 20mm heel travel — Triple Pivot)',
      material: 'Aluminum chassis, steel pins, Triple Pivot toe',
      certification: 'ISO 9462 / TÜV certified',
      soleCompatibility: 'Alpine / GripWalk (adjustable AFD)',
    },
    description:
      'A freeride workhorse: a high-DIN Triple Pivot toe that holds through chattery snow and hucked landings without pre-releasing.',
    matchReason:
      'Built for expert skiers who ski aggressively across variable terrain and need retention that will not back off under load.',
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
  },
  {
    id: 'binding-burton-genesis-x',
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
  },
];

/** Defensive read of one price cell — anything malformed reads as unchecked. */
const readPrice = (itemId: string, retailerId: string): Pick<RetailerPrice, 'price' | 'checkedAt'> => {
  const entry = priceTable[itemId]?.[retailerId];
  const price = typeof entry?.price === 'number' && Number.isFinite(entry.price) && entry.price > 0 ? entry.price : null;
  const checkedAt = typeof entry?.checkedAt === 'string' && entry.checkedAt ? entry.checkedAt : null;
  return { price, checkedAt };
};

/**
 * Public database.
 *
 * Every item carries one `RetailerPrice` per known retailer, in registry
 * order, priced or not — the UI filters to the selected region. Links are
 * generated here rather than stored, so every link is a live search on that
 * retailer's own site for the exact product. Cards render these with
 * `target="_blank" rel="noopener noreferrer sponsored"`.
 */
export const gearDatabase: GearItem[] = listings.map(({ searchTerm, ...item }) => ({
  ...item,
  image: buildGearImage(item),
  performance: computePerformanceProfile(item),
  prices: RETAILER_IDS.map<RetailerPrice>((retailerId) => ({
    retailerId,
    currency: RETAILERS[retailerId].currency,
    ...readPrice(item.id, retailerId),
    link: buildRetailerUrl(retailerId, searchTerm ?? `${item.brand} ${item.name}`),
  })),
}));

/** Lookup helper. */
export const getGearById = (id: string): GearItem | undefined =>
  gearDatabase.find((item) => item.id === id);

/** Every item in a category. */
export const getGearByCategory = (category: GearItem['category']): GearItem[] =>
  gearDatabase.filter((item) => item.category === category);

export default gearDatabase;
