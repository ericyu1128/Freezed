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
  gearDatabase.ts       40+ mock items with specs and multi-retailer pricing
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

Prices, links and availability are illustrative mock data for demo purposes. Sizing output is
guidance, not a fitting — always shell-fit boots with a qualified bootfitter.
