/**
 * npm run prices:import [-- path/to/file.csv] [-- --dry-run]
 *
 * Validates a filled-in price CSV (default: data/prices-template.csv) and
 * writes data/prices.json. Nothing is written if any row fails validation.
 *
 * Rules:
 * - itemId and retailerId must exist; region and currency must match the
 *   retailer. Prices are never converted between currencies.
 * - price: blank (unchecked) or a positive number with at most 2 decimals.
 *   A leading "$" and thousands commas are tolerated.
 * - priceFrom: blank/no or yes — the price is the lowest of a range (by size
 *   or colourway) and shows as "from". Needs a price.
 * - checkedAt: blank or an ISO date (YYYY-MM-DD), not in the future.
 *   A price without a checkedAt is rejected.
 * - sourceUrl: blank or the https product page the price was read from, on
 *   the retailer's own storefront. Links point there instead of a search.
 * - url: generated link, for clicking through; ignored on import.
 * - Rows missing from the CSV keep whatever data/prices.json already had.
 *
 * Prints a report: priced, "from" prices, product links, missing, and checked
 * more than 14 days ago.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import gearDatabase, { type PriceTable } from '../lib/gearDatabase';
import {
  getRetailer,
  isRetailerId,
  isRetailerUrl,
  RETAILER_IDS,
  type Region,
  type RetailerId,
} from '../lib/retailers';
import {
  COLUMNS,
  PRICES_JSON_PATH,
  ROOT,
  STALE_AFTER_DAYS,
  TEMPLATE_PATH,
  daysBetween,
  parseCsv,
  todayIso,
  type Column,
} from './pricesCsv';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const csvPath = path.resolve(args.find((arg) => !arg.startsWith('--')) ?? TEMPLATE_PATH);
const rel = (file: string) => {
  const relative = path.relative(ROOT, file);
  return relative && !relative.startsWith('..') ? relative : file;
};

if (!existsSync(csvPath)) {
  console.error(`No CSV at ${rel(csvPath)}. Run "npm run prices:template" first.`);
  process.exit(1);
}

const errors: string[] = [];
const warnings: string[] = [];
const fail = (line: number, message: string) => errors.push(`line ${line}: ${message}`);

/* ---------------------------------------------------------------- */
/*  Parse + header                                                    */
/* ---------------------------------------------------------------- */

const records = parseCsv(readFileSync(csvPath, 'utf8'));
if (records.length === 0) {
  console.error(`${rel(csvPath)} is empty.`);
  process.exit(1);
}

const header = records[0].fields.map((value) => value.trim());
const missingColumns = COLUMNS.filter((column) => !header.includes(column));
if (missingColumns.length > 0) {
  console.error(`Header is missing column(s): ${missingColumns.join(', ')}.\nExpected: ${COLUMNS.join(',')}`);
  process.exit(1);
}
const columnIndex = Object.fromEntries(COLUMNS.map((column) => [column, header.indexOf(column)])) as Record<
  Column,
  number
>;

/* ---------------------------------------------------------------- */
/*  Row validation                                                    */
/* ---------------------------------------------------------------- */

const itemsById = new Map(gearDatabase.map((item) => [item.id, item]));
const today = todayIso();

const parsePrice = (raw: string, line: number): number | null | undefined => {
  const value = raw.trim();
  if (value === '') return null;
  const cleaned = value.replace(/^\$/, '').replace(/,(?=\d{3}(\D|$))/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    fail(line, `price "${value}" is not a number like 549.99 (no currency code, at most 2 decimals)`);
    return undefined;
  }
  const price = Number(cleaned);
  if (!(price > 0) || price >= 20_000) {
    fail(line, `price ${value} is outside the plausible range (0, 20000)`);
    return undefined;
  }
  return price;
};

const parseCheckedAt = (raw: string, line: number): string | null | undefined => {
  const value = raw.trim();
  if (value === '') return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/);
  if (!match) {
    fail(
      line,
      `checkedAt "${value}" is not an ISO date (YYYY-MM-DD). If your spreadsheet reformatted it, set the column to plain text.`,
    );
    return undefined;
  }
  const iso = `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== iso) {
    fail(line, `checkedAt "${value}" is not a real calendar date`);
    return undefined;
  }
  if (daysBetween(today, iso) > 1) {
    fail(line, `checkedAt ${iso} is in the future (today is ${today})`);
    return undefined;
  }
  return iso;
};

const parsePriceFrom = (raw: string, line: number): boolean | undefined => {
  const value = raw.trim();
  if (/^(|no|n|false|0)$/i.test(value)) return false;
  if (/^(yes|y|true|1|from)$/i.test(value)) return true;
  fail(line, `priceFrom "${value}" should be "yes" (lowest of a range) or blank`);
  return undefined;
};

const parseSourceUrl = (raw: string, retailerId: RetailerId, line: number): string | null | undefined => {
  const value = raw.trim();
  if (value === '') return null;
  if (!isRetailerUrl(retailerId, value)) {
    fail(line, `sourceUrl "${value}" is not an https page on ${getRetailer(retailerId).name}'s own site`);
    return undefined;
  }
  return value;
};

type Cell = { price: number | null; priceFrom: boolean; checkedAt: string | null; sourceUrl: string | null };
const imported = new Map<string, Cell & { line: number }>();
const key = (itemId: string, retailerId: RetailerId) => `${itemId}\u0000${retailerId}`;

for (const record of records.slice(1)) {
  const { line, fields } = record;
  const cell = (column: Column) => (fields[columnIndex[column]] ?? '').trim();

  const itemId = cell('itemId');
  const retailerId = cell('retailerId');
  const item = itemsById.get(itemId);
  if (!item) {
    fail(line, `unknown itemId "${itemId}" (regenerate the template if the catalogue changed)`);
    continue;
  }
  if (!isRetailerId(retailerId)) {
    fail(line, `unknown retailerId "${retailerId}" (expected one of ${RETAILER_IDS.join(', ')})`);
    continue;
  }
  const retailer = getRetailer(retailerId);
  if (cell('region') !== retailer.region) {
    fail(line, `region "${cell('region')}" does not match ${retailerId} (${retailer.region})`);
  }
  if (cell('currency') !== retailer.currency) {
    fail(
      line,
      `currency "${cell('currency')}" does not match ${retailerId} (${retailer.currency}). ` +
        `Enter the price in the retailer's own currency — Freezed never converts.`,
    );
  }
  if (cell('brand') !== item.brand || cell('name') !== item.name) {
    warnings.push(
      `line ${line}: brand/name "${cell('brand')} ${cell('name')}" differs from catalogue "${item.brand} ${item.name}" for ${itemId} — using itemId`,
    );
  }
  const listing = item.prices.find((entry) => entry.retailerId === retailerId);
  if (cell('url') && listing && cell('url') !== listing.link) {
    warnings.push(`line ${line}: url column is ignored — put a product page in sourceUrl instead`);
  }

  const price = parsePrice(cell('price'), line);
  const priceFrom = parsePriceFrom(cell('priceFrom'), line);
  const checkedAt = parseCheckedAt(cell('checkedAt'), line);
  const sourceUrl = parseSourceUrl(cell('sourceUrl'), retailerId, line);
  if (price === undefined || priceFrom === undefined || checkedAt === undefined || sourceUrl === undefined) continue;
  if (price !== null && checkedAt === null) {
    fail(line, `price ${price} has no checkedAt date — every price must say when it was checked`);
    continue;
  }
  if (priceFrom && price === null) {
    fail(line, `priceFrom is set but there is no price`);
    continue;
  }

  const id = key(itemId, retailerId);
  const duplicate = imported.get(id);
  if (duplicate) {
    fail(line, `duplicate row for ${itemId} @ ${retailerId} (first seen on line ${duplicate.line})`);
    continue;
  }
  imported.set(id, { price, priceFrom, checkedAt, sourceUrl, line });
}

if (errors.length > 0) {
  console.error(`\n${errors.length} problem(s) in ${rel(csvPath)} — nothing was written:\n`);
  for (const error of errors.slice(0, 50)) console.error(`  ✗ ${error}`);
  if (errors.length > 50) console.error(`  … and ${errors.length - 50} more`);
  process.exit(1);
}

/* ---------------------------------------------------------------- */
/*  Merge + write                                                     */
/* ---------------------------------------------------------------- */

const existing: PriceTable = existsSync(PRICES_JSON_PATH)
  ? (JSON.parse(readFileSync(PRICES_JSON_PATH, 'utf8')) as PriceTable)
  : {};

const table: PriceTable = {};
let keptFromExisting = 0;
const stale: string[] = [];
const counts = { rows: 0, priced: 0, from: 0, linked: 0, missing: 0 };
const pricedByRegion: Record<Region, number> = { CA: 0, US: 0 };

for (const item of gearDatabase) {
  table[item.id] = {};
  for (const retailerId of RETAILER_IDS) {
    let cell: Cell | undefined = imported.get(key(item.id, retailerId));
    if (!cell) {
      const previous = existing[item.id]?.[retailerId];
      cell = {
        price: previous?.price ?? null,
        priceFrom: previous?.priceFrom === true,
        checkedAt: previous?.checkedAt ?? null,
        sourceUrl: previous?.sourceUrl ?? null,
      };
      keptFromExisting += 1;
    }
    table[item.id][retailerId] = {
      price: cell.price,
      priceFrom: cell.priceFrom,
      checkedAt: cell.checkedAt,
      sourceUrl: cell.sourceUrl,
    };

    counts.rows += 1;
    if (cell.sourceUrl) counts.linked += 1;
    if (cell.price === null) {
      counts.missing += 1;
    } else {
      counts.priced += 1;
      if (cell.priceFrom) counts.from += 1;
      pricedByRegion[getRetailer(retailerId).region] += 1;
    }
    if (cell.checkedAt && daysBetween(cell.checkedAt, today) > STALE_AFTER_DAYS) {
      stale.push(
        `${item.id} @ ${retailerId} — checked ${cell.checkedAt} (${daysBetween(cell.checkedAt, today)} days ago)`,
      );
    }
  }
}

/** One line per item × retailer, so a re-check shows up as a one-line diff. */
const serialize = (data: PriceTable): string =>
  `{\n${Object.entries(data)
    .map(
      ([itemId, byRetailer]) =>
        `  ${JSON.stringify(itemId)}: {\n${Object.entries(byRetailer)
          .map(
            ([retailerId, cell]) =>
              `    ${JSON.stringify(retailerId)}: { "price": ${JSON.stringify(cell.price)}, "priceFrom": ${JSON.stringify(cell.priceFrom ?? false)}, "checkedAt": ${JSON.stringify(cell.checkedAt)}, "sourceUrl": ${JSON.stringify(cell.sourceUrl ?? null)} }`,
          )
          .join(',\n')}\n  }`,
    )
    .join(',\n')}\n}\n`;

if (!dryRun) writeFileSync(PRICES_JSON_PATH, serialize(table), 'utf8');

/* ---------------------------------------------------------------- */
/*  Report                                                            */
/* ---------------------------------------------------------------- */

const pad = (label: string) => label.padEnd(10);
console.log(
  `\n${dryRun ? '[dry run] Validated' : 'Imported'} ${rel(csvPath)}${dryRun ? '' : ` → ${rel(PRICES_JSON_PATH)}`}\n`,
);
console.log(`  ${pad('Rows')}${counts.rows} (${gearDatabase.length} items × ${RETAILER_IDS.length} retailers)`);
console.log(`  ${pad('Priced')}${counts.priced} (CA ${pricedByRegion.CA} · US ${pricedByRegion.US})`);
console.log(`  ${pad('From')}${counts.from} (lowest of a size/colourway range)`);
console.log(`  ${pad('Linked')}${counts.linked} (link to the checked product page)`);
console.log(`  ${pad('Missing')}${counts.missing} (no price yet)`);
console.log(`  ${pad('Stale')}${stale.length} (checked more than ${STALE_AFTER_DAYS} days ago)`);
for (const entry of stale.slice(0, 40)) console.log(`    - ${entry}`);
if (stale.length > 40) console.log(`    … and ${stale.length - 40} more`);
if (keptFromExisting > 0 && imported.size > 0) {
  console.log(`\n  ${keptFromExisting} item × retailer row(s) were not in the CSV and kept their existing value.`);
}
if (warnings.length > 0) {
  console.log(`\n  ${warnings.length} warning(s):`);
  for (const warning of warnings.slice(0, 20)) console.log(`    ! ${warning}`);
  if (warnings.length > 20) console.log(`    … and ${warnings.length - 20} more`);
}
console.log('');
