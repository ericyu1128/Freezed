/**
 * Freezed — core domain types
 * Made by Eric Yu
 */

import type { Currency, RetailerId } from './retailers';

/* ------------------------------------------------------------------ */
/*  Primitive unions                                                   */
/* ------------------------------------------------------------------ */

export type Activity = 'ski' | 'snowboard';

export type Gender = 'male' | 'female' | 'unisex';

export type Level = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Riding discipline / terrain preference. */
export type RidingStyle = 'piste' | 'all-mountain' | 'freestyle' | 'backcountry';

/**
 * Expected on-hill conditions.
 * - `freezing`  : -15°C and below
 * - `moderate`  : -5°C to 0°C
 * - `spring`    : above 0°C
 */
export type Temperature = 'freezing' | 'moderate' | 'spring';

/**
 * Spend bracket.
 * - `budget`    : Entry-level / Value
 * - `mid-range` : Balanced performance / price
 * - `premium`   : Top-tier / Pro construction
 */
export type BudgetTier = 'budget' | 'mid-range' | 'premium';

/** `bindings` covers both ski and snowboard bindings — see `activity` on `GearItem` to tell them apart. */
export type GearCategory = 'skis' | 'boots' | 'helmet' | 'goggles' | 'jacket' | 'bindings';

/* ------------------------------------------------------------------ */
/*  User profile                                                       */
/* ------------------------------------------------------------------ */

export interface UserStats {
  activity: Activity;
  gender: Gender;
  /** Standing height in centimetres. */
  height: number;
  /** Body weight in kilograms. */
  weight: number;
  level: Level;
  style: RidingStyle;
  temperature: Temperature;
  budgetTier: BudgetTier;
}

/* ------------------------------------------------------------------ */
/*  Gear                                                               */
/* ------------------------------------------------------------------ */

/**
 * One retailer's listing for one item. Prices are entered by hand from
 * `data/prices.json` (see `npm run prices:import`) and are never converted
 * between currencies — `currency` is always the retailer's own.
 */
export interface RetailerPrice {
  /** Key into `RETAILERS` in `retailers.ts` — display name and region live there. */
  retailerId: RetailerId;
  /** `null` until someone has checked this retailer by hand. */
  price: number | null;
  currency: Currency;
  /** ISO date (`YYYY-MM-DD`) the price was last checked, or `null` if never. */
  checkedAt: string | null;
  link: string;
}

export interface GearItem {
  id: string;
  category: GearCategory;
  brand: string;
  name: string;
  /** Remote image URL (Unsplash). Falls back to a generated gradient on error. */
  image: string;
  priceTier: BudgetTier;
  /** Free-form manufacturer specs, e.g. `{ waistWidth: 92, flex: '120', lengths: '165/172/177' }`. */
  specs: Record<string, string | number>;
  description: string;
  /** Static, editorial "who is this for" blurb. */
  matchReason: string;
  /** Simplified Chinese `description`. Falls back to English when missing. */
  descriptionZh?: string;
  /** Simplified Chinese `matchReason`. Falls back to English when missing. */
  matchReasonZh?: string;
  prices: RetailerPrice[];
  /** Normalized 0–10 scores across the six hexagon axes, derived from this item's specs. */
  performance: PerformanceProfile;

  /* -------- optional matching metadata (used by matcherLogic) -------- */
  /** Which discipline the item serves. `both` = shared hardgood/softgood. */
  activity?: Activity | 'both';
  /** Riding styles the item is designed around. */
  styles?: RidingStyle[];
  /** Ability levels the item suits. */
  levels?: Level[];
  /** Gendered fit; omit or include `unisex` for universal fit. */
  genders?: Gender[];
  /** Conditions the item is tuned for (apparel + optics). */
  temps?: Temperature[];
}

/* ------------------------------------------------------------------ */
/*  Performance profile (hexagon / radar chart)                        */
/* ------------------------------------------------------------------ */

/**
 * The six positional slots plotted on the gear performance hexagon. Every
 * `GearItem` fills all six, but what each slot *means* is category-dependent —
 * see `GEAR_CATEGORY_AXES` in `performanceProfile.ts` for the label mapping
 * (e.g. slot A is "Carving" for skis but "Flex" for boots).
 */
export type PerformanceAxis = 'axisA' | 'axisB' | 'axisC' | 'axisD' | 'axisE' | 'axisF';

/** Normalized 0–10 score per axis, derived from an item's real specs. */
export type PerformanceProfile = Record<PerformanceAxis, number>;

/* ------------------------------------------------------------------ */
/*  Calculated output                                                  */
/* ------------------------------------------------------------------ */

export interface NumericRange {
  min: number;
  max: number;
}

/** One line of the "show your work" derivation shown in the UI. */
export interface DerivationStep {
  label: string;
  delta: number;
  note: string;
}

export interface LengthCalculation {
  /** Final recommended length in cm. */
  value: number;
  /** Acceptable window around the ideal length. */
  range: NumericRange;
  steps: DerivationStep[];
  /** `Ski length` or `Board length`. */
  label: string;
}

/**
 * Language-neutral spec sheet. Captions and guidance text derived from it are
 * generated at render time in the current language (see `waistWidthLabel`,
 * `bootFlexLabel`, `lensGuidance`, `jacketGuidance` in `matcherLogic.ts`).
 */
export interface CalculatedSpecs {
  length: LengthCalculation;
  waistWidth: NumericRange;
  bootFlex: NumericRange;
  /** Estimated Mondopoint boot size, derived from height. */
  mondoSize: number;
  /** Recommended pole length in cm (skiers only). */
  poleLength: number | null;
  /** Target goggle Visible Light Transmission window, as a percentage. */
  vlt: NumericRange;
  /** Target jacket warmth on a 1–5 scale. */
  warmth: NumericRange;
  helmetSize: string;
  /** Estimated head circumference in cm (an estimate from height — always measure). */
  helmetCircumferenceCm: number;
}

/** One row of the "calculated for you" spec block on a gear card. */
export interface CalculatedSpecRow {
  label: string;
  value: string;
  highlight?: boolean;
}

/** One feature's contribution to a Compatibility Score — see `computeCompatibility` in `compatibilityScore.ts`. */
export interface FeatureContribution {
  key: string;
  label: string;
  /** Renormalized weight (0-1) this feature carries in the final score; every candidate's weights sum to 1. */
  weight: number;
  /** How well the item satisfies this feature, 0 (poor) to 1 (ideal). */
  fit: number;
}

/** One item ranked within a category, carrying its own Compatibility Score. */
export interface RankedCandidate {
  item: GearItem;
  /** 0–100% Compatibility Score against the rider's profile. */
  score: number;
  /** Per-feature breakdown behind `score`, most-influential first. */
  breakdown: FeatureContribution[];
}

export interface Recommendation {
  category: GearCategory;
  /** The top-ranked item — `candidates[0].item`. */
  item: GearItem;
  /** 0–100% Compatibility Score for `item`. */
  score: number;
  /** Every item in this category that survived hard filtering, sorted by Compatibility Score descending. */
  candidates: RankedCandidate[];
}

export interface MatchResult {
  stats: UserStats;
  specs: CalculatedSpecs;
  recommendations: Recommendation[];
  generatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Visualizer                                                         */
/* ------------------------------------------------------------------ */

export type BodyPart = 'head' | 'face' | 'torso' | 'base';

export interface HotspotDefinition {
  part: BodyPart;
  category: GearCategory;
  label: string;
  /** SVG coordinates within the 260 × 460 stickman viewBox. */
  x: number;
  y: number;
}

/* ------------------------------------------------------------------ */
/*  Saved setups (local vault)                                         */
/* ------------------------------------------------------------------ */

/**
 * Slim per-item snapshot stored with a saved setup — enough to render the vault list.
 * Prices are deliberately not snapshotted: the vault totals them live from the
 * current price data for the selected region, so a saved setup never shows a
 * stale or wrong-currency number.
 */
export interface SavedGearSummary {
  category: GearCategory;
  itemId: string;
  brand: string;
  name: string;
  image: string;
}

/** A user-named snapshot of a match result, persisted to `localStorage`. */
export interface SavedSetup {
  id: string;
  name: string;
  /** ISO timestamp. */
  timestamp: string;
  stats: UserStats;
  recommendations: SavedGearSummary[];
}
