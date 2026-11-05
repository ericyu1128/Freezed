/**
 * Items the catalogue audit marks discontinued or nonexistent stay in the
 * catalogue with `hidden: true` and must never reach a rider.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import gearDatabase, { matchableGear } from '../gearDatabase';
import { matchGear } from '../matcherLogic';
import { allProfiles } from './profiles';

/** Ids from the audit's replacement table, e.g. "| K2 Method 100 MV (`boot-k2-method-100`) | not found | …". */
const auditFlaggedIds = (): string[] => {
  const audit = readFileSync(path.resolve(__dirname, '../../docs/catalogue-audit.md'), 'utf8');
  return Array.from(audit.matchAll(/\(`([a-z0-9-]+)`\) \| (?:not found|discontinued) \|/g), (match) => match[1]);
};

const hiddenIds = gearDatabase.filter((item) => item.hidden).map((item) => item.id);

const candidateIds = (database = gearDatabase): Set<string> =>
  new Set(
    allProfiles().flatMap((stats) =>
      matchGear(stats, database).recommendations.flatMap((rec) => rec.candidates.map((c) => c.item.id)),
    ),
  );

describe('hidden items', () => {
  it('every item the audit marks discontinued or nonexistent is hidden, and nothing else', () => {
    const flagged = auditFlaggedIds();
    expect(flagged.length).toBeGreaterThan(0);
    expect([...hiddenIds].sort()).toEqual([...flagged].sort());
  });

  it('no hidden item is ever a candidate, for any of the 864 profiles', () => {
    const seen = candidateIds();
    expect(hiddenIds.filter((id) => seen.has(id))).toEqual([]);
  });

  it('the filter is what keeps them out (unhidden, some would rank)', () => {
    const seen = candidateIds(gearDatabase.map((item) => ({ ...item, hidden: false })));
    expect(hiddenIds.some((id) => seen.has(id))).toBe(true);
  });

  it('matchableGear is the catalogue minus hidden items', () => {
    expect(matchableGear.length).toBe(gearDatabase.length - hiddenIds.length);
    expect(matchableGear.some((item) => item.hidden)).toBe(false);
  });
});
