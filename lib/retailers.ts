/**
 * Freezed — retailer registry
 * Made by Eric Yu
 *
 * Single source of truth for every store Freezed links to: id, display name,
 * region, native currency and search-URL pattern. Nothing else in the app
 * hard-codes a retailer name or URL.
 *
 * Links are live search queries on each retailer's own site rather than
 * stored product URLs, so nothing rots into a dead product page. Every
 * pattern below was checked by hand in a browser on 2026-11-04 and returned
 * real results:
 *
 *   evo-ca           evo.com/en-ca/search?q=…            (prices in CAD)
 *   sportchek        sportchek.ca/en/search-results.html?q=…
 *   sportinglife     sportinglife.ca/en-CA/search?q=…
 *   altitude-sports  altitude-sports.com/search?query=…
 *   mec              mec.ca/en/search?q=…
 *   evo              evo.com/search?q=…                  (`/shop?text=` lands on the home page)
 *   rei              rei.com/search?q=…
 *   backcountry      backcountry.com/search?q=…
 *   the-house        the-house.com/search?query=…        (`?q=` only works via redirect)
 */

export type Region = 'CA' | 'US';

export type Currency = 'CAD' | 'USD';

export const REGION_CURRENCY: Record<Region, Currency> = { CA: 'CAD', US: 'USD' };

export const RETAILER_IDS = [
  'evo-ca',
  'sportchek',
  'sportinglife',
  'altitude-sports',
  'mec',
  'evo',
  'rei',
  'backcountry',
  'the-house',
] as const;

export type RetailerId = (typeof RETAILER_IDS)[number];

export interface Retailer {
  id: RetailerId;
  name: string;
  region: Region;
  currency: Currency;
  /** Search endpoint for an already URI-encoded query. */
  searchUrl: (encodedQuery: string) => string;
}

export const RETAILERS: Record<RetailerId, Retailer> = {
  'evo-ca': {
    id: 'evo-ca',
    name: 'Evo Canada',
    region: 'CA',
    currency: 'CAD',
    searchUrl: (q) => `https://www.evo.com/en-ca/search?q=${q}`,
  },
  sportchek: {
    id: 'sportchek',
    name: 'Sport Chek',
    region: 'CA',
    currency: 'CAD',
    searchUrl: (q) => `https://www.sportchek.ca/en/search-results.html?q=${q}`,
  },
  sportinglife: {
    id: 'sportinglife',
    name: 'Sporting Life',
    region: 'CA',
    currency: 'CAD',
    searchUrl: (q) => `https://www.sportinglife.ca/en-CA/search?q=${q}`,
  },
  'altitude-sports': {
    id: 'altitude-sports',
    name: 'Altitude Sports',
    region: 'CA',
    currency: 'CAD',
    searchUrl: (q) => `https://www.altitude-sports.com/search?query=${q}`,
  },
  mec: {
    id: 'mec',
    name: 'MEC',
    region: 'CA',
    currency: 'CAD',
    searchUrl: (q) => `https://www.mec.ca/en/search?q=${q}`,
  },
  evo: {
    id: 'evo',
    name: 'Evo',
    region: 'US',
    currency: 'USD',
    searchUrl: (q) => `https://www.evo.com/search?q=${q}`,
  },
  rei: {
    id: 'rei',
    name: 'REI',
    region: 'US',
    currency: 'USD',
    searchUrl: (q) => `https://www.rei.com/search?q=${q}`,
  },
  backcountry: {
    id: 'backcountry',
    name: 'Backcountry',
    region: 'US',
    currency: 'USD',
    searchUrl: (q) => `https://www.backcountry.com/search?q=${q}`,
  },
  'the-house': {
    id: 'the-house',
    name: 'The House',
    region: 'US',
    currency: 'USD',
    searchUrl: (q) => `https://www.the-house.com/search?query=${q}`,
  },
};

export const isRetailerId = (value: string): value is RetailerId =>
  (RETAILER_IDS as readonly string[]).includes(value);

export const getRetailer = (id: RetailerId): Retailer => RETAILERS[id];

/** Retailers serving one region, in registry order. */
export const retailersForRegion = (region: Region): Retailer[] =>
  RETAILER_IDS.map((id) => RETAILERS[id]).filter((retailer) => retailer.region === region);

/**
 * Whether retailer links render at all. Set `NEXT_PUBLIC_SHOW_RETAILER_LINKS=false`
 * to hide every outbound link; unset (or anything else) shows them.
 */
export const SHOW_RETAILER_LINKS = !/^(false|0|off|no)$/i.test(
  (process.env.NEXT_PUBLIC_SHOW_RETAILER_LINKS ?? 'true').trim(),
);

/**
 * Turn a brand + product name into a retailer-friendly query.
 *
 * - Strips diacritics so `Völkl` matches `Volkl`
 * - Drops apostrophes so `Arc'teryx` matches `Arcteryx`
 * - Removes em/en-dash suffixes — `I/O MAG — ChromaPop Storm Rose` searches as
 *   `I/O MAG`, since colourway names rarely match a retailer's index
 * - Removes square brackets so Burton's `[ak]` collection reads as `ak`
 * - Leaves hyphens intact: `GORE-TEX` and `Step-On` are real product tokens
 */
export const toSearchTerm = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Völkl -> Volkl
    .replace(/[‘’']/g, '') // Arc'teryx -> Arcteryx
    .replace(/\s*[–—]\s.*$/, '') // drop “— ChromaPop Storm Rose” suffixes
    .replace(/[[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Plain live-search URL for one retailer and one product. */
export const buildSearchUrl = (retailerId: RetailerId, query: string): string =>
  RETAILERS[retailerId].searchUrl(encodeURIComponent(toSearchTerm(query)));

/**
 * The ONE function every outbound retailer link goes through. Returns the
 * plain search URL today.
 */
export const buildRetailerUrl = (retailerId: RetailerId, query: string): string => {
  const url = buildSearchUrl(retailerId, query);
  // AFFILIATE: wrap `url` in the retailer's affiliate deep link here (e.g. an
  // AvantLink / Impact redirect keyed by `retailerId`) once each program is approved.
  return url;
};
