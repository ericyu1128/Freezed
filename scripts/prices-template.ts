/**
 * npm run prices:template [-- --force]
 *
 * Writes data/prices-template.csv: one row per catalogue item × retailer, with
 * the retailer search URL prefilled so each row can be clicked and checked.
 * Any price already in data/prices.json is prefilled too, so re-running after
 * an import gives you the current data back to update.
 *
 * Refuses to overwrite an existing CSV (which may hold unsaved work) unless
 * --force is passed.
 */

import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import gearDatabase from '../lib/gearDatabase';
import { getRetailer } from '../lib/retailers';
import { COLUMNS, ROOT, TEMPLATE_PATH, toCsv } from './pricesCsv';

const force = process.argv.includes('--force');
const relative = path.relative(ROOT, TEMPLATE_PATH);

if (existsSync(TEMPLATE_PATH) && !force) {
  console.error(
    `${relative} already exists and may contain prices you haven't imported yet.\n` +
      `Run "npm run prices:import" first, or "npm run prices:template -- --force" to overwrite it.`,
  );
  process.exit(1);
}

const rows: string[][] = [[...COLUMNS]];
for (const item of gearDatabase) {
  for (const listing of item.prices) {
    const retailer = getRetailer(listing.retailerId);
    rows.push([
      item.id,
      item.brand,
      item.name,
      retailer.id,
      retailer.region,
      retailer.currency,
      listing.price === null ? '' : listing.price.toFixed(2),
      listing.checkedAt ?? '',
      listing.link,
    ]);
  }
}

writeFileSync(TEMPLATE_PATH, toCsv(rows), 'utf8');

const retailerCount = gearDatabase[0]?.prices.length ?? 0;
console.log(
  `Wrote ${relative}: ${rows.length - 1} rows (${gearDatabase.length} items × ${retailerCount} retailers).\n` +
    `Fill in "price" (number, no currency symbol) and "checkedAt" (YYYY-MM-DD) for each row you check,\n` +
    `leave both blank for rows you haven't checked, then run "npm run prices:import".`,
);
