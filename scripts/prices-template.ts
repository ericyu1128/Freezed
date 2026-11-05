/**
 * npm run prices:template [-- --force]
 *
 * Writes data/prices-template.csv: one row per catalogue item × retailer, with
 * the row's link prefilled (the checked product page, else the retailer
 * search URL) so each row can be clicked and checked. Any price, "from" flag
 * and source URL already in data/prices.json is prefilled too, so re-running
 * after an import gives you the current data back to update.
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
      listing.match ?? '',
      listing.price === null ? '' : listing.price.toFixed(2),
      listing.priceFrom ? 'yes' : '',
      listing.checkedAt ?? '',
      listing.sourceUrl ?? '',
      listing.link,
    ]);
  }
}

writeFileSync(TEMPLATE_PATH, toCsv(rows), 'utf8');

const retailerCount = gearDatabase[0]?.prices.length ?? 0;
console.log(
  `Wrote ${relative}: ${rows.length - 1} rows (${gearDatabase.length} items × ${retailerCount} retailers).\n` +
    `For each row you check, set "match" (found / ambiguous / not_found) and "checkedAt" (YYYY-MM-DD);\n` +
    `for found rows also "price" (number, no currency symbol) and "sourceUrl" (the product page),\n` +
    `and "priceFrom" = yes when the price is the lowest of a size/colour range.\n` +
    `Leave them blank for rows you haven't checked, then run "npm run prices:import".`,
);
