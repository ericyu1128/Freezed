import { describe, expect, it } from 'vitest';
import gearDatabase from '../gearDatabase';
import { bestPriceFor, fallbackFor, kitTotal, primaryLinkFor, visiblePrices, withFrom } from '../pricing';
import { buildRetailerUrl, buildSearchUrl, getRetailer, isRetailerUrl } from '../retailers';

describe('retailer links', () => {
  it('only accepts https pages on the retailer’s own storefront', () => {
    expect(isRetailerUrl('evo-ca', 'https://www.evo.com/en-ca/products/106396-oakley-line-miner-l-goggles')).toBe(true);
    expect(isRetailerUrl('evo-ca', 'https://www.evo.com/products/106396-oakley-line-miner-l-goggles')).toBe(false);
    expect(isRetailerUrl('evo', 'https://www.evo.com/en-ca/products/106396-oakley-line-miner-l-goggles')).toBe(false);
    expect(isRetailerUrl('altitude-sports', 'https://www.altitude-sports.com/p/smith-optics-squad-ski-goggles')).toBe(true);
    expect(isRetailerUrl('sportchek', 'http://www.sportchek.ca/en/pdp/x.html')).toBe(false);
    expect(isRetailerUrl('mec', 'https://www.sportchek.ca/en/pdp/x.html')).toBe(false);
    expect(isRetailerUrl('mec', 'not a url')).toBe(false);
  });

  it('links to the checked product page, else to a search', () => {
    const page = 'https://www.mec.ca/en/product/6040-609/arcteryx-sabre-jacket-mens';
    expect(buildRetailerUrl('mec', "Arc'teryx Sabre Jacket", page)).toBe(page);
    expect(buildRetailerUrl('mec', "Arc'teryx Sabre Jacket", null)).toBe(buildSearchUrl('mec', "Arc'teryx Sabre Jacket"));
    expect(buildRetailerUrl('evo-ca', 'Oakley MOD3', 'https://www.evo.com/products/1-x')).toBe(
      buildSearchUrl('evo-ca', 'Oakley MOD3'),
    );
  });
});

describe('price data', () => {
  const listings = gearDatabase.flatMap((item) => item.prices.map((price) => ({ item, price })));

  it('every price has a check date and its link is the source page when there is one', () => {
    for (const { item, price } of listings) {
      if (price.price !== null) expect(price.checkedAt, `${item.id} @ ${price.retailerId}`).not.toBeNull();
      if (price.priceFrom) expect(price.price, `${item.id} @ ${price.retailerId}`).not.toBeNull();
      if (price.sourceUrl) {
        expect(isRetailerUrl(price.retailerId, price.sourceUrl)).toBe(true);
        expect(price.link).toBe(price.sourceUrl);
      }
    }
  });

  it('a price always means found, and found always has a price', () => {
    for (const { item, price } of listings) {
      expect(price.match === 'found', `${item.id} @ ${price.retailerId}`).toBe(price.price !== null);
    }
  });

  it('prices are only ever in the retailer’s own currency', () => {
    for (const { price } of listings) expect(price.currency).toBe(getRetailer(price.retailerId).currency);
  });
});

describe('"from" prices', () => {
  const affix = { before: 'from ', after: '' };

  it('labels only a range price', () => {
    expect(withFrom('$233.97 CAD', true, affix)).toBe('from $233.97 CAD');
    expect(withFrom('$233.97 CAD', false, affix)).toBe('$233.97 CAD');
    expect(withFrom('$233.97 CAD', true, { before: '', after: ' 起' })).toBe('$233.97 CAD 起');
  });

  it('a kit total is a "from" total when any best price is', () => {
    const fromItem = gearDatabase.find((item) => bestPriceFor(item, 'CA')?.priceFrom === true);
    const plainItem = gearDatabase.find((item) => bestPriceFor(item, 'CA')?.priceFrom === false);
    expect(fromItem).toBeDefined();
    expect(plainItem).toBeDefined();
    expect(kitTotal([plainItem!], 'CA').from).toBe(false);
    expect(kitTotal([plainItem!, fromItem!], 'CA').from).toBe(true);
  });
});

describe('which retailer rows a card shows', () => {
  const visible = gearDatabase.filter((item) => !item.hidden);

  it('never lists a shop that was checked and does not carry the item', () => {
    for (const item of visible) {
      for (const region of ['CA', 'US'] as const) {
        expect(visiblePrices(item, region).some((price) => price.match === 'not_found'), item.id).toBe(false);
      }
    }
  });

  it('an item no Canadian shop carries gets one Evo Canada search link instead', () => {
    const missing = visible.filter((item) => visiblePrices(item, 'CA').length === 0);
    expect(missing.length).toBeGreaterThan(0);
    for (const item of missing) {
      const fallback = fallbackFor(item, 'CA');
      expect(fallback?.retailerId, item.id).toBe('evo-ca');
      // A plain search, never a product page: the item wasn't found there.
      expect(fallback?.sourceUrl).toBeNull();
      expect(fallback?.link.startsWith('https://www.evo.com/en-ca/search?q=')).toBe(true);
      expect(primaryLinkFor(item, 'CA')).toBe(fallback);
    }
  });

  it('items with a found or ambiguous Canadian listing get no fallback', () => {
    for (const item of visible.filter((entry) => visiblePrices(entry, 'CA').length > 0)) {
      expect(fallbackFor(item, 'CA'), item.id).toBeNull();
      expect(visiblePrices(item, 'CA').every((price) => price.match === 'found' || price.match === 'ambiguous')).toBe(true);
    }
  });

  it('unchecked US shops are still listed (not checked is not "not found")', () => {
    for (const item of visible) {
      expect(visiblePrices(item, 'US').map((price) => price.retailerId)).toEqual(['evo', 'rei', 'backcountry', 'the-house']);
      expect(fallbackFor(item, 'US')).toBeNull();
    }
  });
});
