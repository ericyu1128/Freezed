/**
 * Snapshot of the top pick per category for five reference riders. Any change
 * to weights, fits or catalogue data that moves a recommendation shows up
 * here as a reviewable diff.
 */

import { describe, expect, it } from 'vitest';
import { matchGear } from '../matcherLogic';
import type { UserStats } from '../types';

const PROFILES: Record<string, UserStats> = {
  'beginner budget skier': {
    activity: 'ski', gender: 'male', height: 178, weight: 78,
    level: 'beginner', style: 'piste', temperature: 'moderate', budgetTier: 'budget',
  },
  'beginner premium piste skier': {
    activity: 'ski', gender: 'male', height: 178, weight: 78,
    level: 'beginner', style: 'piste', temperature: 'moderate', budgetTier: 'premium',
  },
  'intermediate female snowboarder': {
    activity: 'snowboard', gender: 'female', height: 165, weight: 60,
    level: 'intermediate', style: 'all-mountain', temperature: 'moderate', budgetTier: 'mid-range',
  },
  'expert backcountry skier': {
    activity: 'ski', gender: 'male', height: 178, weight: 78,
    level: 'expert', style: 'backcountry', temperature: 'freezing', budgetTier: 'premium',
  },
  'advanced park skier': {
    activity: 'ski', gender: 'male', height: 178, weight: 78,
    level: 'advanced', style: 'freestyle', temperature: 'spring', budgetTier: 'mid-range',
  },
};

describe('top picks for reference riders', () => {
  for (const [name, stats] of Object.entries(PROFILES)) {
    it(name, () => {
      const { recommendations } = matchGear(stats);
      const picks = Object.fromEntries(
        recommendations.map((rec) => [rec.category, `${rec.item.id} (${rec.score}%)`]),
      );
      expect(picks).toMatchSnapshot();
    });
  }
});
