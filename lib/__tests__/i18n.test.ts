import { describe, expect, it } from 'vitest';
import { featureLabel } from '../compatibilityScore';
import gearDatabase from '../gearDatabase';
import { itemDescription, itemMatchReason } from '../i18n/gearCopy';
import {
  bootFlexLabel,
  buildCalculatedSpecs,
  buildReasonBullets,
  buildReasoning,
  jacketGuidance,
  lensGuidance,
  matchGear,
  waistWidthLabel,
} from '../matcherLogic';
import { allProfiles } from './profiles';

const CJK = /[一-鿿]/;

describe('Chinese results', () => {
  it('every catalogue item has zh description and match reason', () => {
    const missing = gearDatabase.filter((item) => !item.descriptionZh || !item.matchReasonZh).map((item) => item.id);
    expect(missing).toEqual([]);
  });

  it('falls back to English when a zh field is missing', () => {
    const item = { ...gearDatabase[0], descriptionZh: undefined, matchReasonZh: undefined };
    expect(itemDescription(item, 'zh')).toBe(item.description);
    expect(itemMatchReason(item, 'zh')).toBe(item.matchReason);
  });

  it('generates Chinese reasoning, bullets, spec rows and breakdown labels for every top pick', () => {
    for (const stats of allProfiles().filter((_, i) => i % 11 === 0)) {
      const { specs, recommendations } = matchGear(stats);
      expect(waistWidthLabel(stats, 'zh')).toMatch(CJK);
      expect(bootFlexLabel(stats, 'zh')).toMatch(CJK);
      expect(lensGuidance(stats.temperature, 'zh')).toMatch(CJK);
      expect(jacketGuidance(stats.temperature, 'zh')).toMatch(CJK);
      for (const rec of recommendations) {
        expect(buildReasoning(rec.item, stats, specs, 'zh')).toMatch(CJK);
        for (const bullet of buildReasonBullets(rec.item, stats, specs, 'zh')) expect(bullet).toMatch(CJK);
        for (const row of buildCalculatedSpecs(rec.item, stats, specs, 'zh')) expect(row.label).toMatch(CJK);
        for (const feature of rec.candidates[0].breakdown) {
          expect(featureLabel(feature.key, rec.category, 'zh')).toMatch(CJK);
        }
      }
    }
  });

  it('only the top pick is called the strongest match', () => {
    const stats = allProfiles()[0];
    const { specs, recommendations } = matchGear(stats);
    const skis = recommendations.find((rec) => rec.category === 'skis');
    expect(skis).toBeDefined();
    const [first, second] = skis!.candidates;
    expect(buildReasoning(first.item, stats, specs, 'en', 1)).toContain('strongest hardgood match');
    expect(buildReasoning(second.item, stats, specs, 'en', 2)).toContain('ranks #2');
  });
});
