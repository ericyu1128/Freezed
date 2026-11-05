# Catalogue audit — November 2026

> 2026-11-05: 12 audited items were swapped or updated for Canadian availability, and one boot was added; see
> `docs/catalogue-swap-2026-11-05.md`. The rows below describe the catalogue as it was audited.

All 58 catalogue items were checked against the web on 2026-11-04 for two things:

1. **Is it a current product?** It must be sold as a 2025/26 ("2026") or 2026/27 ("2027") model.
2. **Do the key specs match?** That means waist width (skis), flex (ski boots, snowboards, snowboard boots and
   bindings), VLT (goggles) and DIN range (ski bindings). For helmets and jackets I checked construction and
   insulation, since those are what the matcher and the images read.

Sources are mostly major retailers (evo, REI, Backcountry, Ski Essentials, Snowleader), plus manufacturer pages
where search surfaced them. Fields outside the key specs, such as available lengths, weights, cores and turn
radius, were **not** systematically verified. Where a source showed a clear difference I noted it, but I didn't
change it.

## Summary

| Status | Count | Meaning |
| --- | ---: | --- |
| ✅ verified | 28 | Current model found and key specs match |
| ⚠️ spec mismatch | 15 | Product exists but a spec was wrong. **Fixed in the catalogue** using the cited source |
| ⛔ discontinued | 5 | No 2025/26+ listing found and a successor exists. **Not changed: replacement proposed below** |
| ❓ not found | 2 | No such product exists. **Not changed: replacement proposed below** |
| ❔ unverified | 8 | Key specs match, but I couldn't confirm a 2025/26 or 2026/27 model year. Left as is |

**Your two specific questions:**

- **"Völkl Secret Pro 105 W": you were right, it doesn't exist.** Nothing anywhere lists a boot by that name.
  *Secret* is Völkl's women's **ski** line (Secret 80 / 92 / 96 / 102). The only Völkl-branded women's boot that
  turned up was a Quantum Free 105 W touring boot, and that listing was out of stock. Replacement proposed below.
- **"Burton Anon": the brand should be Anon.** Anon is owned by Burton, but it sells under its own name
  (burton.com lists it as "Anon M4 Goggles"). **Fixed:** brand is now `Anon` and the name `M4 Toric — Perceive
  Cloudy Pink`. The `searchTerm` override that was only there to work around this is gone.

## Proposed replacements: waiting for your OK

These items are still in the catalogue unchanged. Reply with the ones you approve and I'll swap them in. Each
swap means new specs, new en + zh copy and a new id, so saved setups that point at the old id will simply skip
that item.

| Current item | Status | Proposed replacement | Verified facts | Source |
| --- | --- | --- | --- | --- |
| Völkl Secret Pro 105 W (`boot-volkl-secret-105`) | not found | **Salomon S/Pro Supra BOA 105 W** | 2026 model, women's, flex 105, 100 mm last, BOA, GripWalk | [evo](https://www.evo.com/products/268327-salomon-s-pro-supra-boa-105-w-ski-boots-women-s-2026) |
| K2 Method 100 MV (`boot-k2-method-100`) | not found | **K2 Method Pro** | flex 100, 102 mm last; 2027 listing | [Aspen Ski and Board](https://www.aspenskiandboard.com/products/k2-method-pro-mens-ski-boots-2027), [evo (2025)](https://www.evo.com/products/252807-k2-fl3x-method-pro-ski-boots-2025) |
| Atomic Backland 107 (`ski-atomic-backland-107`) | discontinued | **Atomic Backland 109** | 2026/2027 model, waist 109–110 mm by length | [REI](https://www.rei.com/product/C11356/atomic-backland-109-skis-mens-20262027), [evo](https://www.evo.com/en-ca/products/254136-atomic-backland-109-skis-2026) |
| Salomon Shift Pro 110 W (`boot-salomon-shift-pro-110w`) | discontinued | **Salomon Shift Alpha BOA 115 W** | 2026 women's freeride/touring boot, flex 115 | [evo](https://www.evo.com/en-ca/alpine-touring-ski-boots/salomon-shift-alpha-boa-115-w-womens) |
| Salomon Pioneer LT Visor (`helmet-salomon-pioneer-lt`) | discontinued | **Salomon Pioneer LT** (no visor) | 2026 listings exist | [Warehouse One](https://www.warehouse-one.de/en/salomon/pioneer-lt-helmet-2026-black.html) |
| Smith Vantage MIPS (`helmet-smith-vantage-mips`) | discontinued | **Smith Vantage 2 MIPS** | 2026 model, 21 vents, MIPS + Koroyd, BOA 360 | [Aspen Ski and Board](https://www.aspenskiandboard.com/products/smith-vantage-2-mips-helmet-2026) |
| Burton Genesis X (`binding-burton-genesis-x`) | discontinued | **Burton Cartel X Re:Flex** (closest flex) or Burton Genesis Re:Flex | Cartel X: 2026/2027, stiff, 7/10. Genesis Re:Flex: 2026, medium, 6/10 | [Comor Sports](https://comorsports.com/products/burton-mens-cartel-x-re-flex-snowboard-bindings-2026-black-red), [Absolute Snow](https://www.absolute-snow.com/burton-cartel-x-reflex-snowboard-bindings-men-2026), [Ski Barn](https://www.skibarn.com/products/burton-mens-genesis-binding) |

## Things that need your decision (not changed)

- **Step-in boots paired with strap bindings.** The **K2 Maysis Clicker X HB** only works with Clicker X HB
  bindings, and the **Burton Photon Step On** only works with Step On bindings. The catalogue has neither binding
  type, so the matcher can recommend one of these boots next to, say, a Union Force, and that combination doesn't
  work. Options: swap both for strap versions (Maysis, Photon BOA), or add compatible bindings. I haven't
  verified the strap versions yet.
- **Oakley Sub Temp RC price tier.** It's an insulated 2L GORE-TEX jacket listed around €470 on Oakley's site, but
  the catalogue has it as `budget`. Tier drives ranking, so I left it for you to decide (`mid-range` or `premium`).
- **Salomon Launch BOA SJ levels.** Retailers pitch it at intermediate–advanced riders; the catalogue has
  beginner–intermediate. That's an editorial call, so I left it.
- **QST 92 vs QST 94.** REI still sells a QST 92 package for 2026/27, but Salomon's mainline replacement is the
  QST 94 (94 mm waist). You might want to move to the 94.

A 2026 or a 2027 model-year label was treated as current either way; several retailers already label this
season's stock "2027".

## Fixes applied (all with sources)

| Item | Field | Was | Now |
| --- | --- | --- | --- |
| Atomic Redster X9S Revoshock S | `waistWidth` | 72 | **65** |
| Black Crows Corvus | `waistWidth` | 109 | **110** |
| Burton Custom Camber | `flexRating` | 7 / 10 | **6 / 10** |
| Anon M4 Toric | `brand` | Burton | **Anon** (name no longer repeats "Anon") |
| Anon M4 Toric | `vlt` | 46 | **53** (Perceive Cloudy Pink, S1) |
| Anon M4 Toric | `spareLens` | Sunny Onyx, 6% VLT | **Bonus lens included (tint varies by colourway)**. Sunny Onyx couldn't be verified, and match copy no longer claims a "bright spare" |
| Salomon Radium Pro Sigma | name / `lensTint` / `vlt` / `spareLens` | Radium Pro Sigma, Sigma Sky Blue, 28, Low light 62% | **Radium Pro S Sigma, Sigma Silver Pink, 35, Sigma Light Blue 52%** |
| Smith I/O MAG — Storm Rose Flash | `spareLens` | Sun Platinum, 15% VLT | **13% VLT** |
| Smith 4D MAG — Sun Black | `spareLens` | Storm Rose Flash, 50% VLT | **ChromaPop Storm Blue Sensor Mirror** |
| Oakley Flight Deck L — Prizm Torch | `vlt` | 19 | **17** |
| Oakley MOD5 MIPS | `ventControl` + copy | BOA 360 | **BOA 270** (360 is the I.C.E. edition) |
| Oakley Sub Temp RC | name / `insulation` / `warmth` / `temps` + copy | "Shell", uninsulated, 1, spring/moderate | **"Jacket", 80 g body / 60 g sleeves synthetic, 3 (same as the Covert 2.0 on this scale), moderate/freezing** |
| Salomon Brilliant | name / `insulation` / `waterproofing` | Brilliant Insulated, 80 g AdvancedSkin Warm, 10k/10k | **Brilliant 2.0, PrimaLoft Black Eco, AdvancedSkin Dry 20K/20K** |
| Burton Covert 2.0 | `insulation` / `waterproofing` | 40 g Thermolite / 60 g body, 10k/10k | **80 g ThermacoreECO, DRYRIDE 2L 10K/5K** |
| Burton Frostner | name / `insulation` / `waterproofing` + copy | "Frostner 2L Down", 650-fill + Thermolite hybrid, 10k/10k | **"Frostner Down", 800-fill RDS down, DRYRIDE 2L 15,000 mm** |
| Arc'teryx Macai | `waterproofing` + copy | GORE-TEX 3L, N80p | **GORE-TEX 2L ePE, 100D face fabric** (Arc'teryx's own page) |
| Salomon Strive 10 | name / `dinRange` / `soleCompatibility` / `weight` | Strive 10, 3.5–10, Alpine, 780 g (pair) | **Strive 10 GW, 3–10, Alpine ISO 5355 / GripWalk ISO 23223, 920 g (per binding)** |

These change some recommendations, most visibly goggles for moderate conditions (the Flight Deck now sits 1%
below the 18–40% window) and jackets for spring (the Sub Temp RC is no longer a spring shell). The level-fit
property test still passes at 0 violations. The top-pick snapshot was re-recorded, and the diff is in the commit.

## Every item

| # | Item | Status | Notes | Source |
| ---: | --- | --- | --- | --- |
| 1 | K2 Disruption 78C | ❔ unverified | Waist 78 ✓, lengths ✓. k2snow.com only has 2025 (= 2024/25) and 2024 pages; no 2026 found | [K2](https://k2snow.com/en-ch/p/disruption-78c-mens-skis-2025), [Freeride](https://www.freeride.com/gear/skis/k2-disruption-78c.html) |
| 2 | Salomon Stance 84 | ✅ verified | 2026, waist 84 ✓. Lengths are 161/169/177/185 (catalogue 160/168/176/184; not changed) | [Ski Essentials](https://www.skiessentials.com/2026-ski-test/skis/2026-salomon-stance-84) |
| 3 | Salomon QST 92 | ✅ verified | 92 mm. Sold as a 2026/27 package at REI; the QST 94 replaced it as Salomon's mainline ski | [REI](https://www.rei.com/product/C11370/salomon-qst-92-skis-with-bindings-20262027), [Blister](https://blisterreview.com/gear-reviews/2025-2026-salomon-qst-94) |
| 4 | K2 Mindbender 89Ti | ✅ verified | 2026, waist 89 ✓ (lengths 164–188) | [Ski Essentials](https://www.skiessentials.com/products/2026-k2-mindbender-89ti-skis-ks250949) |
| 5 | Atomic Bent 100 | ✅ verified | 2026, waist 100 ✓. Lengths are 158/165/172/179/186 (not changed) | [evo](https://www.evo.com/en-ca/products/267987-atomic-bent-100-skis-2026) |
| 6 | K2 Poacher | ❔ unverified | Waist 96 ✓; newest model-year listing is 2024 | [Snowleader](https://www.snowleader.com/en/poacher-2024-K2__01107.html) |
| 7 | Völkl Mantra M7 | ✅ verified | 2026, sold as "M7 Mantra". Waist 96 ✓, lengths ✓ | [Snowleader](https://www.snowleader.com/en/m7-mantra-2026-VOLK00719.html) |
| 8 | Atomic Redster X9S Revoshock S | ⚠️ spec mismatch | **Waist 65, not 72** (114/65/99.5 @ 174, 14.8 m). 2026 and 2027 exist. Lengths are 166/174/182 (not changed) | [Ski Essentials](https://www.skiessentials.com/2026-ski-test/skis/2026-atomic-redster-x9s), [Buckmans](https://buckmans.com/product/51339/atomic-redster-x9s-skis-atomic-icon-12-gw-bindings) |
| 9 | Black Crows Camox | ✅ verified | 2026, waist 97 ✓ | [Snowleader](https://www.snowleader.com/en/camox-2026-BLAC00990.html) |
| 10 | Black Crows Corvus | ⚠️ spec mismatch | **2026 waist is 110, not 109** (140/110/120). Lengths are 176/181/186 (not changed) | [Snowleader](https://www.snowleader.com/en/corvus-2026-BLAC00996.html), [Yardbarker](https://www.yardbarker.com/skiing/articles/review_2026_blackcrows_corvus/s1_17376_42861218) |
| 11 | Atomic Backland 107 | ⛔ discontinued | No listing newer than 2024. Atomic's 2026 line has the Backland 109 and the Backland 108 W | [Ski Essentials (2024)](https://www.skiessentials.com/products/2024-atomic-backland-107-skis), [Monod (108 W 2026)](https://www.monodsports.com/products/backland-108-w-skis-2026) |
| 12 | Völkl Blaze 114 | ✅ verified | 2026, waist 114 ✓. Lengths are 176/184/192 (not changed) | [evo](https://www.evo.com/products/269718-volkl-blaze-114-skis-2026), [Völkl](https://volkl.com/en-se/p/blaze-114-skis-2026) |
| 13 | K2 Raygun | ❔ unverified | Flex medium (≈5) ✓. Waist varies by size (156 = 247; catalogue 252). No 2026 page found | [evo size chart](https://www.evo.com/en-ca/k2-snowboard-size-chart), [Backcountry](https://www.backcountry.com/k2-snowboards-raygun-snowboard) |
| 14 | Salomon Assassin | ✅ verified | 2026. Waist 253 @ 156 / 255 @ 159 ✓. Flex sources conflict (medium; 3/5–4/5); 6/10 is plausible | [Backcountry](https://www.backcountry.com/salomon-assassin-snowboard-2026), [The Snowboard Shop](https://thesnowboardshop.co.uk/products/salomon-assassin-snowboard-2026) |
| 15 | Burton Custom Camber | ⚠️ spec mismatch | **Flex 6/10, not 7/10** ("medium" elsewhere). 2026 exists; waist 248–271 by size | [snowboards.com](https://snowboards.com/product/52932/burton-mens-custom-camber-snowboard), [getboards](https://www.getboards.com/burton-men-s-custom-camber-snowboard-2026) |
| 16 | Burton Process Flying V | ✅ verified | 2026. Waist 249–262 (157 = 252) ✓. No numeric flex published in results | [Snowleader](https://www.snowleader.com/en/process-fv-2026-BURT02571.html), [Steep and Cheap](https://www.steepandcheap.com/burton-process-flying-v-snowboard-2026) |
| 17 | K2 Party Platter | ❔ unverified | Flex medium 5/10 ✓, waist 147 = 262 ✓. Newest listing is 2024; sizes are 138–157 | [evo](https://www.evo.com/snowboards/k2-party-platter-snowboard), [Board and Kayak](https://boardandkayak.com/products/k2-party-platter-snowboard) |
| 18 | Burton Family Tree Hometown Hero | ✅ verified | 2026, flex 7/10 ✓, waist 160 = 258 ✓ | [Elevation 107](https://www.elevation107.com.au/products/burton-family-tree-hometown-hero-snowboard-2026), [Backcountry](https://www.backcountry.com/burton-family-tree-hometown-hero-snowboard-2026) |
| 19 | Salomon Huck Knife | ✅ verified | 2026, flex 3/5 (medium; matches 6/10), waist 248–262 ✓ | [Snowleader](https://www.snowleader.com/en/huck-knife-2026-SSNB00375.html) |
| 20 | Atomic Hawx Prime 90 GW | ✅ verified | 2026, flex 90 ✓, 100 mm last ✓, GripWalk ✓ | [evo](https://www.evo.com/products/268110-atomic-hawx-prime-90-ski-boots-2026) |
| 21 | K2 Anthem 85 BOA | ✅ verified | 2026, flex 85 ✓, 97–100 mm last ✓ | [evo](https://www.evo.com/products/266105-k2-anthem-85-boa-ski-boots-women-s-2026) |
| 22 | Salomon Shift Pro 110 W | ⛔ discontinued | Flex 110 ✓, last 100 ✓, but the newest listing is 2025 (= 2024/25). The 2026 women's line is the Shift Alpha BOA 115 W | [evo (2025)](https://www.evo.com/products/254073-salomon-shift-pro-110-w-alpine-touring-ski-boots-women-s-2025) |
| 23 | K2 Method 100 MV | ❓ not found | No boot by this name. Real models: K2 Method Pro (100 flex, 102 mm) and K2 Recon 100 MV | [evo (Method Pro)](https://www.evo.com/products/252807-k2-fl3x-method-pro-ski-boots-2025) |
| 24 | Salomon S/Pro Supra BOA 120 | ✅ verified | 2026 (cosmetic changes only), flex 120 ✓, last 100 ✓ | [evo](https://www.evo.com/products/268292-salomon-s-pro-supra-boa-120-ski-boots-2026) |
| 25 | Atomic Hawx Ultra XTD 130 BOA | ✅ verified | 2026 (some label it 2027), flex 130 ✓, last 98 ✓ | [evo](https://www.evo.com/products/268230-atomic-hawx-ultra-xtd-130-boa-alpine-touring-ski-boots-2026), [Comor](https://comorsports.com/products/atomic-hawx-ultra-xtd-130-boa-ski-boot-2026-dust-black) |
| 26 | Völkl Secret Pro 105 W | ❓ not found | No such boot. *Secret* is a Völkl women's ski line | [evo (Secret ski)](https://www.evo.com/skis/volkl-secret-womens), [La Cordée](https://www.lacordee.com/en/products/volkl-w-s-quantum-free-105-w-alpine-touring-ski-boots-dal-d210800600) |
| 27 | Salomon Launch BOA SJ | ✅ verified | 2026, flex 4/10 ✓. Retailers target intermediate–advanced riders | [Ski Barn](https://www.skibarn.com/products/salomon-mens-launch-boa-sj-boot), [Blauer](https://blauerboardshop.com/products/salomon-launch-boa-sj-2026) |
| 28 | Burton Ruler BOA | ✅ verified | 2026, flex 6/10 ✓ | [Ski Barn](https://www.skibarn.com/products/burton-mens-ruler-boa-boot), [Sanction](https://sanctionsnow.com/products/burton-ruler-boa-snowboard-boot-black-summit-taupe-2026) |
| 29 | K2 Maysis Clicker X HB | ✅ verified | 2026 (k2snow.com), flex 7/10 ✓. **Only works with Clicker X HB bindings** (see decisions) | [K2](https://k2snow.com/en-us/p/maysis-clicker-x-hb-mens-snowboard-boots-2526) |
| 30 | Burton Photon Step On | ✅ verified | 2026, flex stiff / 7/10, so 8/10 is plausible. **Needs Step On bindings** (see decisions) | [evo](https://www.evo.com/snowboard-packages/burton-photon-step-on-boots-x-bindings), [Snowboarding Profiles](https://snowboardingprofiles.com/burton-photon-step-on-review) |
| 31 | K2 Phase Pro | ✅ verified | 2026 (k2snow.com); ABS shell, Active Matrix vents, K2Dialed ✓ | [K2](https://k2snow.com/en-gb/p/phase-pro-mens-helmet-2026) |
| 32 | Salomon Pioneer LT Visor | ⛔ discontinued | Visor version only on 23/24 pages; the 2026 listings are the non-visor Pioneer LT | [Fall-Line](https://www.fall-line.co.uk/gear/guide/item/salomon-pioneer-lt-visor/), [Warehouse One](https://www.warehouse-one.de/en/salomon/pioneer-lt-helmet-2026-black.html) |
| 33 | Smith Mission MIPS | ❔ unverified | 14 vents ✓, AirEvac ✓. Newest model-year page is 2025 | [Ski Haus](https://skihaus.com/2024-mission-mips-helmet), [Dick's](https://www.dickssportinggoods.com/p/smith-mission-mips-snow-helmet-24fjlamssnmpsrndcssp/24fjlamssnmpsrndcssp) |
| 34 | Oakley MOD3 MIPS | ❔ unverified | Current design (reviewed Nov 2025), but no model year. A review counts ~30 vents (catalogue 12) and BOA 360 fit; single source, not changed | [Bettertrail](https://bettertrail.com/outdoor-gear/oakley-mod-3-mips-ski-helmet-review), [Oakley](https://www.oakley.com/en-gb/product/99474MP) |
| 35 | Smith Vantage MIPS | ⛔ discontinued | 21 vents ✓, Koroyd ✓, but the 2026 listing is the **Vantage 2 MIPS** | [Aspen Ski and Board](https://www.aspenskiandboard.com/products/smith-vantage-2-mips-helmet-2026), [evo](https://www.evo.com/en-ca/products/93681-smith-vantage-mips-helmet) |
| 36 | Oakley MOD5 MIPS | ⚠️ spec mismatch | Oakley lists a **BOA 270** dial (360 is the I.C.E. edition). No 2026 model year found | [Oakley](https://www.oakley.com/en-eu/product/99430MP), [evo](https://www.evo.com/helmets/oakley-mod-5-mips-helmet) |
| 37 | Smith Squad — Yellow Sensor Mirror | ✅ verified | Squad 2026 exists; Yellow Sensor Mirror = 65% VLT ✓. 2026 packs ship a ChromaPop lens + bonus yellow (catalogue says a clear spare) | [evo lens guide](https://www.evo.com/blogs/guides/smith-goggle-lens-tint-color), [Switch](https://www.switchnow.ca/products/smith-2026-squad-goggle-black-chromapop-sun-platinum) |
| 38 | Salomon Radium Pro Sigma | ⚠️ spec mismatch | No "Sigma Sky Blue 28%". Salomon's Radium Pro S Sigma ships **Silver Pink 35%** + Light Blue 52% extra. Fit claim not verified | [Salomon](https://www.salomon.com/en-ca/product/radium-pro-s-sigma-and-extra-lens-li6577), [Altitude Sports](https://www.altitude-sports.com/products/salomon-radium-pro-s-sigma-goggles-with-extra-lens-llll-sal-l47629000), [2026 listing](https://www.aspenskiandboard.com/products/salomon-radium-sigma-adult-goggles-2026) |
| 39 | Oakley Line Miner L — Prizm Sapphire | ✅ verified | Prizm Snow Sapphire Iridium 13% ✓, Large ✓ (current listings; no model year stated) | [Altitude Sports](https://www.altitude-sports.com/p/oakley-line-miner-l-snow-goggles-matte-black-prizm-sapphire-iridium-lens-oak-oo7070-04) |
| 40 | Anon M4 Toric — Perceive Cloudy Pink | ⚠️ spec mismatch | **Brand is Anon.** Cloudy Pink is **53% VLT** (not 46). 2026 bundles include a bonus lens + MFI mask; "Sunny Onyx 6%" not found | [Burton](https://www.burton.com/products/anon-m4-goggles-toric-bonus-perceive-lens-mfi-face-mask-2035519-o), [Warehouse One](https://www.warehouse-one.de/en/anon/m4s-toric-replacement-lens-2025-perceive-cloudy-pink.html) |
| 41 | Smith I/O MAG — Storm Rose Flash | ⚠️ spec mismatch | Storm Rose Flash 50% ✓. **Sun Platinum spare is 13%**, not 15% | [evo lens guide](https://www.evo.com/blogs/guides/smith-goggle-lens-tint-color), [Glisshop](https://www.glisshop.com/masque-de-ski/smith/io-mag-s-polar-blue-chromapop-sun-platinum-chromapop-storm-rose-flash21010037) |
| 42 | Smith 4D MAG — Sun Black | ⚠️ spec mismatch | Sun Black 12% ✓. **2026 bonus lens is ChromaPop Storm Blue Sensor Mirror**, not Storm Rose Flash | [Sourceboards](https://www.sourceboards.com/products/smith-4d-mag-xl-goggle-blackout-chromapop-sun-black-bonus-lens-2026), [Snowleader](https://www.snowleader.com/en/4d-mag-slate-chromapop-sun-black-SMIT01314.html) |
| 43 | Oakley Flight Deck L — Prizm Torch | ⚠️ spec mismatch | **Prizm Snow Torch Iridium is 17%**, not 19% | [Twelve Board Store](https://twelveboardstore.com.au/products/oakley-flight-deck-l-snow-goggles-matte-black-prizm-torch-iridium-gbl), [Snowlab](https://www.snowlab.co.uk/products/oakley-flight-deck-l-goggles-matte-black-prizm-snow-torch-iridium-lens) |
| 44 | Oakley Sub Temp RC GORE-TEX | ⚠️ spec mismatch | **It's insulated** (80 g body / 60 g sleeves), 2L GORE-TEX, ~€470. The catalogue had it as an uninsulated budget shell. Current as "Jacket 2.0" | [Oakley](https://www.oakley.com/en-pt/product/FOA402346), [Aspen Ski and Board](https://www.aspenskiandboard.com/products/oakley-sub-temp-rc-gore-tex-jacket-womens-2026), [Snowleader](https://www.snowleader.com/en/sub-temp-rc-gore-tex-jacket-2-0-pebble-OAKL03035.html) |
| 45 | Salomon Brilliant | ⚠️ spec mismatch | Now **Brilliant 2.0** (2026/2027): PrimaLoft Black Eco, AdvancedSkin Dry **20K/20K** | [Snowleader](https://www.snowleader.com/en/brilliant-2-0-jacket-m-deep-black-SALO09952.html), [Aspen Ski and Board](https://www.aspenskiandboard.com/collections/mens-jackets/products/salomon-brilliant-20-mens-insulated-jacket-lc2635000-2027) |
| 46 | Burton Covert 2.0 | ⚠️ spec mismatch | **80 g ThermacoreECO**, DRYRIDE 2L 10K/5K. Sold at REI, but no 2026 label found | [REI](https://rei.com/product/236123/burton-covert-20-2l-insulated-jacket-mens), [evo](https://evo.com/insulated-jackets/burton-covert-20-jacket) |
| 47 | Burton Frostner Down | ⚠️ spec mismatch | Catalogue mixed two jackets: the Frostner **2L** is an uninsulated shell, the Frostner **Down** is 800-fill RDS down, 15,000 mm. Down version's current availability is unclear | [Buckmans](https://buckmans.com/product/36968/burton-frostner-down-jacket-mens), [Absolute Snow](https://www.absolute-snow.co.uk/burton-frostner-down-insulated-ski-snowboard-jacket), [Blauer (2L 2025)](https://blauerboardshop.com/products/burton-frostner-jacket-2025) |
| 48 | Salomon Stance 3L | ❔ unverified | 3L 20K/20K ✓; newest listings are 2024 | [evo](https://www.evo.com/products/199906-salomon-stance-3l-jacket-women-s), [Altitude Sports](https://www.altitude-sports.com/p/salomon-stance-3l-long-shell-jacket-mens-sal-lc1821000) |
| 49 | Arc'teryx Macai | ⚠️ spec mismatch | 750-fill European grey goose ✓, 2026 & 2027 ✓. Arc'teryx lists the shell as **100D 2L GORE-TEX ePE** (not 3L N80p) | [Arc'teryx](https://arcteryx.com/se/en/shop/mens/macai-jacket-9890), [evo](https://www.evo.com/products/263965-arc-teryx-macai-down-jacket-men-s) |
| 50 | Arc'teryx Sabre | ✅ verified | 2026; uninsulated 3L GORE-TEX ePE 80D ✓, pit zips, RECCO ✓ | [Comor](https://comorsports.com/products/arcteryx-mens-sabre-jacket-2026-blaze), [evo](https://www.evo.com/products/279634-arc-teryx-sabre-jacket-men-s) |
| 51 | Arc'teryx Rush | ✅ verified | 2026; 3L GORE-TEX Pro ✓ | [Comor](https://comorsports.com/products/arcteryx-mens-rush-jacket-2026-graphite-black-yukon), [Ellis Brigham](https://www.ellis-brigham.com/arcteryx-mens-rush-gore-tex-pro-jacket-340907980) |
| 52 | Burton [ak] Cyclic GORE-TEX 2L | ✅ verified | 2026; 2L GORE-TEX ✓ | [Sourceboards](https://www.sourceboards.com/products/burton-mens-ak-cyclic-gore-tex-2l-jacket-blue-teal-2026) |
| 53 | Salomon Strive 10 | ⚠️ spec mismatch | **Strive 10 GW, DIN 3–10** (not 3.5–10). 2026 & 2027 ✓. 920 g per binding | [evo](https://www.evo.com/products/282279-salomon-strive-10-bindings-ski-bindings-2027), [Salomon](https://www.salomon.com/en-dk/product/strive-10-gripwalk-li9248) |
| 54 | Atomic Warden MNC 13 | ❔ unverified | DIN 4–13 ✓; no listing states a model year | [evo](https://www.evo.com/alpine-ski-bindings/atomic-warden-mnc-13), [The BackCountry](https://www.thebackcountry.com/atomic-n-warden-mnc-13-binding.html) |
| 55 | Marker Jester 16 ID | ✅ verified | 2026 (one retailer page), DIN 6–16 ✓ | [Kunstadt](https://kunstadt.com/products/markerjester16idbinding2026), [evo](https://www.evo.com/en-ca/products/241252-marker-jester-16-id-ski-bindings) |
| 56 | Burton Freestyle Re:Flex | ✅ verified | 2026; flex soft–medium ✓ | [Backcountry](https://www.backcountry.com/burton-freestyle-snowboard-binding-2026), [Ski Barn](https://skibarn.com/products/burton-mens-freestyle-binding) |
| 57 | Union Force | ✅ verified | 2026; flex 7/10 ✓ | [evo](https://www.evo.com/products/265556-union-force-snowboard-bindings-2026), [Ski Barn](https://www.skibarn.com/products/union-mens-force-20yr-binding) |
| 58 | Burton Genesis X | ⛔ discontinued | 2020 was the last Genesis X. Burton's 2026 line is the Genesis Re:Flex (medium, 6/10) | [Snowboarding Profiles](https://snowboardingprofiles.com/burton-genesis-x-review), [evo (2020)](https://www.evo.com/products/137679-burton-genesis-x-snowboard-bindings-2020) |

## Not checked

- Prices: there are none in the catalogue. They come from `data/prices.json`, entered by hand.
- Performance hexagon values are derived from specs (see `lib/performanceProfile.ts`), not sourced.
- Descriptions and "who is this for" copy are editorial. I only rewrote sentences that contradicted a fix above.
