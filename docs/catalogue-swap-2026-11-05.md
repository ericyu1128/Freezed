# Catalogue swap for Canadian availability — 2026-11-05

Goal: cut the number of top picks that no Canadian shop carries. On 2026-11-04, 21 items with zero CA
availability were the #1 pick in **2,022 of the 5,184** profile × category top picks (864 questionnaire
profiles × 6 categories; see `docs/ca-availability.md`).

**Result: 510 of 5,184** (9 items) after the swap.

Ground rules applied to every replacement:

- It is listed (found, in stock, at a clear price) at **2 or more** of the 5 Canadian shops, re-checked on 2026-11-05
  (`docs/price-check-2026-11-05.md`).
- Specs come from the manufacturer's own product page, linked below, read on 2026-11-05. Nothing comes from memory.
  Anything not on the manufacturer page was left out, for example weights the page doesn't give.
- The Freezed matching metadata (`levels`, `styles`, `genders`, `temps`) is carried over from the replaced item unless
  the manufacturer states something else. Where it doesn't, the source of each value is noted. `warmth` (jackets,
  helmets) is the Freezed 1–5 rating, not a manufacturer number.

## Which items were taken

Zero-availability items in order of top-pick count until at least 80% of the 2,022 picks (≥ 1,618) were covered:

| # | Item | Top picks | Cumulative | Outcome |
| ---: | --- | ---: | ---: | --- |
| 1 | Atomic Hawx Prime 90 GW | 216 | 216 | replaced: K2 BFC 90 |
| 2 | Smith Mission MIPS | 192 | 408 | replaced: Smith Descend MIPS |
| 3 | Salomon Stance 3L Shell | 192 | 600 | replaced: Rossignol Proclivity 3L Shell |
| 4 | Salomon Radium Pro S Sigma | 144 | 744 | updated to the version shops sell |
| 5 | Atomic Warden MNC 13 | 138 | 882 | replaced: Atomic Strive 14 MN |
| 6 | Smith Squad — Yellow Sensor Mirror | 138 | 1,020 | replaced: Oakley Target Line L — Persimmon |
| 7 | Burton Covert 2.0 Insulated | 132 | 1,152 | updated to its renamed successor, Covert 2L Insulated |
| 8 | Salomon S/Pro Supra BOA 120 | 120 | 1,272 | updated to its successor, S/Pro Supra S BOA 120 |
| 9 | Anon M4 Toric — Perceive Cloudy Pink | 114 | 1,386 | updated to the colourway shops sell |
| 10 | K2 Raygun | 108 | 1,494 | replaced: Burton Cultivator Flat Top |
| 11 | Burton Frostner Down Jacket | 96 | 1,590 | **not swapped**: no qualifying replacement (below) |
| 12 | Oakley Sub Temp RC GORE-TEX Jacket | 72 | 1,662 | replaced: Burton Reserve GORE-TEX 2L Insulated |
| 13 | Marker Jester 16 ID | 54 | 1,716 | replaced: Marker Jester X 16 MWerks |

Without the Frostner, items 1–12 covered 1,566 (77.4%), so the next item was added. Salomon Stance 84 and Marker
Jester 16 ID are tied at 54 picks. The Jester was taken because Marker's site can be read; either one clears 80%.
The swapped items now cover **1,620 of 2,022 (80.1%)**.

## Swaps

Prices are what the shop page showed on 2026-11-05 (CAD).

| Old → new | Why | Manufacturer source | Found at |
| --- | --- | --- | --- |
| Atomic Hawx Prime 90 GW → **K2 BFC 90** (`boot-k2-bfc-90`) | Atomic's 2027 entry "Hawx Prime" is only at evo. K2 BFC 90 is the closest budget men's boot at 2+ shops. K2: flex 90, 103 mm high-volume last, heat-mouldable TPU shell, GripWalk, **Ability: Beginner, Intermediate** | [k2snow.com](https://k2snow.com/en-ca/p/bfc-90-mens-ski-boots-ks261938) (2027, CA$449.99) | evo $449.99, Sport Chek $449.99 |
| Smith Mission MIPS → **Smith Descend MIPS** (`helmet-smith-descend-mips`) | Mission is gone (Smith's own product URL returns 404, and no shop lists it). Descend is Smith's mid-priced MIPS helmet: in-mould + Zonal Koroyd, 16 adjustable vents, AirEvac, ASTM F2040 / CE EN1077 Class B / CPSC, 400 g (M) | [smithoptics.com](https://www.smithoptics.com/en-ca/products/descend-mips-r) (CA$185) | all 5: evo $185, Sport Chek $190, Sporting Life $190, Altitude $184.99, MEC $189.95 |
| Salomon Stance 3L Shell → **Rossignol Proclivity 3L Shell** (`jacket-rossignol-proclivity-3l`) | Stance 3L isn't stocked. Salomon's Absolute 3L is listed at evo twice under the same name at different prices (ambiguous). Proclivity: uninsulated 3-layer, fully seam-taped, 20K, windproof, extended pit zips, relaxed fit | [rossignol.com](https://www.rossignol.com/ca-en/mens-proclivity-3l-shell-ski-jacket-RLPMJ12200.html) (FW26/27, CA$675) | evo $675, Altitude $674.99 |
| Salomon Radium Pro S Sigma (Silver Pink installed) → **same goggle, Black Gold installed + Silver Pink** (`goggle-salomon-radium-pro`) | Shops sell L47891000: Sigma Black Gold **11% VLT** (Cat. 3) installed, Sigma Silver Pink 35% (Cat. 2) extra. Reduced size for narrower faces. `vlt` 35 → 11, `temps` moderate → spring + moderate | [salomon.com](https://www.salomon.com/en-ca/product/radium-pro-s-sigma-and-extra-lens-li6577/L47891000) (CA$199.95) | Sporting Life $199.95, Altitude $199.95 |
| Atomic Warden MNC 13 → **Atomic Strive 14 MN** (`binding-atomic-strive-14-mn`) | atomic.com lists no Warden. Strive 14 MN is Atomic's current multi-norm binding: release 5–14, MN (DIN / touring / WTR), TÜV, 1,002 g. Marker's Griffon X 13 (DIN 4–13, at 4 shops) was considered, but Marker rates it Expert+ | [atomic.com](https://www.atomic.com/en-ca/products/strive-14-mn-ad0400-202600) (CA$309.99) | evo $309.99, Sporting Life $309.99 |
| Smith Squad — Yellow Sensor Mirror → **Oakley Target Line L — Persimmon** (`goggle-oakley-target-line-persimmon`) | No shop sells a Squad with a high-VLT installed lens; the freezing-day role needs 40–70% VLT. Oakley: Persimmon **61% VLT**, snow & overcast, Cat. 1, cylindrical dual lens with F3 anti-fog, large fit, no spare lens | [oakley.com](https://www.oakley.com/en-ca/product/W0OO7120S?variant=888392553829) (OO7120-02, CA$106) | evo $100, Sporting Life $100, Altitude $99.99 |
| Burton Covert 2.0 Insulated → **Covert 2L Insulated** (`jacket-burton-covert`, same id) | Burton calls it "the men's Covert 2.0 2L Jacket". 80 g ThermacoreEco, DRYRIDE 2L 10,000 mm / 5,000 g, fully taped, pit zips | [burton.com](https://www.burton.com/en-ca/products/mens-burton-covert-2l-insulated-jacket-311191) (CA$349.99) | evo $359.99, Altitude $349.99 |
| Salomon S/Pro Supra BOA 120 → **S/Pro Supra S BOA 120** (`boot-salomon-spro-supra-120`, same id) | The 2027 line is S BOA (single dial) and D BOA (dual). Salomon: flex 120, last 100 mm, GripWalk, 1,870 g, **Level of practice: Advanced** (levels advanced + expert → advanced) | [salomon.com](https://www.salomon.com/en-ca/product/s-pro-supra-s-boa-120-li1498/L45420600) (CA$849.95) | evo $849.95, Altitude $999.99 |
| Anon M4 Toric — Perceive Cloudy Pink → **M4 Toric — Perceive Variable Blue** (`goggle-burton-anon-m4`, same id) | Anon's current colourways put Cloudy Pink only in the bonus slot. Black ships Perceive Variable Blue **21% VLT** (S2) + Cloudy Pink 53% (S1). `vlt` 53 → 21, `temps` freezing → moderate + freezing | [burton.com (Anon)](https://www.burton.com/en-ca/products/anon-m4-goggles-toric-bonus-perceive-lens-mfi-face-mask-203551) (CA$419.99) | evo $419.99, Altitude $419.99 |
| K2 Raygun → **Burton Cultivator Flat Top** (`board-burton-cultivator`) | Raygun isn't stocked. Cultivator (2027): Flat Top with Easy Bevel, twin, Fly 900G core, extruded base, "Soft & Playful", sizes 135–165W, waist 252 mm at 155 | [burton.com](https://www.burton.com/en-ca/products/burton-cultivator-flat-top-snowboard-311741) (CA$499.99) | evo $499.99, Altitude $499.99 |
| Oakley Sub Temp RC GORE-TEX → **Burton Reserve GORE-TEX 2L Insulated** (`jacket-burton-reserve-gtx-insulated`) | Sub Temp RC isn't stocked (no current version at any shop). Reserve: insulated (80 g ThermacoreEco) 2-layer GORE-TEX, fully taped, pit zips, powder skirt, like the Sub Temp RC | [burton.com](https://www.burton.com/en-ca/products/mens-burton-reserve-gore-tex-2l-insulated-jacket-304111) (CA$579.99) | evo from $329.57, Sporting Life $346.98 (sale), Altitude $579.99 |
| Marker Jester 16 ID → **Marker Jester X 16 MWerks** (`binding-marker-jester-x-16`) | The only Jester on Marker's Canadian site (2027). DIN 6–16, Triple Pivot Elite X toe, alpine + GripWalk, 1,130 g, **Ability: Expert, Competitor, Professional** (levels advanced + expert → expert) | [markerbindings.com](https://markerbindings.com/en-ca/p/jester-x-16-mwerks-bindings-2026) (CA$499.99) | evo $499.99, Sporting Life $499.99 |

### Added: a budget/mid-range ski boot rated advanced

The K2 Method Pro proposed in the audit is only at evo (K2 FL3X Method 2027, $549.99), so it fails the 2-shop rule.
Instead: **Dalbello Veloce Space 100 BOA** (`boot-dalbello-veloce-space-100`, budget). Dalbello: flex 100, last 101 mm,
BOA single dial, walk mode, GripWalk, **Ability: Intermediate, Advanced**
([dalbelloboots.com](https://dalbelloboots.com/en-ca/p/veloce-space-100-ski-boots-d2503103), 2027, CA$549.99).
It's at Sport Chek ($549.99) and Altitude ($549.99).

The level-fit test's known-gap exception is removed. It now passes with 0 of 864 profiles off by two or more levels,
with no exceptions.

### Not swapped: Burton Frostner Down Jacket (96 picks)

The role is a mid-range, warmth-5 down ski jacket. Nothing qualified at 2+ shops:

- Outdoor Research Snowcrew Down (OR rates it warmth 5/5, current per OR's "F26Carryover" tag) is at MEC $499.95, but
  every variant of evo's listing is sold out.
- Burton [ak] Swash Down GORE-TEX 2L (Burton rates it warmth 5/5) isn't stocked at any of the five shops.
- Burton [ak] Expedition Down is listed by Burton as a mid layer (a "basecamp puffy"), not a ski shell.
- Helly Hansen Alpha 4.0 has 80 g PrimaLoft (Covert-level warmth). HH Alpha LIFALOFT shows insulation 4 of 6 on HH's
  own scale.
- Rossignol Snowblaze Down CB and Peak Performance Shred Down are only at Altitude.

## Notes for review

1. **Dalbello's published levels look swapped:** the Veloce Space 100 says "Intermediate, Advanced" and the stiffer 110
   says "Beginner, Intermediate". They're recorded as published.
2. **Levels taken from copy, not a rating:**
   - Burton states no ability level for the Cultivator; beginner + intermediate follow its "progression" and "soft
     flex" copy.
   - Atomic states none for the Strive 14 MN; advanced + expert follow "Pro-level stability" and "most at home when
     it's charging hard".
3. **Cultivator gender tag:** Burton says "gender neutral sizing", so it's tagged `unisex` (universal fit, per the
   `GearItem` doc). Tagging it men's + women's + unisex makes it a full gender match for women. For expert female
   budget snowboarders it then outscores the Huck Knife by 0.734 to 0.730 despite being two levels off. That broke the
   level-fit test for 6 profiles, and the engine weights were left unchanged.
4. **Lens changes move picks:**
   - The M4 Toric now has a mid-light lens installed, so freezing-day premium riders get the Smith I/O MAG Storm,
     which no Canadian shop carries (144 picks).
   - The Radium is now a sunny-day lens, so moderate-light riders get the Oakley Line Miner instead.

   The I/O MAG is the biggest remaining zero-availability top pick.
5. **Sport Chek year labels:** Sport Chek's "Burton Process 2026" is priced like evo's 2027 Process ($679.99), so Sport
   Chek may label by a season's first year. The Sport Chek "older-year only" calls in `docs/price-check-2026-11-04.md`
   may need a second look. Here, the "2026" Cultivator at Sport Chek ($449.99, versus $499.99 for the 2027) stays an
   older-year listing.
6. **Changed ids:** saved setups that used a replaced id skip that item, as the vault already does for removed items.
   The Radium, Covert, S/Pro Supra and M4 keep their ids.
7. **Salomon:** salomon.com product pages showed a "Press & Hold" human check. You completed it; the tool didn't.
