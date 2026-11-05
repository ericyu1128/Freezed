import { describe, expect, it } from 'vitest';
import { CATEGORY_WEIGHTS, levelFit } from '../compatibilityScore';
import gearDatabase from '../gearDatabase';
import { filterByBudget, matchGear } from '../matcherLogic';
import { allProfiles } from './profiles';

describe('levelFit', () => {
  it('scores by distance to the nearest supported level', () => {
    expect(levelFit(['beginner', 'intermediate'], 'beginner')).toBe(1);
    expect(levelFit(['intermediate', 'advanced'], 'beginner')).toBe(0.5);
    expect(levelFit(['advanced', 'expert'], 'beginner')).toBe(0.05);
    expect(levelFit(['expert'], 'beginner')).toBe(0.05);
    expect(levelFit(['beginner'], 'expert')).toBe(0.05);
  });
});

describe('CATEGORY_WEIGHTS', () => {
  it('every row sums to 1', () => {
    for (const [category, row] of Object.entries(CATEGORY_WEIGHTS)) {
      const sum = Object.values(row).reduce((total, weight) => total + weight, 0);
      expect(sum, category).toBeCloseTo(1, 10);
    }
  });

  it('level outweighs budget by enough that two levels off never beats one level off a tier away', () => {
    for (const category of ['skis', 'boots', 'bindings'] as const) {
      const { level, budget } = CATEGORY_WEIGHTS[category];
      expect(level, category).toBeGreaterThan(1.11 * budget);
    }
  });
});

describe('filterByBudget', () => {
  const skis = gearDatabase.filter((item) => item.category === 'skis' && item.activity === 'ski');
  const tiers = (items: typeof skis) => new Set(items.map((item) => item.priceTier));

  it('keeps cheaper tiers for a premium shopper', () => {
    expect(tiers(filterByBudget(skis, 'premium'))).toEqual(new Set(['budget', 'mid-range', 'premium']));
  });

  it('drops items more than one tier more expensive', () => {
    expect(tiers(filterByBudget(skis, 'budget'))).toEqual(new Set(['budget', 'mid-range']));
  });
});

describe('ranking ignores prices', () => {
  it('scrambling every price leaves every ranking unchanged', () => {
    const scrambled = gearDatabase.map((item, i) => ({
      ...item,
      prices: item.prices.map((price, j) => ({ ...price, price: ((i * 37 + j * 101) % 997) + 1, checkedAt: '2026-01-01' })),
    }));
    for (const stats of allProfiles().filter((_, i) => i % 7 === 0)) {
      const ids = (db: typeof gearDatabase) =>
        matchGear(stats, db).recommendations.map((rec) => rec.candidates.map((c) => `${c.item.id}:${c.score}`).join(','));
      expect(ids(scrambled)).toEqual(ids(gearDatabase));
    }
  });

  it('availability (found / not found at any shop) leaves every ranking unchanged', () => {
    const nowhere = gearDatabase.map((item) => ({
      ...item,
      prices: item.prices.map((price) => ({ ...price, match: 'not_found' as const, price: null, priceFrom: false })),
    }));
    const everywhere = gearDatabase.map((item, i) => ({
      ...item,
      prices: item.prices.map((price, j) => ({ ...price, match: 'found' as const, price: ((i * 13 + j * 7) % 500) + 1 })),
    }));
    for (const stats of allProfiles()) {
      const ids = (db: typeof gearDatabase) =>
        matchGear(stats, db).recommendations.map((rec) => rec.candidates.map((c) => `${c.item.id}:${c.score}`).join(','));
      expect(ids(nowhere)).toEqual(ids(gearDatabase));
      expect(ids(everywhere)).toEqual(ids(gearDatabase));
    }
  });
});
