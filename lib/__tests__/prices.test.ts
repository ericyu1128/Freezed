import { describe, expect, it } from 'vitest';
import gearDatabase from '../gearDatabase';
import { bestPriceFor, kitTotal, withFrom } from '../pricing';
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
