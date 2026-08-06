# Freezed ❄️

**A custom ski and snowboard gear matcher and visualizer.**
Made by **Eric Yu**.

Freezed takes your body metrics, ability, riding style, expected temperature and budget, calculates
a real spec sheet (length, waist width, boot flex, lens VLT, jacket warmth), then scores a catalogue
of 40+ items from Atomic, Völkl, Salomon, K2, Black Crows, Burton, Arc'teryx, Smith and Oakley
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

Prices are mock data, but **links are not stored** — they're generated at module load by
`buildSearchUrl()` as a live search query against each retailer's own site, so nothing rots into a
dead product URL:

| Retailer | Pattern |
| --- | --- |
| Evo | `evo.com/shop?text=…` |
| REI | `rei.com/search?q=…` |
| Sport Chek | `sportchek.ca/search?q=…` |
| Backcountry | `backcountry.com/search?q=…` |
| The House | `the-house.com/search?q=…` |

`toSearchTerm()` normalises the query first: strips diacritics (`Völkl` → `Volkl`) and apostrophes
(`Arc'teryx` → `Arcteryx`), drops em-dash colourway suffixes (`I/O MAG — ChromaPop Storm Rose` →
`I/O MAG`) and square brackets (`[ak]` → `ak`), while leaving real hyphenated tokens like `GORE-TEX`
and `Step-On` intact. An optional per-item `searchTerm` overrides it where the brand field and the
shelf name disagree — Anon is a Burton company, but retailers index it as Anon.

Every outbound link — the price rows, the "View deal" button and the "also considered" pills —
opens with `target="_blank" rel="noopener noreferrer"`.

### Scoring

Each candidate accumulates points for activity, budget, style, ability, gendered fit, condition
tags, and a category-specific numeric fit (waist width, flex, VLT or warmth measured against your
calculated window). The raw total is normalised to a 0–100 confidence figure shown on each card, and
the two runners-up are listed as "also considered".

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
