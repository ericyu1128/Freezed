/**
 * Freezed — core domain types
 * Made by Eric Yu
 */

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

export type GearCategory = 'skis' | 'boots' | 'helmet' | 'goggles' | 'jacket';

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

export interface RetailerPrice {
  retailer: string;
  price: number;
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

/** The six axes plotted on the gear performance hexagon. */
export type PerformanceAxis =
  | 'carving'
  | 'powderFloat'
  | 'playfulness'
  | 'stability'
  | 'versatility'
  | 'accessibility';

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

export interface CalculatedSpecs {
  length: LengthCalculation;
  waistWidth: NumericRange;
  waistWidthLabel: string;
  bootFlex: NumericRange;
  bootFlexLabel: string;
  /** Estimated Mondopoint boot size, derived from height. */
  mondoSize: number;
  /** Recommended pole length in cm (skiers only). */
  poleLength: number | null;
  /** Target goggle Visible Light Transmission window, as a percentage. */
  vlt: NumericRange;
  lensGuidance: string;
  /** Target jacket warmth on a 1–5 scale. */
  warmth: NumericRange;
  jacketGuidance: string;
  helmetSize: string;
  helmetCircumference: string;
}

export interface Recommendation {
  category: GearCategory;
  item: GearItem;
  /** 0–100 confidence that the item fits the rider. */
  score: number;
  /** Dynamic, user-specific specs surfaced on the card. */
  calculatedSpecs: { label: string; value: string; highlight?: boolean }[];
  /** Generated "why this matches you" narrative. */
  reasoning: string;
  /** Short bullet justifications. */
  reasonBullets: string[];
  /** Cheapest retailer price found. */
  bestPrice: RetailerPrice;
  /** Runner-up items in the same category. */
  alternates: GearItem[];
}

export interface MatchResult {
  stats: UserStats;
  specs: CalculatedSpecs;
  recommendations: Recommendation[];
  /** Sum of the cheapest price for every recommended item. */
  totalBestPrice: number;
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

/** Slim per-item snapshot stored with a saved setup — enough to render the vault list. */
export interface SavedGearSummary {
  category: GearCategory;
  itemId: string;
  brand: string;
  name: string;
  image: string;
  bestPrice: number;
  retailer: string;
}

/** A user-named snapshot of a match result, persisted to `localStorage`. */
export interface SavedSetup {
  id: string;
  name: string;
  /** ISO timestamp. */
  timestamp: string;
  stats: UserStats;
  recommendations: SavedGearSummary[];
  totalBestPrice: number;
}
