/** Shared test fixtures: every questionnaire combination, with a typical body per fit scale. */

import type {
  Activity,
  BudgetTier,
  GearCategory,
  GearItem,
  Gender,
  Level,
  RidingStyle,
  Temperature,
  UserStats,
} from '../types';

export const ACTIVITIES: Activity[] = ['ski', 'snowboard'];
export const GENDERS: Gender[] = ['male', 'female', 'unisex'];
export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced', 'expert'];
export const STYLES: RidingStyle[] = ['piste', 'all-mountain', 'freestyle', 'backcountry'];
export const TEMPERATURES: Temperature[] = ['freezing', 'moderate', 'spring'];
export const BUDGETS: BudgetTier[] = ['budget', 'mid-range', 'premium'];
export const LEVEL_CRITICAL: GearCategory[] = ['skis', 'boots', 'bindings'];

/** A typical body per fit scale. Height/weight only move length, never which item wins on level. */
export const BODY: Record<Gender, Pick<UserStats, 'height' | 'weight'>> = {
  male: { height: 178, weight: 78 },
  female: { height: 165, weight: 60 },
  unisex: { height: 172, weight: 70 },
};

export const levelDistance = (levels: Level[] | undefined, level: Level): number =>
  levels && levels.length > 0
    ? Math.min(...levels.map((candidate) => Math.abs(LEVELS.indexOf(candidate) - LEVELS.indexOf(level))))
    : Number.POSITIVE_INFINITY;

export const servesActivity = (item: GearItem, activity: Activity) =>
  !item.activity || item.activity === 'both' || item.activity === activity;

export const allProfiles = (): UserStats[] =>
  ACTIVITIES.flatMap((activity) =>
    GENDERS.flatMap((gender) =>
      LEVELS.flatMap((level) =>
        STYLES.flatMap((style) =>
          TEMPERATURES.flatMap((temperature) =>
            BUDGETS.map((budgetTier) => ({ activity, gender, level, style, temperature, budgetTier, ...BODY[gender] })),
          ),
        ),
      ),
    ),
  );
