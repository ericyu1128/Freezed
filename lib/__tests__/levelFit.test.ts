/**
 * Property test: ability level must actually steer the hardgoods.
 *
 * For every activity × gender × level × style × temperature × budget tier,
 * the top pick for skis/board, boots and bindings must be rated for the
 * rider's level or an adjacent one — whenever the catalogue has such an item
 * for that activity at all. (A beginner may get an intermediate ski; never a
 * race ski.)
 *
 * Against the old binary level fit + symmetric budget filter this failed for
 * 105 of 864 profiles (213 of 2592 profile × category checks), e.g. a
 * beginner/piste/premium skier got the Atomic Redster X9S race ski at 86%.
 * After the ordinal level fit, the re-weighted rows and the asymmetric
 * budget filter: 0 of 864.
 */

import { describe, expect, it } from 'vitest';
import gearDatabase from '../gearDatabase';
import { matchGear } from '../matcherLogic';
import type { GearCategory } from '../types';
import { allProfiles, LEVEL_CRITICAL, levelDistance, servesActivity } from './profiles';

interface Violation {
  profile: string;
  category: GearCategory;
  pick: string;
  pickLevels: string;
}

const findViolations = (): { violations: Violation[]; profiles: number; checks: number } => {
  const profiles = allProfiles();
  const violations: Violation[] = [];
  let checks = 0;

  for (const stats of profiles) {
    const result = matchGear(stats);
    for (const category of LEVEL_CRITICAL) {
      const adjacentExists = gearDatabase.some(
        (item) =>
          item.category === category &&
          servesActivity(item, stats.activity) &&
          levelDistance(item.levels, stats.level) <= 1,
      );
      if (!adjacentExists) continue;
      checks += 1;

      const pick = result.recommendations.find((rec) => rec.category === category)?.item;
      if (!pick || levelDistance(pick.levels, stats.level) > 1) {
        violations.push({
          profile: `${stats.activity}/${stats.gender}/${stats.level}/${stats.style}/${stats.temperature}/${stats.budgetTier}`,
          category,
          pick: pick ? pick.id : '(none)',
          pickLevels: pick?.levels?.join(',') ?? '—',
        });
      }
    }
  }
  return { violations, profiles: profiles.length, checks };
};

describe('ability level steers hardgoods', () => {
  it('every skis/boots/bindings top pick is within one level of the rider', () => {
    const { violations, profiles, checks } = findViolations();
    const violatingProfiles = new Set(violations.map((v) => v.profile)).size;
    console.log(
      `level-fit violations: ${violatingProfiles} of ${profiles} profiles ` +
        `(${violations.length} of ${checks} profile × category checks)`,
    );
    if (violations.length > 0) {
      console.log(violations.slice(0, 12).map((v) => `  ${v.profile} ${v.category}: ${v.pick} [${v.pickLevels}]`).join('\n'));
    }
    expect(violations).toEqual([]);
  });
});
