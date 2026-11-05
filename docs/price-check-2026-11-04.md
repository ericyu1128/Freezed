# Live price check — 2026-11-04

Canadian prices for 51 catalogue items at the five CA retailers in `lib/retailers.ts`, checked by hand in a browser on 2026-11-04 (255 item × retailer checks). Results are in `data/prices.json`: every checked cell has `checkedAt: "2026-11-04"` and a `match` of `found`, `ambiguous` or `not_found`. Every recorded price has a `sourceUrl`, and that retailer link now opens the product page instead of a search. Cards list found and ambiguous shops only; an item with neither at any Canadian shop shows one Evo Canada search link and "Not found at the Canadian shops we checked".

Nothing here is estimated or remembered: every number was read off the retailer page on the day. Anything not found, ambiguous or unclear is `null` and listed below with the reason.

## Counts per retailer

| Retailer | Found | Ambiguous | Not found | Blocked | Checked |
| --- | ---: | ---: | ---: | ---: | ---: |
| Evo Canada (`evo-ca`) | 24 | 8 | 19 | 0 | 51 |
| Sport Chek (`sportchek`) | 1 | 4 | 46 | 0 | 51 |
| Sporting Life (`sportinglife`) | 9 | 4 | 38 | 0 | 51 |
| Altitude Sports (`altitude-sports`) | 14 | 4 | 33 | 0 | 51 |
| MEC (`mec`) | 3 | 2 | 46 | 0 | 51 |
| **Total** | **51** | **22** | **182** | **0** | **255** |

"Ambiguous" means a likely match was found but something stops it being the exact current model at a clear price. Those cells are `null`, the same as "not found". No page was blocked or needed a sign-in.

6 of the 51 prices are "from" prices (`priceFrom: true`): the lowest in-stock price of a range by size or colourway.

## How each check was done

- **Search:** each retailer's own search page (the same URL pattern `buildSearchUrl` uses), with brand + model. Then the product page, to confirm the model, year, lens and price.
- **Current season = 2026/27.** A listing labelled 2026 (= 2025/26) or older counts as **not found** ("older-year only"). The price seen is listed below so you can decide. A listing with **no model year** is accepted when it is the exact model. Most Canadian stores don't label helmets, goggles or apparel with a year, and MEC labels nothing.
- **Exact model:** any colour is fine. Kids', youth, used and demo listings are excluded. Women's listings are excluded except for the one women's catalogue item (K2 Anthem 85). Jackets use the men's/unisex version. A renamed or sibling model (S/Pro Supra **S** BOA, Process Camber vs Flying V, Covert **2L**) is ambiguous.
- **Goggles:** the lens installed in the frame must be the catalogue lens. If the catalogue lens only comes as the bonus/spare lens, or the listing doesn't name its lens, that is ambiguous.
- **Packages:** a ski sold only as a ski + binding package is ambiguous. The exception is system skis that only ever ship with their binding.
- **Price:** the regular or sale price shown, in CAD. On evo.com/en-ca (Shopify), only in-stock variants count (read from the product's `.js` data, since tiles sometimes show sold-out sizes). If the in-stock price varies by size or colourway, the lowest is recorded and marked "from". On Altitude Sports and Sporting Life, the price and stock come from the page's product data.
- **Pricing errors:** an obviously wrong price (evo showing CA$110,900 for a ski) is ambiguous and not recorded.
- **Duplicate listings:** two listings with the same name, different prices and no model year are ambiguous. There is no way to tell which one is 2026/27.
- **evo.com/en-ca prices** look converted from USD (odd cents such as $850.09 or $293.36) and moved slightly while the check ran (QST 92: $850.67 → $850.09). The in-stock price at the last look is recorded.

**Not checked:**

- US retailers (evo, REI, Backcountry, The House): out of scope, still `null`.
- These items are hidden or marked discontinued/nonexistent in `docs/catalogue-audit.md`:

  - `ski-atomic-backland-107` (Atomic Backland 107): discontinued — successor Backland 109
  - `boot-salomon-shift-pro-110w` (Salomon Shift Pro 110 W): discontinued — successor Shift Alpha BOA 115 W
  - `boot-k2-method-100` (K2 Method 100 MV): no boot by this name (K2 Method Pro / Recon 100 MV exist)
  - `boot-volkl-secret-105` (Völkl Secret Pro 105 W): no boot by this name (Secret is a Völkl women's ski line)
  - `helmet-salomon-pioneer-lt` (Salomon Pioneer LT Visor): Visor version discontinued — non-visor Pioneer LT exists
  - `helmet-smith-vantage-mips` (Smith Vantage MIPS): discontinued — successor Vantage 2 MIPS
  - `binding-burton-genesis-x` (Burton Genesis X): discontinued (last 2020)

## Ambiguous — please review

All of these are `null` in `data/prices.json`. If you decide one is right, enter it in `data/prices-template.csv` and run `npm run prices:import`.

| Item | Retailer | Listing | Why it's ambiguous |
| --- | --- | --- | --- |
| Salomon QST 92 | Sport Chek | [Salomon QST 92 Flex Skis & Bindings](https://www.sportchek.ca/en/pdp/salomon-qst-92-flex-skis-bindings-84717508f.html) | only sold as a ski+binding package ($849.95, no model year); ski-only listing is the 2024 model ($524.97) |
| Salomon QST 92 | Sporting Life | [QST 92 Ski + M10 GW Binding [2027]](https://www.sportinglife.ca/en-CA/equipment/ski/alpine-skis/adult-alpine-skis/qst-92-ski-%2B-m10-gw-binding-2027/25931910.html) | only sold as a ski+binding package |
| Black Crows Camox | Evo Canada | [Black Crows Camox Skis 2027](https://www.evo.com/en-ca/products/268145-black-crows-camox-skis-2026) | evo shows CA$110,900.00 — evident pricing error on evo's side; not recorded |
| Black Crows Corvus | Evo Canada | [Black Crows Corvus Skis 2027](https://www.evo.com/en-ca/products/283716-black-crows-corvus-skis-2027) | product page shows CA$138,900.00 — evident pricing error; 2026 model listed at $1,389.00 (older year) |
| Burton Process Flying V | Altitude Sports | [BURTON Process Snowboard - Men's](https://www.altitude-sports.com/p/burton-process-snowboard-mens-btn-106921-sea26) | sea26 C$679.99, but the page describes PurePop camber — the Process Camber, not the Process Flying V |
| Salomon S/Pro Supra BOA 120 | Evo Canada | [Salomon S/Pro Supra S BOA 120 Ski Boots 2027](https://www.evo.com/en-ca/products/282177-salomon-s-pro-supra-s-boa-120-ski-boots-2027) | exact name only as 2026 model ($479.98); the 2027 boot is renamed "S/Pro Supra S BOA 120" ($849.95) — same model? |
| Salomon S/Pro Supra BOA 120 | Altitude Sports | [SALOMON S/Pro Supra S BOA 120 Alpine Ski Boots - Men's](https://www.altitude-sports.com/p/salomon-spro-supra-s-boa-120-alpine-ski-boots-mens-sal-l45420600-sea26) | sea26 C$999.99 under the renamed "S BOA" name — same model? |
| Atomic Hawx Ultra XTD 130 BOA | MEC | [Atomic Hawx Ultra XTD 130 BOA GW Ski Boots - Unisex](https://www.mec.ca/en/product/6036-990/atomic-hawx-ultra-xtd-130-boa-gw-ski-boots-unisex) | $1,099.95, but this is the GW variant, which evo lists only as a 2025 model; MEC shows no year |
| Smith Squad — Yellow Sensor Mirror | Sport Chek | [Smith Squad Ski & Snowboard Goggles](https://www.sportchek.ca/en/pdp/smith-squad-ski-snowboard-goggles-87473370f.html) | $180.00, but neither Squad listing names its lens (product page only mentions ChromaPop); Yellow Sensor Mirror not confirmed |
| Salomon Radium Pro S Sigma | Sporting Life | [Salomon Radium Pro S Sigma Snow Goggle](https://www.sportinglife.ca/en-CA/equipment/ski/ski-goggles/adult-goggles/radium-pro-s-sigma-snow-goggle/25920352.html) | $199.95, but it ships Sigma Black Gold installed with Silver Pink as the second lens (catalogue: Silver Pink installed + Light Blue) |
| Salomon Radium Pro S Sigma | Altitude Sports | [Salomon Radium Pro S Sigma Goggles with Extra Lens](https://www.altitude-sports.com/p/salomon-radium-pro-s-sigma-goggles-with-extra-lens-sal-l47891000) | $199.95, but the listing ships Sigma Black Gold installed with Silver Pink as the extra lens (catalogue: Silver Pink installed + Light Blue) |
| Anon M4 Toric — Perceive Cloudy Pink | Evo Canada | [Anon M4 Toric MFI Goggles](https://www.evo.com/en-ca/products/267745-anon-m4-toric-mfi-goggles) | Cloudy Pink only as the bonus lens (installed: Perceive Variable Blue/Green), $419.99; the Cloudy-Pink-installed colourway is sold out |
| Anon M4 Toric — Perceive Cloudy Pink | Sport Chek | [Anon M4 Toric Ski & Snowboard Goggles](https://www.sportchek.ca/en/pdp/anon-m4-toric-ski-snowboard-goggles-84713634f.html) | $419.99, but the listing doesn't name its lens; Perceive Cloudy Pink not confirmed |
| Anon M4 Toric — Perceive Cloudy Pink | Sporting Life | [Anon M4 Toric Snow Goggle + MFI Face Mask](https://www.sportinglife.ca/en-CA/equipment/ski/ski-goggles/adult-goggles/m4-toric-snow-goggle-%2B-mfi%23174--face-mask/25933606.html) | $419.99 (one colourway $249.98), but none of the 3 listings name the lens; Perceive Cloudy Pink not confirmed |
| Smith I/O MAG — ChromaPop Storm Rose | Evo Canada | [Smith I/O MAG Goggles](https://www.evo.com/en-ca/products/218131-smith-i-o-mag-goggles) | Storm Rose Flash only as the bonus lens (installed: Sun Green / Everyday Rose Gold), $325.00; no in-stock Storm Rose installed + Sun Platinum spare |
| Smith I/O MAG — ChromaPop Storm Rose | Sport Chek | [SMITH I/O Mag Ski & Snowboard Goggles](https://www.sportchek.ca/en/pdp/smith-i-o-mag-ski-snowboard-goggles-84735845f.html) | $335.00, listing doesn't name its lens and the product photo shows a blue mirror lens; Storm Rose Flash not confirmed |
| Smith I/O MAG — ChromaPop Storm Rose | MEC | [Smith I/O Mag Goggles - Unisex](https://www.mec.ca/en/product/5061-057/smith-io-mag-goggles-unisex) | $334.95, but ChromaPop Storm Rose is only the spare lens (installed: ChromaPop Everyday colourways) |
| Burton Covert 2.0 Insulated | Evo Canada | [Burton Covert 2.0 Jacket - Men's](https://www.evo.com/en-ca/products/236794-burton-covert-2-0-jacket-men-s) | exact name at $293.36 but only 2 of 64 variants in stock (XXS, S); a successor "Burton Covert 2L Insulated Jacket - Men's" is $359.99 (9 in stock) — confirm which is the current-season Covert |
| Burton Covert 2.0 Insulated | Altitude Sports | [Burton Covert 2L Insulated Jacket - Men's](https://www.altitude-sports.com/p/burton-covert-2l-insulated-jacket-mens-btn-3111910) | $349.99 (12 in stock), but it's named "Covert 2L Insulated", not "Covert 2.0" — likely the renamed successor; confirm it's the same jacket |
| Arc'teryx Sabre Jacket | Evo Canada | [Arc'teryx Sabre Jacket - Men's](https://www.evo.com/en-ca/products/279085-arc-teryx-sabre-jacket-men-s) | two separate "Sabre Jacket - Men's" listings with no model year: 279085 $950.00 (Black, Aquaculture) and 279634 $765.00–$810.00 (Vitality/Black Sapphire, Blaze) — can't tell which is 2026/27 |
| Burton [ak] Cyclic GORE-TEX 2L | Evo Canada | [Burton AK Cyclic GORE-TEX 2L Jacket - Men's](https://www.evo.com/en-ca/products/287087-burton-ak-cyclic-gore-tex-2l-jacket-men-s) | two separate listings with the same name and no model year: 287087 $649.99 (all 40 variants in stock) and 250092 $383.53–$419.99 — can't tell which is 2026/27 |
| Burton [ak] Cyclic GORE-TEX 2L | Sporting Life | [Burton [ak] Men's Cyclic GORE-TEX 2L Jacket](https://www.sportinglife.ca/en-CA/men/clothing/coats-jackets/snowboard-jackets/mens-cyclic-gore-tex%23174--2l-jacket/25931844.html) | four listings, no model year: $599.99 (Blue Teal, Very Berry/Grey Cloud) and $649.99 (True Black, Nightshade Purple/Purple Voltage); the $599.99 colourways look like the previous season — confirm |

## Older-year only — also worth a look

Recorded as not found because the only listing was an older model year. The price seen is noted in case you want to accept it.

| Item | Retailer | Listing | What was there |
| --- | --- | --- | --- |
| K2 Disruption 78C | Sport Chek | [K2 Disruption 78C Men's Skis 2024 & M3 11 Bindings](https://www.sportchek.ca/en/pdp/k2-disruption-78c-men-s-skis-2024-m3-11-bindings-82634531f.html) | older-year only: 2024 packages at $599.97 (& M3 11) and $399.97 (Quikclik Free) |
| Black Crows Camox | Altitude Sports | [BLACK CROWS Camox Skis - Men's](https://www.altitude-sports.com/p/black-crows-camox-skis-mens-bkc-102365-sea25) | older-year only: season code sea25 (2025/26) at C$1,108.99 |
| Atomic Hawx Prime 90 GW | Evo Canada | [Atomic Hawx Prime 90 Ski Boots 2026](https://www.evo.com/en-ca/products/268110-atomic-hawx-prime-90-ski-boots-2026) | older-year only: 2026 model at $269.99 |
| Burton Ruler BOA | Sport Chek | [Burton Ruler Boa Men's Snowboard Boots 2019/20 - Black](https://www.sportchek.ca/en/pdp/burton-ruler-boa-men-s-snowboard-boots-2019-20-black-70334191f.html) | older-year only: 2019/20 model at $459.99 |
| Salomon Strive 10 GW | Sport Chek | [Salomon Strive 10 GW Men's Ski Bindings 2026](https://www.sportchek.ca/en/pdp/salomon-strive-10-gw-men-s-ski-bindings-2026-86877513f.html) | older-year only: 2026 model at $199.95 |
| Marker Jester 16 ID | Sporting Life | [Jester 16 ID 110 Ski Binding [2026]](https://www.sportinglife.ca/en-CA/equipment/ski/ski-bindings/adult-ski-bindings/jester-16-id-110-ski-binding-2026/25834953.html) | older-year only: 2026 model at $459.99 |
| Oakley Line Miner L — Prizm Sapphire | Sport Chek | [Oakley Line Miner L Ski & Snowboard Goggles 2026 - Blue Bolts With Prizm Sapphire Lens](https://www.sportchek.ca/en/pdp/oakley-line-minertm-l-ski-snowboard-goggles-2026-blue-bolts-with-prizm-sapphire-lens-helmet-compatible-with-uv-protection-86475644f.html) | older-year only: 2026-labelled Prizm Sapphire colourway at $245.00 (2025 version $114.97) |

## Recorded prices

| Item | Retailer | Price (CAD) | Product page | Note |
| --- | --- | ---: | --- | --- |
| Salomon QST 92 | Evo Canada | $850.09 | [Salomon QST 92 Skis 2027](https://www.evo.com/en-ca/products/286195-salomon-qst-92-skis-2027) | evo.com/en-ca prices moved during the check ($850.67 → $850.09); recorded the in-stock price at last check |
| Atomic Bent 100 | Evo Canada | $799.99 | [Atomic Bent 100 Skis 2027](https://www.evo.com/en-ca/products/282394-atomic-bent-chetler-100-skis-2027) | 2026 model also listed at $449.99 (older year, ignored) |
| Atomic Bent 100 | Sporting Life | $799.99 | [Atomic Bent 100 Ski [2027]](https://www.sportinglife.ca/en-CA/equipment/ski/alpine-skis/adult-alpine-skis/bent-100-ski-2027/25932911.html) | lowPrice = highPrice |
| Atomic Bent 100 | Altitude Sports | $799.99 | [ATOMIC Bent 100 Skis](https://www.altitude-sports.com/p/atomic-bent-100-skis-atm-aa0030952-sea26) | season code sea26 (2026/27) |
| Atomic Bent 100 | MEC | $799.95 | [Atomic Bent 100 Skis - Unisex](https://www.mec.ca/en/product/6042-917/atomic-bent-100-skis-unisex) | MEC shows no model year; full price |
| Völkl Mantra M7 | Evo Canada | $949.99 | [Völkl M7 Mantra Skis 2027](https://www.evo.com/en-ca/products/284174-volkl-m7-mantra-skis-2027) | 2026 model also listed at $949.99 |
| Völkl Mantra M7 | Altitude Sports | $949.99 | [VÖLKL M7 Mantra Skis - Unisex](https://www.altitude-sports.com/p/volkl-m7-mantra-skis-unisex-vlk-v2610112-sea26) | sea26 / V26 part no. (2026/27); a sea25 men's listing at the same price was ignored |
| Völkl Blaze 114 | Evo Canada | $899.99 | [Völkl Blaze 114 Skis 2027](https://www.evo.com/en-ca/products/284180-volkl-blaze-114-skis-2027) | — |
| Salomon Assassin | Evo Canada | $649.95 | [Salomon Assassin Snowboard 2027](https://www.evo.com/en-ca/products/284038-salomon-assassin-snowboard-2027) | 2026 model also listed at $389.97 (older year, ignored) |
| Salomon Assassin | Sporting Life | $649.95 | [Men's Assassin Snowboard [2027]](https://www.sportinglife.ca/en-CA/equipment/snowboard/snowboards/adult-snowboards/mens-assassin-snowboard-2027/25931821.html) | lowPrice = highPrice |
| Burton Custom Camber | Evo Canada | $879.99 | [Burton Custom Snowboard 2027](https://www.evo.com/en-ca/products/284961-burton-custom-snowboard-2027) | the standard Custom is the camber model |
| Burton Custom Camber | Altitude Sports | $879.99 | [BURTON Custom Camber Snowboard - Men's](https://www.altitude-sports.com/p/burton-custom-camber-snowboard-mens-btn-106881-sea26) | sea26 (2026/27); a sea25 listing at the same price was ignored |
| Burton Process Flying V | Evo Canada | $679.99 | [Burton Process Flying V Snowboard 2027](https://www.evo.com/en-ca/products/284964-burton-process-flying-v-snowboard-2027) | — |
| Burton Family Tree Hometown Hero | Evo Canada | $879.99 | [Burton Family Tree Hometown Hero Snowboard 2027](https://www.evo.com/en-ca/products/284947-burton-family-tree-hometown-hero-snowboard-2027) | 2026 model also listed from $615.99 (older year, ignored) |
| Burton Family Tree Hometown Hero | Altitude Sports | $879.99 | [BURTON Family Tree Hometown Hero Snowboard](https://www.altitude-sports.com/p/burton-family-tree-hometown-hero-snowboard-btn-222451-sea26) | sea26 (2026/27) |
| Salomon Huck Knife | Evo Canada | $559.95 | [Salomon Huck Knife Snowboard 2027](https://www.evo.com/en-ca/products/284025-salomon-huck-knife-snowboard-2027) | 2026 model also listed at $329.97 (older year, ignored) |
| Salomon Huck Knife | Sporting Life | $559.95 | [Men's Huck Knife Snowboard [2027]](https://www.sportinglife.ca/en-CA/equipment/snowboard/snowboards/adult-snowboards/mens-huck-knife-snowboard-2027/25931822.html) | lowPrice = highPrice |
| Salomon Huck Knife | Altitude Sports | $559.95 | [SALOMON Huck Knife Snowboard - Men's](https://www.altitude-sports.com/p/salomon-huck-knife-snowboard-mens-sal-l49292200-sea26) | sea26 (2026/27) |
| K2 Anthem 85 BOA | Evo Canada | $549.99 | [K2 Anthem 85 BOA Ski Boots - Women's 2027](https://www.evo.com/en-ca/products/280587-k2-anthem-85-boa-ski-boots-women-s-2027) | 2026 model also listed at $384.99 (older year, ignored) |
| Atomic Hawx Ultra XTD 130 BOA | Evo Canada | $1,099.99 | [Atomic Hawx Ultra XTD 130 BOA Alpine Touring Ski Boots 2027](https://www.evo.com/en-ca/products/268230-atomic-hawx-ultra-xtd-130-boa-alpine-touring-ski-boots-2026) | listing title says 2027 (URL slug says 2026) |
| Salomon Launch BOA SJ | Evo Canada | from $233.97 | [Salomon Launch Boa SJ Snowboard Boots](https://www.evo.com/en-ca/products/253983-salomon-launch-boa-sj-boa-snowboard-boots) | price range shown ($233.97–$399.95); no model year on listing |
| Burton Ruler BOA | Evo Canada | $459.99 | [Burton Ruler Boa Snowboard Boots](https://www.evo.com/en-ca/products/137745-burton-ruler-boa-snowboard-boots) | all in-stock variants $459.99 (search tile showed $306.69 for a sold-out size); no model year on listing |
| Burton Ruler BOA | Sporting Life | $459.99 | [Men's Ruler BOA Snowboard Boot [2027]](https://www.sportinglife.ca/en-CA/equipment/snowboard/snowboard-boots/adult-snowboard-boots/mens-ruler-boa%23174--snowboard-boot-2027/25247123.html) | 2026 model also listed on sale at $287.97 (older year, ignored) |
| Burton Ruler BOA | Altitude Sports | $459.99 | [BURTON Ruler BOA Snowboard Boots - Men's](https://www.altitude-sports.com/p/burton-ruler-boa-snowboard-boots-mens-btn-2031710-sea26) | sea26 (2026/27) |
| Burton Photon Step On | Evo Canada | $387.49 | [Burton Photon Step On Snowboard Boots](https://www.evo.com/en-ca/products/200555-burton-photon-step-on-snowboard-boots) | no model year on listing; Wide version separate |
| Burton Photon Step On | Altitude Sports | $599.99 | [BURTON Photon Step On Snowboard Boots - Men's](https://www.altitude-sports.com/p/burton-photon-step-on-snowboard-boots-mens-btn-172851) | no season code on this listing; season-coded copies are sea25 (2025/26) at the same price |
| Salomon Strive 10 GW | Evo Canada | $199.95 | [Salomon Strive 10 GW Ski Bindings 2027](https://www.evo.com/en-ca/products/282279-salomon-strive-10-bindings-ski-bindings-2027) | — |
| Burton Freestyle Re:Flex | Evo Canada | $239.99 | [Burton Freestyle Snowboard Bindings 2027](https://www.evo.com/en-ca/products/284818-burton-freestyle-snowboard-bindings-2027) | listed as "Freestyle" (Burton's Freestyle is the Re:Flex binding) |
| Union Force | Evo Canada | $449.95 | [Union Force Snowboard Bindings 2027](https://www.evo.com/en-ca/products/281862-union-force-snowboard-bindings-2027) | Force Classic / Team are separate models (ignored) |
| K2 Phase Pro | MEC | $169.95 | [K2 Phase Pro Helmet - Unisex](https://www.mec.ca/en/product/5054-829/k2-phase-pro-helmet-unisex) | MEC shows no model year |
| Oakley MOD3 MIPS | Evo Canada | from $107.50 | [Oakley MOD 3 MIPS Helmet](https://www.evo.com/en-ca/products/238994-oakley-mod-3-mips-helmet) | in-stock variants $107.50–$215.00 by colour/size |
| Oakley MOD3 MIPS | Sport Chek | $215.00 | [Oakley MOD3 MIPS Snowboarding Helmet](https://www.sportchek.ca/en/pdp/oakley-mod3-mips-snowboarding-helmet-78581597f.html) | no model year on listing |
| Oakley MOD3 MIPS | Sporting Life | $215.00 | [Oakley MOD3 MIPS Snow Helmet](https://www.sportinglife.ca/en-CA/equipment/ski/ski-helmets/adult-ski-helmets/mod3-mips-snow-helmet/25790353.html) | no model year on listing |
| Oakley MOD3 MIPS | Altitude Sports | $214.99 | [OAKLEY MOD3 MIPS Helmet - Unisex](https://www.altitude-sports.com/p/oakley-mod3-mips-helmet-oak-fos901055) | no season code on listing |
| Oakley MOD5 MIPS | Evo Canada | from $157.50 | [Oakley MOD 5 MIPS Helmet](https://www.evo.com/en-ca/products/224090-oakley-mod-5-mips-helmet) | in-stock variants $157.50–$315.00 by colour/size; I.C.E. edition separate |
| Oakley MOD5 MIPS | Altitude Sports | $314.99 | [OAKLEY MOD5 MIPS Helmet - Unisex](https://www.altitude-sports.com/p/oakley-mod5-mips-helmet-unisex-oak-fos900641) | no season code on listing |
| Oakley Line Miner L — Prizm Sapphire | Evo Canada | from $192.00 | [Oakley Line Miner L Goggles — Prizm Sapphire Iridium](https://www.evo.com/en-ca/products/106396-oakley-line-miner-l-goggles) | in-stock Prizm Sapphire variants $192.00–$202.00 by frame colour |
| Oakley Line Miner L — Prizm Sapphire | Sporting Life | $114.98 | [Oakley Line Miner L Snow Goggle — Prizm Snow Sapphire Iridium](https://www.sportinglife.ca/en-CA/equipment/ski/ski-goggles/adult-goggles/line-miner%23153--l-snow-goggle/25919971.html) | sale price (regular $192.00); no model year on listing |
| Oakley Line Miner L — Prizm Sapphire | Altitude Sports | from $191.99 | [Line Miner L Goggles - Matte Black - Prizm Sapphire Iridium Lens](https://www.altitude-sports.com/p/oakley-line-miner-l-snow-goggles-matte-black-prizm-sapphire-iridium-lens-oak-oo7070-04) | two in-stock Prizm Sapphire colourways: Matte Black $191.99, Factory Pilot Black $201.99; no model year on listing |
| Smith 4D MAG — ChromaPop Sun Black | Evo Canada | $390.00 | [Smith 4D MAG Goggles — ChromaPop Sun Black + Storm Blue Sensor Mirror](https://www.evo.com/en-ca/products/218130-smith-4d-mag-goggles) | 3 in-stock colourways, all $390.00 |
| Smith 4D MAG — ChromaPop Sun Black | Altitude Sports | $389.99 | [4D Mag Snow Goggles - Unisex - Black - Chromapop Sun Black](https://www.altitude-sports.com/p/smith-optics-4d-mag-snow-goggles-unisex-sth-m007320) | in stock; a second 4D MAG listing (sth-m00732, Pink Frost Flex Glitch - Chromapop Sun Black) is $399.99 |
| Oakley Flight Deck L — Prizm Torch | Evo Canada | $259.00 | [Oakley Flight Deck L Goggles — Prizm Torch Iridium](https://www.evo.com/en-ca/products/83182-oakley-flight-deck-l-goggles) | 5 in-stock Prizm Torch variants, all $259.00 |
| Oakley Flight Deck L — Prizm Torch | Altitude Sports | $258.99 | [Flight Deck L Snow Goggles - Iron Red - Prizm Snow Torch Iridium Lens](https://www.altitude-sports.com/p/oakley-flight-deck-l-snow-goggles-prizm-snow-torch-iridium-lens-oak-oo7050-g0) | in stock; no model year on listing |
| Salomon Brilliant 2.0 Jacket | Altitude Sports | $549.99 | [Salomon Brilliant 2.0 Jacket - Men's](https://www.altitude-sports.com/p/salomon-brilliant-20-jacket-mens-sal-lc2635400) | all 21 in-stock variants $549.99; no season code on listing |
| Arc'teryx Macai Down Jacket | Evo Canada | $1,096.88 | [Arc'teryx Macai Down Jacket - Men's](https://www.evo.com/en-ca/products/263965-arc-teryx-macai-down-jacket-men-s) | 10 of 14 variants in stock, all $1,096.88; no model year on listing |
| Arc'teryx Macai Down Jacket | Sporting Life | $1,400.00 | [Arc'teryx Men's Macai Down Jacket](https://www.sportinglife.ca/en-CA/men/clothing/coats-jackets/ski-jackets/mens-macai-down-jacket/25932793.html) | two colourway listings (Black, Dark Jade Mongoose), both $1,400.00 in stock; no model year on listing |
| Arc'teryx Sabre Jacket | Sporting Life | $950.00 | [Arc'teryx Men's Sabre Jacket](https://www.sportinglife.ca/en-CA/men/clothing/coats-jackets/ski-jackets/mens-sabre-jacket/25932798.html) | two colourway listings (Mantis Dark Jade, Aquaculture/Stratus), both $950.00 in stock; no model year on listing |
| Arc'teryx Sabre Jacket | MEC | $950.00 | [Arc'teryx Sabre Jacket - Men's](https://www.mec.ca/en/product/6040-609/arcteryx-sabre-jacket-mens) | marked NEW, one colourway (Mantis/Dark Jade), $950.00; MEC shows no model year |
| Arc'teryx Rush Jacket | Evo Canada | from $570.00 | [Arc'teryx Rush Jacket - Men's](https://www.evo.com/en-ca/products/263987-arc-teryx-rush-jacket-men-s) | 31 in-stock variants at $570.00 / $855.00 / $950.00 by colourway; no model year on listing |
| Arc'teryx Rush Jacket | Sporting Life | $1,000.00 | [Arc'teryx Men's Rush Jacket](https://www.sportinglife.ca/en-CA/men/clothing/coats-jackets/ski-jackets/mens-rush-jacket/25932795.html) | two colourway listings (Black Mongoose, Mantis Dark Jade), both $1,000.00 in stock; no model year on listing |
| Burton [ak] Cyclic GORE-TEX 2L | Altitude Sports | $649.99 | [[ak] Cyclic GORE-TEX 2L Jacket - Men's](https://www.altitude-sports.com/p/burton-ak-cyclic-goretex-2l-jacket-mens-btn-307631) | two listings (btn-307631, btn-3076310), all 56 in-stock variants $649.99; no season code on listing |

## Not found, by retailer

<details>
<summary>Evo Canada: 19 not found</summary>

| Item | Reason |
| --- | --- |
| K2 Disruption 78C | only "K2 Disruption 78 C Skis + M3 10 Compact Demo Bindings 2025 - Used" |
| Salomon Stance 84 | search lists QST 92/94/100 but no Stance 84 |
| K2 Mindbender 89Ti | evo lists K2 Mindbender 88 / 90 / 96 Skis 2027, no 89Ti |
| K2 Poacher | evo lists K2 Omen / Mindbender / Reckoner 2027, no Poacher |
| Atomic Redster X9S Revoshock S | no Redster X9S listing |
| K2 Raygun | no Raygun listed |
| K2 Party Platter | no Party Platter listed |
| Atomic Hawx Prime 90 GW | older-year only: 2026 model at $269.99 ([listing](https://www.evo.com/en-ca/products/268110-atomic-hawx-prime-90-ski-boots-2026)) |
| K2 Maysis Clicker X HB | only the standard Maysis ($399.99), not the Clicker X HB step-in version ([listing](https://www.evo.com/en-ca/products/282130-k2-maysis-snowboard-boots-2027)) |
| Atomic Warden MNC 13 | only a 2022 Salomon Warden MNC 11 demo binding |
| Marker Jester 16 ID | lists Jester X MWerks 16 (2027) and Jester 18 Pro (2026), not the Jester 16 ID |
| K2 Phase Pro | no Phase Pro listed |
| Smith Mission MIPS | no Mission listed |
| Smith Squad — Yellow Sensor Mirror | no Yellow Sensor Mirror lens among 34 variants (ChromaPop lenses only) ([listing](https://www.evo.com/en-ca/products/283171-smith-squad-goggles)) |
| Salomon Radium Pro S Sigma | no Sigma Silver Pink variant ([listing](https://www.evo.com/en-ca/products/285075-salomon-radium-pro-sigma-goggles)) |
| Oakley Sub Temp RC GORE-TEX Jacket | no Sub Temp RC listed (searched "Oakley Sub Temp RC" and "Oakley Sub Temp") |
| Salomon Brilliant 2.0 Jacket | only Salomon Brilliant Pants - Men's listed, no Brilliant (2.0) jacket |
| Burton Frostner Down Jacket | no Frostner listed |
| Salomon Stance 3L Shell | no Stance 3L listed (results are Stance socks) |

</details>

<details>
<summary>Sport Chek: 46 not found</summary>

| Item | Reason |
| --- | --- |
| K2 Disruption 78C | older-year only: 2024 packages at $599.97 (& M3 11) and $399.97 (Quikclik Free) ([listing](https://www.sportchek.ca/en/pdp/k2-disruption-78c-men-s-skis-2024-m3-11-bindings-82634531f.html)) |
| Salomon Stance 84 | no Stance 84 listed |
| K2 Mindbender 89Ti | lists Mindbender 85 / 88 (2026) / 90, no 89Ti |
| Atomic Bent 100 | no Bent 100 listed |
| K2 Poacher | no Poacher listed |
| Völkl Mantra M7 | no M7 Mantra listed |
| Atomic Redster X9S Revoshock S | no Redster listed |
| Black Crows Camox | no Black Crows listed |
| Black Crows Corvus | no Black Crows listed |
| Völkl Blaze 114 | lists Blaze 82 (package) and Blaze 94 (2024), no Blaze 114 |
| K2 Raygun | not carried (search returns unrelated items) |
| Salomon Assassin | not carried (search returns unrelated items) |
| Burton Custom Camber | not carried (search returns unrelated items) |
| Burton Process Flying V | not carried (search returns unrelated items) |
| K2 Party Platter | not carried (search returns unrelated items) |
| Burton Family Tree Hometown Hero | not carried (search returns unrelated items) |
| Salomon Huck Knife | not carried (search returns unrelated items) |
| Atomic Hawx Prime 90 GW | no Hawx Prime 90 listed |
| K2 Anthem 85 BOA | only Anthem 95 BOA Women's 2024 (different model) |
| Salomon S/Pro Supra BOA 120 | no S/Pro Supra 120 listed |
| Atomic Hawx Ultra XTD 130 BOA | no Hawx Ultra listed |
| Salomon Launch BOA SJ | no Launch listed |
| Burton Ruler BOA | older-year only: 2019/20 model at $459.99 ([listing](https://www.sportchek.ca/en/pdp/burton-ruler-boa-men-s-snowboard-boots-2019-20-black-70334191f.html)) |
| K2 Maysis Clicker X HB | no Maysis listed |
| Burton Photon Step On | no Photon listed |
| Salomon Strive 10 GW | older-year only: 2026 model at $199.95 ([listing](https://www.sportchek.ca/en/pdp/salomon-strive-10-gw-men-s-ski-bindings-2026-86877513f.html)) |
| Atomic Warden MNC 13 | no Warden listed |
| Marker Jester 16 ID | no Jester listed |
| Burton Freestyle Re:Flex | no Burton Freestyle listed |
| Union Force | no Union Force listed |
| K2 Phase Pro | no Phase Pro listed |
| Smith Mission MIPS | no Mission listed |
| Oakley MOD5 MIPS | no MOD5 listed |
| Salomon Radium Pro S Sigma | no Radium listed |
| Oakley Line Miner L — Prizm Sapphire | older-year only: 2026-labelled Prizm Sapphire colourway at $245.00 (2025 version $114.97) ([listing](https://www.sportchek.ca/en/pdp/oakley-line-minertm-l-ski-snowboard-goggles-2026-blue-bolts-with-prizm-sapphire-lens-helmet-compatible-with-uv-protection-86475644f.html)) |
| Smith 4D MAG — ChromaPop Sun Black | 4D MAG listed only with Sun Red Mirror (and XL with Everyday Blue) |
| Oakley Flight Deck L — Prizm Torch | Flight Deck L listed with 24K Gold (2026) and unnamed lens (2025); no Prizm Torch |
| Oakley Sub Temp RC GORE-TEX Jacket | no Sub Temp RC in results (Oakley results are goggles/sunglasses) |
| Salomon Brilliant 2.0 Jacket | no Brilliant jacket in results |
| Burton Covert 2.0 Insulated | no Covert in results (Burton results are Reserve jackets) |
| Burton Frostner Down Jacket | only Burton Unisex Frostner Anorak Jacket ($89.88 final sale) and a youth Frostner anorak — no Frostner Down |
| Salomon Stance 3L Shell | no Stance 3L in results |
| Arc'teryx Macai Down Jacket | no Macai in results |
| Arc'teryx Sabre Jacket | no Sabre in results |
| Arc'teryx Rush Jacket | no Arc'teryx Rush (results are Scarpa Rush shoes) |
| Burton [ak] Cyclic GORE-TEX 2L | no AK Cyclic in results |

</details>

<details>
<summary>Sporting Life: 38 not found</summary>

| Item | Reason |
| --- | --- |
| K2 Disruption 78C | no Disruption listed |
| Salomon Stance 84 | no results |
| K2 Mindbender 89Ti | no Mindbender listed |
| K2 Poacher | no Poacher listed |
| Völkl Mantra M7 | no results |
| Atomic Redster X9S Revoshock S | no results |
| Black Crows Camox | no Black Crows listed |
| Black Crows Corvus | no Black Crows listed |
| Völkl Blaze 114 | search redirects to Blaze 104 Ski [2027] (different model) |
| K2 Raygun | no Raygun listed |
| Burton Custom Camber | no results |
| Burton Process Flying V | no results |
| K2 Party Platter | search redirects to an unrelated K2 boot |
| Burton Family Tree Hometown Hero | no results |
| Atomic Hawx Prime 90 GW | no results |
| K2 Anthem 85 BOA | no Anthem 85 listed |
| Salomon S/Pro Supra BOA 120 | no results |
| Atomic Hawx Ultra XTD 130 BOA | search redirects to Hawx Ultra 110 S BOA [2026] (different model) |
| Salomon Launch BOA SJ | no results |
| K2 Maysis Clicker X HB | no results |
| Burton Photon Step On | no results |
| Salomon Strive 10 GW | lists Strive 12 / 14 GW [2026], no Strive 10 |
| Atomic Warden MNC 13 | search redirects to an unrelated Atomic boot |
| Marker Jester 16 ID | older-year only: 2026 model at $459.99 ([listing](https://www.sportinglife.ca/en-CA/equipment/ski/ski-bindings/adult-ski-bindings/jester-16-id-110-ski-binding-2026/25834953.html)) |
| Burton Freestyle Re:Flex | no results |
| Union Force | no Union Force listed |
| K2 Phase Pro | no Phase Pro listed |
| Smith Mission MIPS | only the non-MIPS Mission ($71.98); page never mentions MIPS ([listing](https://www.sportinglife.ca/en-CA/equipment/ski/ski-helmets/adult-ski-helmets/mission-snow-helmet/25929378.html)) |
| Oakley MOD5 MIPS | no results |
| Smith Squad — Yellow Sensor Mirror | 5 Squad colourways checked: Sun Black Gold / Everyday Blue / Everyday Red / Sun Platinum — no Yellow Sensor Mirror |
| Smith I/O MAG — ChromaPop Storm Rose | 3 I/O MAG colourways checked: Sun Platinum / Everyday Red / Sun Black Gold installed, Storm Blue Sensor bonus — no Storm Rose Flash |
| Smith 4D MAG — ChromaPop Sun Black | 3 4D MAG colourways checked: Sun Platinum / Sun Black Gold Mirror installed — no plain Sun Black |
| Oakley Flight Deck L — Prizm Torch | 4 Flight Deck L colourways checked: Prizm Sapphire / Iced — no Prizm Torch |
| Oakley Sub Temp RC GORE-TEX Jacket | no Sub Temp RC in results |
| Salomon Brilliant 2.0 Jacket | no Brilliant jacket (only a "Brilliant Olive" colourway of an unrelated jacket) |
| Burton Covert 2.0 Insulated | no Covert in results |
| Burton Frostner Down Jacket | no Frostner in results |
| Salomon Stance 3L Shell | no results |

</details>

<details>
<summary>Altitude Sports: 33 not found</summary>

| Item | Reason |
| --- | --- |
| K2 Disruption 78C | no Disruption listed |
| Salomon Stance 84 | no Stance 84 listed |
| Salomon QST 92 | lists QST 100/106/X, no QST 92 |
| K2 Mindbender 89Ti | lists Mindbender 96 / 101 skis (sea26), no 89Ti |
| K2 Poacher | no Poacher listed |
| Atomic Redster X9S Revoshock S | only Redster helmets/apparel |
| Black Crows Camox | older-year only: season code sea25 (2025/26) at C$1,108.99 ([listing](https://www.altitude-sports.com/p/black-crows-camox-skis-mens-bkc-102365-sea25)) |
| Black Crows Corvus | no Corvus listed |
| Völkl Blaze 114 | lists Blaze 94 / 104, no 114 |
| K2 Raygun | no Raygun listed |
| Salomon Assassin | only Assassin Pro (different model) |
| K2 Party Platter | no Party Platter listed |
| Atomic Hawx Prime 90 GW | lists Hawx Prime XTD 95 / 120 / 130, no Hawx Prime 90 |
| K2 Anthem 85 BOA | lists Anthem 105 Zonal / Anthem X 95 / X 105, no Anthem 85 |
| Atomic Hawx Ultra XTD 130 BOA | lists Hawx Ultra XTD 120 BOA / 105 BOA W, no 130 |
| Salomon Launch BOA SJ | no Launch listed |
| K2 Maysis Clicker X HB | only the standard Maysis (C$399.99), not the Clicker X HB step-in version ([listing](https://www.altitude-sports.com/p/k2-maysis-snowboard-boots-mens-k2s-kb251294-sea26)) |
| Salomon Strive 10 GW | no Strive 10 listed |
| Atomic Warden MNC 13 | no Warden listed |
| Marker Jester 16 ID | no Marker Jester listed |
| Burton Freestyle Re:Flex | no Burton Freestyle listed |
| Union Force | no Union Force listed |
| K2 Phase Pro | no Phase Pro listed |
| Smith Mission MIPS | no Mission listed |
| Smith Squad — Yellow Sensor Mirror | 13 colourways checked ($199.99): Everyday Violet/Green/Rose Gold/Red, Sun Black, Sun Black Gold, Sun Platinum — no Yellow Sensor Mirror ([listing](https://www.altitude-sports.com/p/smith-optics-squad-ski-goggles-sth-m00788)) |
| Anon M4 Toric — Perceive Cloudy Pink | 6 colourways ($419.99) installed with Perceive Variable Blue/Green, Sunny Onyx/Red/Bronze — no Cloudy Pink installed; bonus lens not named ([listing](https://www.altitude-sports.com/p/anon-m4-toric-goggles-bonus-perceive-lens-mfi-face-mask-unisex-ann-203551-reg)) |
| Smith I/O MAG — ChromaPop Storm Rose | 10 colourways ($334.99): Sun Red/Green/Black/Platinum, Everyday Rose Gold/Green/Red/Blue — no Storm Rose Flash ([listing](https://www.altitude-sports.com/p/smith-optics-io-mag-goggles-unisex-sth-m00427)) |
| Oakley Sub Temp RC GORE-TEX Jacket | no Sub Temp RC in results (Oakley results are goggles) |
| Burton Frostner Down Jacket | only a kids' Frostner 2L Anorak listed, no Frostner Down |
| Salomon Stance 3L Shell | search shows only Stance skis; the old Stance 3L Long Shell listing has no purchasable variants |
| Arc'teryx Macai Down Jacket | no Arc'teryx in results |
| Arc'teryx Sabre Jacket | no Arc'teryx in results |
| Arc'teryx Rush Jacket | no Arc'teryx in results |

</details>

<details>
<summary>MEC: 46 not found</summary>

| Item | Reason |
| --- | --- |
| K2 Disruption 78C | no results |
| Salomon Stance 84 | no Stance 84 listed |
| Salomon QST 92 | lists QST 94/100/106, no QST 92 |
| K2 Mindbender 89Ti | lists Mindbender 96 W / 111, no 89Ti |
| K2 Poacher | no results |
| Völkl Mantra M7 | no results |
| Atomic Redster X9S Revoshock S | no results |
| Black Crows Camox | only Camox Freebird 97 / 95 (different model) |
| Black Crows Corvus | no Corvus listed |
| Völkl Blaze 114 | no results |
| K2 Raygun | not listed |
| Salomon Assassin | not listed |
| Burton Custom Camber | not listed |
| Burton Process Flying V | not listed |
| K2 Party Platter | not listed |
| Burton Family Tree Hometown Hero | not listed |
| Salomon Huck Knife | not listed |
| Atomic Hawx Prime 90 GW | only Hawx Prime XTD 95 BOA GW W (different model) |
| K2 Anthem 85 BOA | no results |
| Salomon S/Pro Supra BOA 120 | lists S/Pro Supra Dual BOA 130 and Shift Supra models, no S/Pro Supra BOA 120 |
| Salomon Launch BOA SJ | no Launch listed |
| Burton Ruler BOA | no results |
| K2 Maysis Clicker X HB | no results |
| Burton Photon Step On | no results |
| Salomon Strive 10 GW | lists Strive 12 GW / Strive 14 MN, no Strive 10 |
| Atomic Warden MNC 13 | no results |
| Marker Jester 16 ID | no results |
| Burton Freestyle Re:Flex | no results |
| Union Force | no results |
| Smith Mission MIPS | no results |
| Oakley MOD3 MIPS | no results |
| Oakley MOD5 MIPS | no results |
| Smith Squad — Yellow Sensor Mirror | 6 colourways ($179.95): Sun Black, Sun Green, Everyday Rose/Red/other installed; yellow only as the spare lens — no Yellow Sensor Mirror installed ([listing](https://www.mec.ca/en/product/6043-052/smith-squad-goggles-unisex)) |
| Salomon Radium Pro S Sigma | only Radium Prime Sigma (with/without Photo) listed, no Radium Pro S Sigma |
| Oakley Line Miner L — Prizm Sapphire | no results |
| Anon M4 Toric — Perceive Cloudy Pink | no results |
| Smith 4D MAG — ChromaPop Sun Black | only Black / ChromaPop Sun Green offered ($399.95), Storm Rose spare — no Sun Black ([listing](https://www.mec.ca/en/product/6026-531/smith-4d-mag-goggles-unisex)) |
| Oakley Flight Deck L — Prizm Torch | no results |
| Oakley Sub Temp RC GORE-TEX Jacket | no results |
| Salomon Brilliant 2.0 Jacket | no Brilliant jacket among 3 results |
| Burton Covert 2.0 Insulated | no results |
| Burton Frostner Down Jacket | no results |
| Salomon Stance 3L Shell | no Stance 3L among 7 results |
| Arc'teryx Macai Down Jacket | no Macai among 16 Arc'teryx results |
| Arc'teryx Rush Jacket | no Rush jacket in results |
| Burton [ak] Cyclic GORE-TEX 2L | no results |

</details>
