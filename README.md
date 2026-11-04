# Freezed ❄️

**A custom ski and snowboard gear matcher and visualizer.**
Made by **Eric Yu**.

Freezed takes your body metrics, ability, riding style, expected temperature and budget, calculates
a real spec sheet (length, waist width, boot flex, lens VLT, jacket warmth), then scores a catalogue
of 58 items from Atomic, Völkl, Salomon, K2, Black Crows, Burton, Arc'teryx, Smith and Oakley
against it.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run prices:template  # write data/prices-template.csv (one row per item × retailer)
npm run prices:import    # validate the filled CSV and write data/prices.json
```

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS 3.4** — all styling, including custom keyframes; no CSS-in-JS, no UI library
- Zero runtime dependencies beyond React/Next

---

## Project structure

```
app/
  layout.tsx            Root shell — nav, footer, ambient snowfall
  page.tsx              Hero → questionnaire → loading → dashboard state machine
  globals.css           Tailwind layers, glassmorphism utilities, keyframes
components/
  InputForm.tsx         5-step animated questionnaire with live validation
  StickmanVisualizer.tsx Interactive SVG rider with 5 gear hotspots
  Dashboard.tsx         Profile pills, spec summary, sizing derivation, card grid
  GearCard.tsx          Product card: specs, price comparison, match explanation
  GearImage.tsx         Remote image with gradient + icon fallback
  LoadingState.tsx      Phase messages and skeleton grid
  Navbar / Footer / Logo / Snowfall / Icons
lib/
  types.ts              All domain types
  gearDatabase.ts       52 items with specs and multi-retailer pricing
  gearImages.ts         Spec-driven SVG product renderer
  matcherLogic.ts       Pure sizing + scoring engine
```

---

## The matching engine

Everything in `lib/matcherLogic.ts` is pure and deterministic — the same profile always produces the
same output.

### Ski length

| Input | Effect |
| --- | --- |
| Standing height | Base |
| Style | Piste −12 · All-mountain −9 · Freestyle −14 · Backcountry −5 cm |
| Ability | Beginner −5 · Intermediate 0 · Advanced +3 · Expert +6 cm |
| Freeride bonus | +4 cm for advanced/expert backcountry riders |
| Rider load | ±5 cm, from weight relative to the reference mass for that height |
| Women's construction | −2 cm |

Snowboards use `height × 0.88` as the base with their own style/ability offsets.
Every step is surfaced in the UI so the number is never a black box.

### Waist width (mm)

| Style | Window |
| --- | --- |
| Piste / carving | 72 – 84 |
| All-mountain | 85 – 98 |
| Freestyle / park | 90 – 102 |
| Backcountry | 105 – 118 |

Snowboards switch to a board-waist check (standard vs. wide) driven by estimated Mondopoint size.

### Boot flex

| Level | Men's / unisex | Women's | Snowboard (1–10) |
| --- | --- | --- | --- |
| Beginner | 70 – 90 | 60 – 75 | 2 – 4 |
| Intermediate | 90 – 110 | 75 – 90 | 4 – 6 |
| Advanced | 120 – 140 | 100 – 115 | 6 – 8 |
| Expert | 120 – 140+ | 100 – 115+ | 7 – 10 |

### Conditions → optics and insulation

| Temperature | Goggle VLT | Jacket |
| --- | --- | --- |
| Freezing (≤ −15 °C) | 40 – 70% (storm / rose / yellow) | High-loft down, warmth 4–5/5 |
| Moderate (−5 to 0 °C) | 18 – 40% (all-round) | Mid-weight insulation, 3–4/5 |
| Spring (> 0 °C) | 5 – 20% (polarised / mirrored) | Uninsulated shell, 1–2/5 |

### Budget filtering

`budgetTier` is a **hard filter**: anything more than one tier away is removed from the pool before
scoring. Exact-tier matches then score +60, one tier away +22. Every card shows a full retailer
price comparison with the cheapest option flagged, and the dashboard totals the kit at best price.

### Product images

Images are generated, not stored. `lib/gearImages.ts` draws every item as an SVG data URI from
**the same spec values the matcher reads**, so the picture is always of that specific product:

| Category | Driven by |
| --- | --- |
| Skis / boards | `specs.waistWidth` sets the silhouette — a 72 mm carver is visibly pinched next to a 118 mm powder ski. `specs.profile` draws the camber/rocker diagram beneath. Twin tips get a tail marker; swallowtails get the notch. |
| Boots | `specs.flex` sets cuff height and buckle count (2/3/4), and is printed on the cuff like the real thing. BOA dials, Step On cleats and walk mode appear when the specs list them. |
| Helmets | `specs.vents` sets the vent count on the shell; a MIPS badge appears when `specs.rotational` says so. |
| Goggles | `specs.lensTint` picks the hue, `specs.vlt` sets how dark and mirrored the lens reads, and lens shape sets the frame curve. A 12% VLT sun lens renders near-black; a 65% storm lens renders bright yellow. |
| Jackets | `specs.insulation` decides down baffles vs. a clean shell, and `specs.warmth` sets the baffle count. Pit zips appear when specced. |

Brand palettes come from a lookup table, so an Atomic ski reads red and a Black Crows ski reads
charcoal-and-orange. Output averages ~7.5 KB per item — smaller than a single product JPEG, with no
network request and nothing to 404.

**Layout constraint worth knowing if you edit this:** the gear card renders images with
`object-cover`, which crops the sides on narrow screens and lays the brand/name block over the
bottom. Artwork is therefore composed into a safe window of `x ∈ [110, 690]`, `y ∈ [24, 238]` on an
800 × 300 canvas, with the bottom strip left empty for the card's own title.

### Retailer links

`lib/retailers.ts` is the single source of truth for retailers — id, display name, region, native
currency and search-URL pattern. Links are **not stored**: every one is generated by
`buildRetailerUrl(retailerId, query)` as a live search on that retailer's own site, so nothing rots
into a dead product URL. `buildRetailerUrl` is the one function every outbound link goes through;
affiliate wrapping will slot in there (see the `// AFFILIATE:` comment).

| Retailer | Region | Pattern |
| --- | --- | --- |
| Evo Canada | CA | `evo.com/en-ca/search?q=…` |
| Sport Chek | CA | `sportchek.ca/en/search-results.html?q=…` |
| Sporting Life | CA | `sportinglife.ca/en-CA/search?q=…` |
| Altitude Sports | CA | `altitude-sports.com/search?query=…` |
| MEC | CA | `mec.ca/en/search?q=…` |
| Evo | US | `evo.com/search?q=…` |
| REI | US | `rei.com/search?q=…` |
| Backcountry | US | `backcountry.com/search?q=…` |
| The House | US | `the-house.com/search?query=…` |

Every pattern was checked by hand in a browser on 2026-11-04.

`toSearchTerm()` normalises the query first: strips diacritics (`Völkl` → `Volkl`) and apostrophes
(`Arc'teryx` → `Arcteryx`), drops em-dash colourway suffixes (`I/O MAG — ChromaPop Storm Rose` →
`I/O MAG`) and square brackets (`[ak]` → `ak`), while leaving real hyphenated tokens like `GORE-TEX`
and `Step-On` intact. An optional per-item `searchTerm` overrides it where the brand field and the
shelf name disagree.

Every outbound link — each price row, the "View deal" button and the link icon beside each ranked
candidate — renders through `components/RetailerLink.tsx` with
`target="_blank" rel="noopener noreferrer sponsored"`, and stops the click from also selecting the card.

### Prices and region

Prices are entered by hand and never invented or converted.

- **Data:** `data/prices.json`, keyed by item id then retailer id: `{ "price": number | null, "checkedAt": "YYYY-MM-DD" | null }`.
  Everything starts as `null` (unchecked).
- **Workflow:** `npm run prices:template` writes `data/prices-template.csv`
  (`itemId,brand,name,retailerId,region,currency,price,checkedAt,url`) with each row's search URL prefilled, so
  you can click through and check. Fill in `price` and `checkedAt`, then `npm run prices:import` validates it
  (numbers, real ISO dates not in the future, known ids, region/currency matching the retailer) and writes the
  JSON. It prints how many rows are priced, missing, and older than 14 days. Nothing is written if any row fails.
  Pass `-- --dry-run` to validate only, or a path to import a different CSV. The template refuses to overwrite an
  existing CSV unless you pass `-- --force`.
- **Region toggle:** 🇨🇦 CAD / 🇺🇸 USD next to the language switch (default CA, saved in `localStorage`, exposed
  by `lib/region/RegionContext.tsx`). A region shows only its own retailers, in their native currency, always
  labelled (`$549.99 CAD`), with "checked {date}" under each price. An unchecked price shows "Check price →".
- **Totals:** `lib/pricing.ts` counts only items priced in the selected region and reports "(x of y priced)"
  when some are missing. Saved setups are totalled live from current data, never from a snapshot.
- **Ranking never reads prices** — budget fit uses each item's `priceTier`.

#### Feature flag

| Variable | Default | Effect |
| --- | --- | --- |
| `NEXT_PUBLIC_SHOW_RETAILER_LINKS` | `true` | Set to `false` to hide every retailer link (price rows render as plain text). |

It is inlined at build time, so change it in Vercel and redeploy.

### Scoring

Each candidate gets a 0–1 fit for budget, style, ability, gendered fit, conditions, and a
category-specific numeric fit (waist width, flex, VLT or warmth measured against your calculated
window). The weight-normalised average of those fits is shown on each card as a 0–100 Compatibility
Score, and the two runners-up are listed as "also considered".

---

## Analytics

Anonymous product analytics via [PostHog](https://posthog.com), set up in `lib/analytics.ts` and started by
`components/AnalyticsProvider.tsx` in the root layout.

| Variable | Default | Effect |
| --- | --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | unset | Project API key. Unset = analytics off, `track()` is a silent no-op. |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` | Ingestion host (use the EU host for an EU project). |

Settings: autocapture off, session recording off, pageviews on (including client-side navigations), no person
profiles. Every event name and its property type lives in `AnalyticsEvents`, and every call goes through one
typed `track()` helper:

| Event | Properties |
| --- | --- |
| `quiz_start` | — (first interaction with step 1) |
| `quiz_step` | `step_id`, `step_index`, `direction` |
| `quiz_complete` | `activity`, `gender`, `level`, `style`, `temperature`, `budgetTier`, `language`, `region` |
| `recommendations_shown` | `categories`, `top_item_ids` |
| `candidate_selected` | `category`, `item_id`, `rank` |
| `outbound_click` | `retailer_id`, `region`, `item_id`, `category`, `rank`, `is_top_pick`, `has_price` |

**Height and weight are never sent** — no event type has a field for them. Vercel Analytics (page views) also
runs, via `@vercel/analytics`.

---

## The visualizer

`StickmanVisualizer.tsx` renders an SVG rider whose zones map to gear categories:

| Body part | Category |
| --- | --- |
| Head | Helmet |
| Face | Goggles |
| Torso | Jacket |
| Feet | Boots |
| Base | Skis / snowboard |

Zones are dim until matched, then fill with icy gradients and a glow. Pulsing markers sit on each
zone; hovering one highlights the matching card, and hovering a card lights the corresponding body
part. Clicking either scrolls to the card. The rider switches between two skis + poles and a single
angled board based on the selected discipline.

---

## Accessibility & responsiveness

- Full keyboard support — hotspots are real buttons with focus states and ARIA labels
- `radiogroup` / `radio` semantics on every option grid
- `prefers-reduced-motion` disables snowfall and collapses all animation
- Mobile-first layout: the visualizer stacks above the cards, the card grid drops to one column,
  and the questionnaire steps stay single-column below `sm`

---

## Notes

Prices and availability are illustrative mock data for demo purposes; retailer links are live
searches on each store. Sizing output is guidance, not a fitting — always shell-fit boots with a
qualified bootfitter.
