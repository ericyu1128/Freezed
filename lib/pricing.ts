/**
 * Freezed — region-aware price helpers
 * Made by Eric Yu
 *
 * Pure functions over the hand-checked prices in `data/prices.json`. Two
 * rules hold everywhere:
 *
 *   1. Currencies are never converted. A region shows only its own retailers,
 *      in their own currency, always labelled.
 *   2. Unchecked prices (`price: null`) are never counted — not in a best
 *      price, not in a kit total. Totals report how many items were priced.
 *
 * Ranking never reads anything in this file; budget fit uses `priceTier`.
 */

import { getRetailer, REGION_CURRENCY, type Currency, type Region } from './retailers';
import type { GearItem, RetailerPrice } from './types';

export type PricedRetailerPrice = RetailerPrice & { price: number };

export const isPriced = (price: RetailerPrice): price is PricedRetailerPrice => price.price !== null;

/** This item's listings at the selected region's retailers, in registry order. */
export const pricesForRegion = (item: GearItem, region: Region): RetailerPrice[] =>
  item.prices.filter((price) => getRetailer(price.retailerId).region === region);

/** Cheapest priced listing, or `null` when nothing in `prices` has been priced yet. */
export const cheapest = (prices: RetailerPrice[]): PricedRetailerPrice | null =>
  prices
    .filter(isPriced)
    .reduce<PricedRetailerPrice | null>((best, current) => (best === null || current.price < best.price ? current : best), null);

export const bestPriceFor = (item: GearItem, region: Region): PricedRetailerPrice | null =>
  cheapest(pricesForRegion(item, region));

/**
 * The link a "View deal" / "Check price" control should open: the cheapest
 * priced retailer in the region, else the region's first retailer so an
 * unpriced item still links somewhere useful.
 */
export const primaryLinkFor = (item: GearItem, region: Region): RetailerPrice | null =>
  bestPriceFor(item, region) ?? pricesForRegion(item, region)[0] ?? null;

/** Priced listings cheapest-first, then unpriced ones in registry order. */
export const sortForDisplay = (prices: RetailerPrice[]): RetailerPrice[] => [
  ...prices.filter(isPriced).sort((a, b) => a.price - b.price),
  ...prices.filter((price) => !isPriced(price)),
];

export interface KitTotal {
  /** Sum of the best price of every priced item; `0` when none are priced. */
  total: number;
  currency: Currency;
  /** How many of `count` items had at least one price in the region. */
  priced: number;
  count: number;
}

export const kitTotal = (items: GearItem[], region: Region): KitTotal =>
  items.reduce<KitTotal>(
    (kit, item) => {
      const best = bestPriceFor(item, region);
      return best === null ? kit : { ...kit, total: kit.total + best.price, priced: kit.priced + 1 };
    },
    { total: 0, currency: REGION_CURRENCY[region], priced: 0, count: items.length },
  );

const AMOUNT = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** `1049.99` → `$1,049.99`. Only for layouts that render the currency code right next to it. */
export const formatAmount = (amount: number): string => `$${AMOUNT.format(amount)}`;

/** `549.99, 'CAD'` → `$549.99 CAD`. Always labelled, never converted. */
export const formatPrice = (amount: number, currency: Currency): string => `${formatAmount(amount)} ${currency}`;

/** Formats a `YYYY-MM-DD` check date for display. Read as UTC so it never shifts a day. */
export const formatCheckedDate = (isoDate: string, language: 'en' | 'zh'): string => {
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-CA', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
