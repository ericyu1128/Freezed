# Price check — 2026-11-05 (changed items only)

Re-check of the 13 catalogue items changed in the 2026-11-05 Canadian-availability swap (see `docs/catalogue-swap-2026-11-05.md`), at the five CA retailers: 65 item × retailer checks, all dated 2026-11-05. Every other item keeps its 2026-11-04 result (`docs/price-check-2026-11-04.md`).

Same rules as 2026-11-04: exact current model only, prices read off the retailer page on the day (evo: in-stock variants only), a listing with no model year accepted when it is the exact model, older-year listings counted as not found, and anything unclear left `null` as ambiguous. For goggles the installed lens must be the catalogue lens.

## Counts per retailer

| Retailer | Found | Ambiguous | Not found | Blocked | Checked |
| --- | ---: | ---: | ---: | ---: | ---: |
| Evo Canada (`evo-ca`) | 11 | 0 | 2 | 0 | 13 |
| Sport Chek (`sportchek`) | 3 | 2 | 8 | 0 | 13 |
| Sporting Life (`sportinglife`) | 6 | 1 | 6 | 0 | 13 |
| Altitude Sports (`altitude-sports`) | 10 | 0 | 3 | 0 | 13 |
| MEC (`mec`) | 1 | 0 | 12 | 0 | 13 |
| **Total** | **31** | **3** | **31** | **0** | **65** |

Every changed item is found at 2 or more Canadian shops (the swap required it). No page was blocked. salomon.com showed a human check; it was completed by the user, not by the tool.

## Per item

### K2 BFC 90 (`boot-k2-bfc-90`) — found at 2 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | found | $449.99 | [K2 BFC 90 Ski Boots 2027](https://www.evo.com/en-ca/products/280591-k2-bfc-90-ski-boots-2027) | 5 of 5 variants in stock, all $449.99 |
| Sport Chek | found | $449.99 | [K2 BFC 90 Men's Ski Boots](https://www.sportchek.ca/en/pdp/k2-bfc-90-men-s-ski-boots-86952668f.html) | no model year on listing (a separate 2024-labelled listing exists) |
| Sporting Life | not found | — | — | no K2 BFC listed |
| Altitude Sports | not found | — | — | lists BFC 95 W / 85 W / 110 / 120, no BFC 90 |
| MEC | not found | — | — | no results |

### Dalbello Veloce Space 100 BOA (`boot-dalbello-veloce-space-100`) — found at 2 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | not found | — | — | lists Veloce Space 120 Dual / 105 W Dual, no Veloce Space 100 |
| Sport Chek | found | $549.99 | [Dalbello Veloce Space Men's 100 BOA Ski Boots](https://www.sportchek.ca/en/pdp/dalbello-veloce-space-men-s-100-boa-ski-boots-84810488f.html) | no model year on listing |
| Sporting Life | not found | — | — | no Dalbello listed |
| Altitude Sports | found | $549.99 | [Dalbello Veloce Space 100 Ski Boots](https://www.altitude-sports.com/p/dalbello-veloce-space-100-ski-boots-dlb-d2503103) | in stock; product code D2503103 matches Dalbello's 2027 page |
| MEC | not found | — | — | no Dalbello listed |

### Smith Descend MIPS (`helmet-smith-descend-mips`) — found at 5 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | found | $185.00 | [Smith Descend MIPS Helmet](https://www.evo.com/en-ca/products/267118-smith-descend-mips-helmet) | 31 in-stock variants, all $185.00 |
| Sport Chek | found | $190.00 | [Smith Descend MIPS Ski & Snowboard Helmet](https://www.sportchek.ca/en/pdp/smith-descend-mips-ski-snowboard-helmet-84741098f.html) | no model year on listing |
| Sporting Life | found | $190.00 | [Smith Descend MIPS Snow Helmet](https://www.sportinglife.ca/en-CA/equipment/ski/ski-helmets/adult-ski-helmets/descend-mips-snow-helmet/25922280.html) | in stock |
| Altitude Sports | found | $184.99 | [Smith Descend MIPS Helmet - Unisex](https://www.altitude-sports.com/p/smith-optics-descend-mips-helmet-sth-e00567) | 15 in-stock variants, all $184.99 |
| MEC | found | $189.95 | [Smith Descend MIPS Snow Helmet - Unisex](https://www.mec.ca/en/product/6037-022/smith-descend-mips-snow-helmet-unisex) | all 6 colourways $189.95 |

### Oakley Target Line L — Persimmon (`goggle-oakley-target-line-persimmon`) — found at 3 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | found | $100.00 | [Oakley Target Line L Goggles — Persimmon](https://www.evo.com/en-ca/products/200629-oakley-target-line-l-goggles) | in-stock Persimmon colourways (Matte Black, Matte White, Fern) all $100.00; Prizm Persimmon and Fire Iridium+Persimmon variants are different lenses |
| Sport Chek | **ambiguous** | — | [Oakley Target Line Ski & Snowboard Goggles - Anti-Fog](https://www.sportchek.ca/en/pdp/oakley-target-line-ski-snowboard-goggles-anti-fog-ski-goggles-13461356f.html) | $100.00, but the listing names neither the size (L/M/S) nor the lens |
| Sporting Life | found | $100.00 | [Oakley Target Line L Snow Goggle — Persimmon](https://www.sportinglife.ca/en-CA/equipment/ski/ski-goggles/adult-goggles/target-line-l-snow-goggle/25919969.html) | in stock; listing names Persimmon lens |
| Altitude Sports | found | $99.99 | [Target Line L Goggles - Matte Black - Persimmon Lens](https://www.altitude-sports.com/p/oakley-target-line-l-googles-matte-black-persimmon-lens-oak-ttll) | in stock |
| MEC | not found | — | — | no results |

### Salomon Radium Pro S Sigma (`goggle-salomon-radium-pro`) — found at 2 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | not found | — | — | lists Radium Pro Sigma (not the S) and Radium Prime |
| Sport Chek | not found | — | — | no Radium listed |
| Sporting Life | found | $199.95 | [Salomon Radium Pro S Sigma Snow Goggle](https://www.sportinglife.ca/en-CA/equipment/ski/ski-goggles/adult-goggles/radium-pro-s-sigma-snow-goggle/25920352.html) | in stock; Black Gold install lens + Silver Pink bonus lens (matches the updated catalogue item) |
| Altitude Sports | found | $199.95 | [Salomon Radium Pro S Sigma Goggles with Extra Lens](https://www.altitude-sports.com/p/salomon-radium-pro-s-sigma-goggles-with-extra-lens-sal-l47891000) | in stock; product code L47891000 matches Salomon's page |
| MEC | not found | — | — | only Radium Prime Sigma listed |

### Anon M4 Toric — Perceive Variable Blue (`goggle-burton-anon-m4`) — found at 2 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | found | $419.99 | [Anon M4 Toric MFI Goggles — Black / Perceive Variable Blue + Cloudy Pink](https://www.evo.com/en-ca/products/267745-anon-m4-toric-mfi-goggles) | 1 Black/Variable Blue variant in stock at $419.99 |
| Sport Chek | **ambiguous** | — | [Anon M4 Toric Ski & Snowboard Goggles](https://www.sportchek.ca/en/pdp/anon-m4-toric-ski-snowboard-goggles-84713634f.html) | $419.99, but the listing doesn't name its lens; Variable Blue not confirmed |
| Sporting Life | **ambiguous** | — | [Anon M4 Toric Snow Goggle + MFI Face Mask](https://www.sportinglife.ca/en-CA/equipment/ski/ski-goggles/adult-goggles/m4-toric-snow-goggle-%2B-mfi%23174--face-mask/25933606.html) | 3 listings ($419.99, $419.99, $249.98), none names its lens or colourway |
| Altitude Sports | found | $419.99 | [M4 Toric Goggles - Black - Perceive Variable Blue](https://www.altitude-sports.com/p/anon-m4-toric-goggles-bonus-perceive-lens-mfi-face-mask-unisex-ann-203551-reg) | in stock |
| MEC | not found | — | — | no results |

### Salomon S/Pro Supra S BOA 120 (`boot-salomon-spro-supra-120`) — found at 2 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | found | $849.95 | [Salomon S/Pro Supra S BOA 120 Ski Boots 2027](https://www.evo.com/en-ca/products/282177-salomon-s-pro-supra-s-boa-120-ski-boots-2027) | 6 in-stock variants, all $849.95 |
| Sport Chek | not found | — | — | lists S/Pro Supra X110 / 100 (2026) and older Supra boots, no S BOA 120 |
| Sporting Life | not found | — | — | no S/Pro Supra listed |
| Altitude Sports | found | $999.99 | [SALOMON S/Pro Supra S BOA 120 Alpine Ski Boots - Men's](https://www.altitude-sports.com/p/salomon-spro-supra-s-boa-120-alpine-ski-boots-mens-sal-l45420600-sea26) | season code sea26 (2026/27); in stock |
| MEC | not found | — | — | lists S/Pro Supra Dual BOA 130 and Shift Supra boots, no S BOA 120 |

### Atomic Strive 14 MN (`binding-atomic-strive-14-mn`) — found at 2 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | found | $309.99 | [Atomic Strive 14 MN Ski Bindings 2027](https://www.evo.com/en-ca/products/283125-atomic-strive-14-mn-ski-bindings-2027) | 4 of 4 variants in stock, all $309.99 |
| Sport Chek | not found | — | — | no Strive 14 MN listed |
| Sporting Life | found | $309.99 | [Atomic Strive 14 MN 100 Ski Binding [2027]](https://www.sportinglife.ca/en-CA/equipment/ski/ski-bindings/adult-ski-bindings/strive-14-mn-100-ski-binding-2027/25932919.html) | 90 / 100 / 115 mm brake listings all $309.99, in stock |
| Altitude Sports | not found | — | — | no Atomic Strive listed |
| MEC | not found | — | — | no results |

### Marker Jester X 16 MWerks (`binding-marker-jester-x-16`) — found at 2 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | found | $499.99 | [Marker Jester X MWerks 16 Ski Bindings 2027](https://www.evo.com/en-ca/products/269548-marker-jester-x-mwerks-16-ski-bindings-2026) | 3 of 3 brake widths in stock, all $499.99 |
| Sport Chek | not found | — | — | no Jester listed |
| Sporting Life | found | $499.99 | [Marker Jester X 16 MWerks 120 Ski Binding [2027]](https://www.sportinglife.ca/en-CA/equipment/ski/ski-bindings/adult-ski-bindings/jester-x-16-mwerks-120-ski-binding-2027/25934506.html) | 90 / 105 / 120 mm listings all $499.99, in stock |
| Altitude Sports | not found | — | — | only a Jester brake listed |
| MEC | not found | — | — | no results |

### Burton Cultivator Flat Top (`board-burton-cultivator`) — found at 2 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | found | $499.99 | [Burton Cultivator Snowboard 2027](https://www.evo.com/en-ca/products/284959-burton-cultivator-snowboard-2027) | 10 in-stock variants, all $499.99 |
| Sport Chek | not found | — | [Burton Cultivator Men's Snowboard 2026](https://www.sportchek.ca/en/pdp/burton-cultivator-men-s-snowboard-2026-86503491f.html) | older-year only: 2026-labelled at $449.99 (the 2027 is $499.99 at Burton, evo and Altitude) |
| Sporting Life | not found | — | — | no Cultivator listed |
| Altitude Sports | found | $499.99 | [BURTON Cultivator Flat Top Snowboard](https://www.altitude-sports.com/p/burton-cultivator-flat-top-snowboard-btn-311741-sea26) | season code sea26 (2026/27); 12 in-stock variants, all $499.99 |
| MEC | not found | — | — | MEC lists no snowboards |

### Burton Covert 2L Insulated (`jacket-burton-covert`) — found at 2 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | found | $359.99 | [Burton Covert 2L Insulated Jacket - Men's](https://www.evo.com/en-ca/products/287076-burton-covert-2l-insulated-jacket-men-s) | 12 of 12 variants in stock, all $359.99 |
| Sport Chek | not found | — | — | no Covert listed |
| Sporting Life | not found | — | — | no Covert listed |
| Altitude Sports | found | $349.99 | [Burton Covert 2L Insulated Jacket - Men's](https://www.altitude-sports.com/p/burton-covert-2l-insulated-jacket-mens-btn-3111910) | 12 in-stock variants, all $349.99 |
| MEC | not found | — | — | no results |

### Burton Reserve GORE-TEX 2L Insulated (`jacket-burton-reserve-gtx-insulated`) — found at 3 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | found | from $329.57 | [Burton Reserve GORE-TEX 2L Insulated Jacket - Men's](https://www.evo.com/en-ca/products/263516-burton-reserve-gore-tex-2l-insulated-jacket-men-s) | 22 in-stock variants at $329.57 or $579.99 by colourway; no model year on listing |
| Sport Chek | not found | — | — | only the women's GORE-TEX 2L Insulated and men's non-insulated / non-GORE-TEX Reserve jackets |
| Sporting Life | found | $346.98 | [Burton Men's Reserve GORE-TEX 2L Insulated Jacket](https://www.sportinglife.ca/en-CA/men/clothing/coats-jackets/snowboard-jackets/mens-reserve-gore-tex%23174--2l-insulated-jacket/25929612.html) | sale price (regular $579.99), Fiesta Pro colourway; no model year on listing |
| Altitude Sports | found | $579.99 | [Reserve GORE-TEX 2L Insulated Jacket - Men's](https://www.altitude-sports.com/p/burton-mens-reserve-goretex-2l-insulated-jacket-btn-304111) | 22 in-stock variants, all $579.99 |
| MEC | not found | — | — | no results |

### Rossignol Proclivity 3L Shell (`jacket-rossignol-proclivity-3l`) — found at 2 of 5

| Retailer | Result | Price (CAD) | Listing | Note |
| --- | --- | ---: | --- | --- |
| Evo Canada | found | $675.00 | [Rossignol Proclivity 3L Shell Ski Jacket - Men's](https://www.evo.com/en-ca/products/281657-rossignol-proclivity-3l-shell-ski-jacket-men-s) | 8 of 8 variants in stock, all $675.00 |
| Sport Chek | not found | — | — | no Proclivity listed |
| Sporting Life | not found | — | — | only the women's Proclivity 3L jacket and bib listed |
| Altitude Sports | found | $674.99 | [Rossignol Men's Proclivity 3L Shell Ski Jacket](https://www.altitude-sports.com/p/rossignol-mens-proclivity-3l-shell-ski-jacket-rss-rlpmj12) | 10 in-stock variants, all $674.99 |
| MEC | not found | — | — | no Proclivity among results |

## Ambiguous — please review

- **Oakley Target Line L — Persimmon** at Sport Chek: $100.00, but the listing names neither the size (L/M/S) nor the lens ([listing](https://www.sportchek.ca/en/pdp/oakley-target-line-ski-snowboard-goggles-anti-fog-ski-goggles-13461356f.html))
- **Anon M4 Toric — Perceive Variable Blue** at Sport Chek: $419.99, but the listing doesn't name its lens; Variable Blue not confirmed ([listing](https://www.sportchek.ca/en/pdp/anon-m4-toric-ski-snowboard-goggles-84713634f.html))
- **Anon M4 Toric — Perceive Variable Blue** at Sporting Life: 3 listings ($419.99, $419.99, $249.98), none names its lens or colourway ([listing](https://www.sportinglife.ca/en-CA/equipment/ski/ski-goggles/adult-goggles/m4-toric-snow-goggle-%2B-mfi%23174--face-mask/25933606.html))
