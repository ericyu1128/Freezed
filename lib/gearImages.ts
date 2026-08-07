/**
 * Freezed — generated product imagery
 * Made by Eric Yu
 *
 * Every gear image is drawn from the item's own spec data rather than pulled
 * from a stock photo library, so the picture always depicts the actual product:
 *
 *   skis / boards -> silhouette width driven by `specs.waistWidth`, plus a
 *                    camber/rocker profile diagram read from `specs.profile`
 *   boots         -> buckle count, cuff height and the flex index printed on
 *                    the cuff, all driven by `specs.flex`
 *   helmets       -> vent count from `specs.vents`, MIPS badge when present
 *   goggles       -> lens tint hue parsed from `specs.lensTint`, lens
 *                    translucency from `specs.vlt`, frame curve from lens shape
 *   jackets       -> down baffles vs. clean shell panels from `specs.insulation`
 *                    and `specs.warmth`
 *   bindings      -> DIN dial reading from `specs.dinRange` (ski) or highback
 *                    height from `specs.flexRating` (snowboard)
 *
 * Output is a URL-encoded SVG data URI: no network requests, no broken images,
 * no licensing questions, and it renders crisply at any card size.
 */

import type { Activity, GearCategory } from './types';

/* ------------------------------------------------------------------ */
/*  Brand palettes                                                     */
/* ------------------------------------------------------------------ */

interface Palette {
  /** Dominant topsheet / shell colour. */
  base: string;
  /** Shadowed variant of `base`. */
  deep: string;
  /** Graphic accent. */
  accent: string;
  /** Text and detail lines that sit on `base`. */
  ink: string;
}

const BRAND_PALETTE: Record<string, Palette> = {
  Atomic: { base: '#e4002b', deep: '#7c0019', accent: '#ffffff', ink: '#ffffff' },
  Völkl: { base: '#d5001c', deep: '#14181f', accent: '#f2f4f8', ink: '#ffffff' },
  Salomon: { base: '#e8112d', deep: '#12161d', accent: '#00a3e0', ink: '#ffffff' },
  K2: { base: '#f26522', deep: '#7a2f0b', accent: '#ffd166', ink: '#1a1206' },
  'Black Crows': { base: '#20252f', deep: '#0b0e14', accent: '#ff6b35', ink: '#e7ecf5' },
  Burton: { base: '#161a22', deep: '#080a0f', accent: '#ff4d4d', ink: '#e7ecf5' },
  "Arc'teryx": { base: '#d64123', deep: '#5f1a0c', accent: '#f5f7fa', ink: '#ffffff' },
  Smith: { base: '#212734', deep: '#0c0f15', accent: '#ffcf3f', ink: '#e7ecf5' },
  Oakley: { base: '#181c25', deep: '#080a10', accent: '#b7e80b', ink: '#e7ecf5' },
  Marker: { base: '#e10600', deep: '#3a0402', accent: '#f2f4f8', ink: '#ffffff' },
  Union: { base: '#1c1f24', deep: '#08090b', accent: '#ff5a1f', ink: '#e7ecf5' },
};

const FALLBACK_PALETTE: Palette = {
  base: '#334155',
  deep: '#0f172a',
  accent: '#67e8f9',
  ink: '#e2e8f0',
};

const paletteFor = (brand: string): Palette => BRAND_PALETTE[brand] ?? FALLBACK_PALETTE;

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

/** Stable FNV-1a hash so per-item variation is deterministic across renders. */
const hash = (value: string): number => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
};

const round = (value: number): number => Math.round(value * 100) / 100;

const num = (specs: Record<string, string | number>, key: string, fallback: number): number => {
  const raw = specs[key];
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const parsed = Number.parseFloat(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const text = (specs: Record<string, string | number>, key: string): string =>
  String(specs[key] ?? '').toLowerCase();

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Escape the handful of characters that are unsafe inside SVG markup. */
const esc = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ------------------------------------------------------------------ */
/*  Shared chrome                                                      */
/* ------------------------------------------------------------------ */

/**
 * Canvas is 800 × 300 (2.67:1) to sit close to the gear card's own aspect
 * ratio, because the card renders these with `object-cover`.
 *
 * Two consequences drive the whole layout:
 *   - `object-cover` on a narrow mobile card crops the sides, so nothing
 *     essential may live outside x ∈ [110, 690].
 *   - the card lays its own brand/name block over the bottom of the image, so
 *     nothing may live below y ≈ 238.
 *
 * All artwork is therefore composed inside that safe area, and the bottom strip
 * is left deliberately empty for the card's title to sit on.
 */
const WIDTH = 800;
const HEIGHT = 300;

/** Deterministic drifting snow specks behind the product. */
const snowSpecks = (seed: number): string => {
  let markup = '';
  for (let i = 0; i < 22; i += 1) {
    const n = hash(`${seed}-speck-${i}`);
    const x = n % WIDTH;
    const y = (n >> 9) % HEIGHT;
    const r = ((n >> 17) % 18) / 10 + 0.6;
    const o = (((n >> 21) % 30) + 8) / 100;
    markup += `<circle cx="${x}" cy="${y}" r="${round(r)}" fill="#e0f2fe" opacity="${round(o)}"/>`;
  }
  return markup;
};

/** Soft contact shadow, placed by each renderer to sit under its own product. */
const shadow = (cy: number, rx: number, ry: number, opacity = 0.4): string =>
  `<ellipse cx="400" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000000" opacity="${opacity}"/>`;

/**
 * Place artwork authored in the original 800 × 420 drawing space into the
 * 800 × 300 safe area: scales about the horizontal centre and maps
 * `srcCentreY` onto `targetCentreY`.
 */
const compose = (body: string, scale: number, srcCentreY: number, targetCentreY: number): string =>
  `<g transform="translate(400 ${targetCentreY}) scale(${scale}) translate(-400 ${round(-srcCentreY)})">${body}</g>`;

const frame = (id: string, palette: Palette, body: string): string => {
  const seed = hash(id);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#0e1626"/><stop offset="0.55" stop-color="#0a111d"/><stop offset="1" stop-color="#070c15"/>
</linearGradient>
<radialGradient id="halo" cx="0.5" cy="0.40" r="0.66">
<stop offset="0" stop-color="${palette.base}" stop-opacity="0.30"/>
<stop offset="0.55" stop-color="#38bdf8" stop-opacity="0.10"/>
<stop offset="1" stop-color="#000000" stop-opacity="0"/>
</radialGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
<stop offset="0.45" stop-color="#ffffff" stop-opacity="0.05"/>
<stop offset="1" stop-color="#000000" stop-opacity="0.28"/>
</linearGradient>
<linearGradient id="topsheet" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${palette.base}"/><stop offset="1" stop-color="${palette.deep}"/>
</linearGradient>
</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#halo)"/>
${snowSpecks(seed)}
${body}
</svg>`;
};

/* ------------------------------------------------------------------ */
/*  Silhouettes                                                        */
/* ------------------------------------------------------------------ */

/** Top-down ski outline: wide shovel, pinched waist, medium tail. */
const skiOutline = (len: number, waist: number, shovel: number, tail: number): string => {
  const w = waist / 2;
  const s = shovel / 2;
  const t = tail / 2;
  const L = len;
  return [
    'M0 0',
    `C ${round(L * 0.01)} ${round(-s * 0.55)}, ${round(L * 0.05)} ${round(-s)}, ${round(L * 0.13)} ${round(-s)}`,
    `C ${round(L * 0.27)} ${round(-s)}, ${round(L * 0.36)} ${round(-w)}, ${round(L * 0.5)} ${round(-w)}`,
    `C ${round(L * 0.64)} ${round(-w)}, ${round(L * 0.74)} ${round(-t)}, ${round(L * 0.87)} ${round(-t)}`,
    `C ${round(L * 0.95)} ${round(-t)}, ${L} ${round(-t * 0.72)}, ${L} 0`,
    `C ${L} ${round(t * 0.72)}, ${round(L * 0.95)} ${round(t)}, ${round(L * 0.87)} ${round(t)}`,
    `C ${round(L * 0.74)} ${round(t)}, ${round(L * 0.64)} ${round(w)}, ${round(L * 0.5)} ${round(w)}`,
    `C ${round(L * 0.36)} ${round(w)}, ${round(L * 0.27)} ${round(s)}, ${round(L * 0.13)} ${round(s)}`,
    `C ${round(L * 0.05)} ${round(s)}, ${round(L * 0.01)} ${round(s * 0.55)}, 0 0`,
    'Z',
  ].join(' ');
};

/** Top-down snowboard outline: rounded nose and tail, gentle sidecut. */
const boardOutline = (len: number, waist: number, nose: number, tail: number): string => {
  const w = waist / 2;
  const n = nose / 2;
  const t = tail / 2;
  const L = len;
  return [
    `M0 0`,
    `C 0 ${round(-n * 0.82)}, ${round(L * 0.03)} ${round(-n)}, ${round(L * 0.11)} ${round(-n)}`,
    `C ${round(L * 0.26)} ${round(-n)}, ${round(L * 0.36)} ${round(-w)}, ${round(L * 0.5)} ${round(-w)}`,
    `C ${round(L * 0.64)} ${round(-w)}, ${round(L * 0.74)} ${round(-t)}, ${round(L * 0.89)} ${round(-t)}`,
    `C ${round(L * 0.97)} ${round(-t)}, ${L} ${round(-t * 0.82)}, ${L} 0`,
    `C ${L} ${round(t * 0.82)}, ${round(L * 0.97)} ${round(t)}, ${round(L * 0.89)} ${round(t)}`,
    `C ${round(L * 0.74)} ${round(t)}, ${round(L * 0.64)} ${round(w)}, ${round(L * 0.5)} ${round(w)}`,
    `C ${round(L * 0.36)} ${round(w)}, ${round(L * 0.26)} ${round(n)}, ${round(L * 0.11)} ${round(n)}`,
    `C ${round(L * 0.03)} ${round(n)}, 0 ${round(n * 0.82)}, 0 0`,
    'Z',
  ].join(' ');
};

/**
 * Side-on profile diagram, drawn small beneath the board or skis. Camber arcs
 * up under the middle; rocker lifts the contact points; hybrids do both.
 */
const profileDiagram = (profile: string, palette: Palette): string => {
  const rockered = /rocker|flying v|tweekend|double/.test(profile);
  const cambered = /camber/.test(profile);
  const flat = /flat/.test(profile) && !cambered;

  const x0 = 322;
  const x1 = 478;
  const mid = 400;
  const baseY = 228;

  let path: string;
  if (rockered && cambered) {
    path = `M${x0} ${baseY - 5} Q ${x0 + 28} ${baseY} ${x0 + 48} ${baseY} Q ${mid} ${baseY - 7} ${x1 - 48} ${baseY} Q ${x1 - 28} ${baseY} ${x1} ${baseY - 5}`;
  } else if (rockered) {
    path = `M${x0} ${baseY - 7} Q ${mid} ${baseY + 2} ${x1} ${baseY - 7}`;
  } else if (flat) {
    path = `M${x0} ${baseY} L${x1} ${baseY}`;
  } else {
    path = `M${x0} ${baseY} Q ${mid} ${baseY - 9} ${x1} ${baseY}`;
  }

  return `<g opacity="0.9">
<line x1="${x0 - 14}" y1="${baseY + 7}" x2="${x1 + 14}" y2="${baseY + 7}" stroke="#233044" stroke-width="1.5" stroke-dasharray="4 5"/>
<path d="${path}" fill="none" stroke="${palette.accent}" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
</g>`;
};

/* ------------------------------------------------------------------ */
/*  Category renderers                                                 */
/*                                                                     */
/*  Each renderer draws in a roomy 800 x 420 space and hands the result */
/*  to `compose`, which scales and seats it in the 800 x 300 safe area. */
/* ------------------------------------------------------------------ */

const renderSkis = (
  brand: string,
  specs: Record<string, string | number>,
  palette: Palette,
): string => {
  const waistMm = num(specs, 'waistWidth', 90);
  // A 72 mm carver and a 118 mm powder ski must read as visibly different skis.
  const waistPx = clamp(waistMm * 0.44, 30, 54);
  const shovelPx = waistPx * 1.46;
  const tailPx = waistPx * 1.3;
  const len = 560;
  const outline = skiOutline(len, waistPx, shovelPx, tailPx);
  const stripe = palette.accent;
  const twin = /twin/.test(text(specs, 'tail'));

  const ski = (dy: number, rotate: number, opacity: number) => `
<g transform="translate(120 ${180 + dy}) rotate(${rotate} 280 0)" opacity="${opacity}">
  <path d="${outline}" fill="url(#topsheet)" stroke="#0b0f17" stroke-width="2.5"/>
  <path d="${outline}" fill="url(#sheen)"/>
  <path d="M${round(len * 0.2)} ${round(-waistPx * 0.34)} L${round(len * 0.78)} ${round(-waistPx * 0.34)}" stroke="${stripe}" stroke-width="3" opacity="0.75" stroke-linecap="round"/>
  <path d="M${round(len * 0.26)} ${round(waistPx * 0.3)} L${round(len * 0.7)} ${round(waistPx * 0.3)}" stroke="${stripe}" stroke-width="1.8" opacity="0.4" stroke-linecap="round"/>
  <text x="${round(len * 0.4)}" y="6" fill="${palette.ink}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="17" font-weight="800" letter-spacing="3.6" opacity="0.92">${esc(brand.toUpperCase())}</text>
  ${twin ? `<circle cx="${round(len * 0.955)}" cy="0" r="3.4" fill="${stripe}" opacity="0.85"/>` : ''}
</g>`;

  const art = `${ski(52, -4, 0.5)}${ski(0, 3, 1)}`;

  return `${shadow(194, 190, 9, 0.26)}${compose(art, 0.85, 206, 124)}${profileDiagram(text(specs, 'profile'), palette)}`;
};

const renderSnowboard = (
  brand: string,
  specs: Record<string, string | number>,
  palette: Palette,
): string => {
  const waistMm = num(specs, 'waistWidth', 252);
  const waistPx = clamp((waistMm - 230) * 1.9 + 42, 44, 66);
  const shape = text(specs, 'shape');
  const tapered = /taper|swallow/.test(shape) || (/directional/.test(shape) && !/twin/.test(shape));
  const nosePx = waistPx * 1.24;
  const tailPx = tapered ? waistPx * 1.12 : waistPx * 1.24;
  const len = 620;
  const outline = boardOutline(len, waistPx, nosePx, tailPx);
  const swallow = /swallow/.test(shape);

  const inserts = [0.38, 0.44, 0.56, 0.62]
    .map(
      (t) =>
        `<circle cx="${round(len * t)}" cy="-9" r="3.1" fill="#0b0f17" opacity="0.75"/><circle cx="${round(len * t)}" cy="9" r="3.1" fill="#0b0f17" opacity="0.75"/>`,
    )
    .join('');

  const art = `
<g transform="translate(92 182) rotate(-2 310 0)">
  <path d="${outline}" fill="url(#topsheet)" stroke="#0b0f17" stroke-width="2.6"/>
  <path d="${outline}" fill="url(#sheen)"/>
  <path d="M${round(len * 0.16)} ${round(-waistPx * 0.42)} L${round(len * 0.52)} ${round(waistPx * 0.42)}" stroke="${palette.accent}" stroke-width="7" opacity="0.55" stroke-linecap="round"/>
  <path d="M${round(len * 0.26)} ${round(-waistPx * 0.42)} L${round(len * 0.62)} ${round(waistPx * 0.42)}" stroke="${palette.accent}" stroke-width="3" opacity="0.35" stroke-linecap="round"/>
  ${inserts}
  ${swallow ? `<path d="M${len} 0 L${round(len - 34)} ${round(-tailPx * 0.3)} L${round(len - 34)} ${round(tailPx * 0.3)} Z" fill="#070c15"/>` : ''}
  <text x="${round(len * 0.7)}" y="7" fill="${palette.ink}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="19" font-weight="800" letter-spacing="4.2" text-anchor="middle" opacity="0.92">${esc(brand.toUpperCase())}</text>
</g>`;

  return `${shadow(182, 205, 9, 0.26)}${compose(art, 0.92, 182, 128)}${profileDiagram(text(specs, 'profile'), palette)}`;
};

const renderSkiBoot = (
  brand: string,
  specs: Record<string, string | number>,
  palette: Palette,
): string => {
  const flex = num(specs, 'flex', 100);
  const boa = /boa/.test(text(specs, 'closure')) || /boa/.test(text(specs, 'lacing'));
  const walkMode = Boolean(specs.walkMode);
  // Stiffer boots get a taller cuff and an extra buckle.
  const buckles = flex >= 110 ? 4 : flex >= 85 ? 3 : 2;
  const cuffTop = clamp(206 - (flex - 60) * 0.62, 150, 200);

  const buckleRow = Array.from({ length: buckles }, (_, i) => {
    const y = cuffTop + 34 + i * ((312 - cuffTop - 44) / Math.max(buckles - 1, 1));
    return `<g><rect x="300" y="${round(y)}" width="132" height="13" rx="6.5" fill="#0b0f17" opacity="0.9"/>
<rect x="306" y="${round(y + 3)}" width="120" height="7" rx="3.5" fill="${palette.accent}" opacity="0.55"/>
<circle cx="440" cy="${round(y + 6.5)}" r="7" fill="#cbd5e1"/><circle cx="440" cy="${round(y + 6.5)}" r="3" fill="#0b0f17"/></g>`;
  }).join('');

  const art = `
<g transform="translate(21 0)">
  <path d="M232 316 L512 316 Q528 316 528 328 L528 336 Q528 346 514 346 L246 346 Q230 346 230 334 Z" fill="#111827" stroke="#0b0f17" stroke-width="2"/>
  <path d="M244 336 h48 M310 336 h60 M392 336 h60 M470 336 h44" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
  <path d="M266 ${round(cuffTop + 18)} Q262 262 244 292 Q236 306 250 316 L504 316 Q520 312 516 292 L500 ${round(cuffTop + 18)} Z" fill="url(#topsheet)" stroke="#0b0f17" stroke-width="2.4"/>
  <path d="M266 ${round(cuffTop + 18)} Q262 262 244 292 Q236 306 250 316 L504 316 Q520 312 516 292 L500 ${round(cuffTop + 18)} Z" fill="url(#sheen)"/>
  <path d="M292 ${round(cuffTop)} Q292 ${round(cuffTop - 16)} 312 ${round(cuffTop - 16)} L470 ${round(cuffTop - 16)} Q492 ${round(cuffTop - 16)} 492 ${round(cuffTop)} L502 ${round(cuffTop + 30)} L280 ${round(cuffTop + 30)} Z" fill="${palette.deep}" stroke="#0b0f17" stroke-width="2.4"/>
  <path d="M300 ${round(cuffTop - 10)} L318 ${round(cuffTop - 10)} L326 ${round(cuffTop + 92)} L300 ${round(cuffTop + 92)} Z" fill="#1f2937" opacity="0.9"/>
  <rect x="288" y="${round(cuffTop - 6)}" width="212" height="16" rx="8" fill="#0b0f17"/>
  <rect x="294" y="${round(cuffTop - 2)}" width="140" height="8" rx="4" fill="${palette.accent}" opacity="0.6"/>
  ${buckleRow}
  ${
    boa
      ? `<circle cx="352" cy="288" r="17" fill="#0b0f17"/><circle cx="352" cy="288" r="11.5" fill="#e2e8f0"/><circle cx="352" cy="288" r="4.5" fill="${palette.base}"/>`
      : ''
  }
  <text x="470" y="${round(cuffTop + 18)}" fill="${palette.ink}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="30" font-weight="900" text-anchor="end" opacity="0.95">${flex}</text>
  <text x="300" y="${round(cuffTop + 17)}" fill="${palette.ink}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="13" font-weight="800" letter-spacing="2.6" opacity="0.78">${esc(brand.toUpperCase())}</text>
  ${
    walkMode
      ? `<g transform="translate(240 ${round(cuffTop + 44)})"><rect x="0" y="0" width="46" height="18" rx="9" fill="#0b0f17" opacity="0.9"/><text x="23" y="13" fill="${palette.accent}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="10" font-weight="900" letter-spacing="1" text-anchor="middle">WALK</text></g>`
      : ''
  }
</g>`;

  return `${shadow(226, 132, 9, 0.42)}${compose(art, 0.85, 248, 138)}`;
};

const renderSnowboardBoot = (
  brand: string,
  specs: Record<string, string | number>,
  palette: Palette,
): string => {
  const flex = num(specs, 'flex', 6);
  const boa = /boa/.test(text(specs, 'lacing'));
  const stepOn = /step on/.test(text(specs, 'lacing'));
  const cuffTop = clamp(206 - flex * 7, 140, 190);

  const laces = Array.from({ length: 5 }, (_, i) => {
    const y = cuffTop + 34 + i * 22;
    return `<path d="M322 ${round(y)} L400 ${round(y + 11)} M400 ${round(y)} L322 ${round(y + 11)}" stroke="#e2e8f0" stroke-width="2.6" opacity="0.62" stroke-linecap="round"/>`;
  }).join('');

  const art = `
<g transform="translate(19 0)">
  <path d="M238 312 L510 312 Q530 312 530 328 L530 338 Q530 348 512 348 L250 348 Q232 348 232 332 Z" fill="#111827" stroke="#0b0f17" stroke-width="2"/>
  <path d="M248 331 h40 M304 331 h44 M364 331 h44 M424 331 h44 M484 331 h34" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
  <path d="M290 ${round(cuffTop)} Q290 ${round(cuffTop - 22)} 320 ${round(cuffTop - 22)} L456 ${round(cuffTop - 22)} Q486 ${round(cuffTop - 22)} 486 ${round(cuffTop + 6)} Q500 ${round(cuffTop + 92)} 512 312 L252 312 Q256 ${round(cuffTop + 76)} 290 ${round(cuffTop + 24)} Z" fill="url(#topsheet)" stroke="#0b0f17" stroke-width="2.4"/>
  <path d="M290 ${round(cuffTop)} Q290 ${round(cuffTop - 22)} 320 ${round(cuffTop - 22)} L456 ${round(cuffTop - 22)} Q486 ${round(cuffTop - 22)} 486 ${round(cuffTop + 6)} Q500 ${round(cuffTop + 92)} 512 312 L252 312 Q256 ${round(cuffTop + 76)} 290 ${round(cuffTop + 24)} Z" fill="url(#sheen)"/>
  <path d="M292 ${round(cuffTop - 4)} L484 ${round(cuffTop - 4)} L488 ${round(cuffTop + 18)} L294 ${round(cuffTop + 18)} Z" fill="${palette.deep}" opacity="0.95"/>
  <path d="M330 ${round(cuffTop - 14)} L394 ${round(cuffTop - 14)} L404 288 L322 288 Z" fill="#1f2937" opacity="0.92"/>
  ${boa || stepOn ? '' : laces}
  ${
    boa || stepOn
      ? `<circle cx="362" cy="${round(cuffTop + 62)}" r="21" fill="#0b0f17"/><circle cx="362" cy="${round(cuffTop + 62)}" r="14" fill="#e2e8f0"/><circle cx="362" cy="${round(cuffTop + 62)}" r="5.5" fill="${palette.base}"/>
<circle cx="362" cy="${round(cuffTop + 128)}" r="15" fill="#0b0f17"/><circle cx="362" cy="${round(cuffTop + 128)}" r="9.5" fill="#cbd5e1"/>`
      : ''
  }
  <text x="474" y="${round(cuffTop + 10)}" fill="${palette.ink}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="13" font-weight="800" letter-spacing="2.6" text-anchor="end" opacity="0.85">${esc(brand.toUpperCase())}</text>
  <text x="316" y="${round(cuffTop + 11)}" fill="${palette.ink}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="16" font-weight="900" opacity="0.92">${flex}/10</text>
</g>`;

  return `${shadow(226, 134, 9, 0.42)}${compose(art, 0.85, 250, 138)}`;
};

const renderHelmet = (
  brand: string,
  specs: Record<string, string | number>,
  palette: Palette,
): string => {
  const vents = clamp(Math.round(num(specs, 'vents', 12)), 6, 21);
  const mips = /mips/.test(text(specs, 'rotational'));
  const shown = clamp(Math.round(vents / 2.4), 3, 8);

  // Vents sit ON the shell, following its curve — never above the crown.
  const ventSlots = Array.from({ length: shown }, (_, i) => {
    const t = i / Math.max(shown - 1, 1);
    const x = 326 + t * 168;
    const lift = Math.sin(t * Math.PI) * 10;
    return `<rect x="${round(x)}" y="${round(172 - lift)}" width="9" height="32" rx="4.5" fill="#05080f" opacity="0.8"/>`;
  }).join('');

  const art = `
<g>
  <path d="M254 268 Q248 150 400 148 Q552 150 546 268 Q546 286 528 286 L272 286 Q254 286 254 268 Z" fill="url(#topsheet)" stroke="#0b0f17" stroke-width="2.6"/>
  <path d="M254 268 Q248 150 400 148 Q552 150 546 268 Q546 286 528 286 L272 286 Q254 286 254 268 Z" fill="url(#sheen)"/>
  ${ventSlots}
  <path d="M250 268 Q400 250 550 268 L552 284 Q400 264 248 284 Z" fill="#0b0f17"/>
  <path d="M262 284 Q246 322 272 340 Q300 350 312 330 L306 286 Z" fill="#131a25" stroke="#0b0f17" stroke-width="2"/>
  <path d="M538 284 Q554 322 528 340 Q500 350 488 330 L494 286 Z" fill="#131a25" stroke="#0b0f17" stroke-width="2"/>
  <path d="M304 336 Q400 366 496 336" fill="none" stroke="#1f2937" stroke-width="7" stroke-linecap="round"/>
  <path d="M382 148 h36 v12 h-36 Z" fill="${palette.accent}" opacity="0.7"/>
  <text x="400" y="248" fill="${palette.ink}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="17" font-weight="800" letter-spacing="3.6" text-anchor="middle" opacity="0.9">${esc(brand.toUpperCase())}</text>
  ${
    mips
      ? `<g transform="translate(462 218)"><rect x="0" y="0" width="62" height="21" rx="10.5" fill="#0b0f17" opacity="0.92"/><text x="31" y="15" fill="${palette.accent}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="12" font-weight="900" letter-spacing="1.6" text-anchor="middle">MIPS</text></g>`
      : ''
  }
</g>`;

  return `${shadow(226, 122, 9, 0.42)}${compose(art, 0.8, 252, 138)}`;
};

/** Map a marketing lens name onto an approximate visible tint. */
const lensTintColour = (tint: string): string => {
  if (/storm|rose|pink/.test(tint)) return '#f2a8ad';
  if (/yellow|amber|gold/.test(tint)) return '#ffd76b';
  if (/sapphire|blue|sky/.test(tint)) return '#5b95f5';
  if (/torch|orange|fire/.test(tint)) return '#ff9146';
  if (/onyx|black|sun/.test(tint)) return '#3b4354';
  if (/violet|purple/.test(tint)) return '#a78bfa';
  if (/green|jade/.test(tint)) return '#4ade80';
  if (/clear/.test(tint)) return '#dbeafe';
  return '#7dd3fc';
};

const renderGoggles = (
  brand: string,
  specs: Record<string, string | number>,
  palette: Palette,
): string => {
  const vlt = num(specs, 'vlt', 25);
  const tint = lensTintColour(text(specs, 'lensTint'));
  const spherical = /spherical|toric|birdseye/.test(text(specs, 'lensShape'));
  // High VLT reads bright and translucent; low VLT reads dark and mirrored.
  const lensOpacity = round(clamp(0.42 + vlt / 130, 0.42, 0.95));
  const mirror = vlt < 25;
  const curve = spherical ? 34 : 16;

  const art = `
<g>
  <path d="M96 196 Q400 170 704 196 L704 240 Q400 216 96 240 Z" fill="${palette.deep}" stroke="#0b0f17" stroke-width="2"/>
  <path d="M110 210 Q400 186 690 210" fill="none" stroke="${palette.accent}" stroke-width="6" opacity="0.5" stroke-linecap="round"/>
  <path d="M212 168 Q400 ${round(148 - curve * 0.5)} 588 168 Q612 176 610 214 Q606 274 566 288 Q400 314 234 288 Q194 274 190 214 Q188 176 212 168 Z" fill="#111827" stroke="#0b0f17" stroke-width="3"/>
  <defs>
    <linearGradient id="lens" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="${round(mirror ? 0.55 : 0.3)}"/>
      <stop offset="0.42" stop-color="${tint}" stop-opacity="${lensOpacity}"/>
      <stop offset="1" stop-color="${tint}" stop-opacity="${round(clamp(lensOpacity + 0.15, 0, 1))}"/>
    </linearGradient>
  </defs>
  <path d="M228 180 Q400 ${round(162 - curve * 0.5)} 572 180 Q592 188 590 214 Q586 262 552 274 Q400 296 248 274 Q214 262 210 214 Q208 188 228 180 Z" fill="url(#lens)" stroke="#0b0f17" stroke-width="2"/>
  <path d="M252 194 Q330 180 404 184 Q330 206 268 226 Z" fill="#ffffff" opacity="0.22"/>
  <path d="M366 290 Q400 306 434 290 Q400 300 366 290 Z" fill="#0b0f17"/>
  <text x="300" y="301" fill="${palette.ink}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14" font-weight="800" letter-spacing="3" text-anchor="middle" opacity="0.85">${esc(brand.toUpperCase())}</text>
  <path d="M190 200 L152 194 L152 228 L192 226 Z" fill="#0b0f17"/>
  <path d="M610 200 L648 194 L648 228 L608 226 Z" fill="#0b0f17"/>
</g>`;

  return `${shadow(222, 168, 10, 0.4)}${compose(art, 0.95, 240, 142)}`;
};

const renderJacket = (
  brand: string,
  specs: Record<string, string | number>,
  palette: Palette,
): string => {
  const warmth = num(specs, 'warmth', 3);
  const insulation = text(specs, 'insulation');
  const down = /down/.test(insulation);
  const pitZips = Boolean(specs.pitZips);

  // Down jackets get horizontal baffles; the loftier the fill, the more of them.
  const baffleCount = down ? clamp(Math.round(warmth) + 4, 5, 9) : 0;
  const baffles = Array.from({ length: baffleCount }, (_, i) => {
    const y = 186 + i * ((310 - 186) / baffleCount);
    return `<path d="M300 ${round(y)} Q400 ${round(y + 6)} 500 ${round(y)}" fill="none" stroke="#0b0f17" stroke-width="2.2" opacity="0.45"/>`;
  }).join('');

  const art = `
<g>
  <path d="M296 158 L236 186 Q214 196 216 220 L228 300 Q232 316 250 314 L280 308 L292 190 Z" fill="url(#topsheet)" stroke="#0b0f17" stroke-width="2.4"/>
  <path d="M504 158 L564 186 Q586 196 584 220 L572 300 Q568 316 550 314 L520 308 L508 190 Z" fill="url(#topsheet)" stroke="#0b0f17" stroke-width="2.4"/>
  <path d="M296 156 Q400 178 504 156 L520 310 Q400 330 280 310 Z" fill="url(#topsheet)" stroke="#0b0f17" stroke-width="2.6"/>
  <path d="M296 156 Q400 178 504 156 L520 310 Q400 330 280 310 Z" fill="url(#sheen)"/>
  ${baffles}
  <path d="M330 158 Q332 96 400 96 Q468 96 470 158 Q400 176 330 158 Z" fill="${palette.deep}" stroke="#0b0f17" stroke-width="2.4"/>
  <path d="M348 152 Q352 112 400 112 Q448 112 452 152 Q400 166 348 152 Z" fill="#0b0f17" opacity="0.55"/>
  <path d="M400 168 L400 320" stroke="#0b0f17" stroke-width="4"/>
  <path d="M400 168 L400 320" stroke="${palette.accent}" stroke-width="1.6" opacity="0.7" stroke-dasharray="3 4"/>
  <path d="M316 252 L360 248 M440 248 L484 252" stroke="#0b0f17" stroke-width="3.4" stroke-linecap="round"/>
  ${
    pitZips
      ? `<path d="M300 194 Q288 226 292 258" fill="none" stroke="#0b0f17" stroke-width="3" stroke-dasharray="4 4"/><path d="M500 194 Q512 226 508 258" fill="none" stroke="#0b0f17" stroke-width="3" stroke-dasharray="4 4"/>`
      : ''
  }
  <path d="M282 306 Q400 326 518 306" fill="none" stroke="#0b0f17" stroke-width="5" opacity="0.6"/>
  <rect x="330" y="176" width="34" height="9" rx="4.5" fill="${palette.accent}" opacity="0.8"/>
</g>`;

  return `${shadow(228, 126, 9, 0.42)}${compose(art, 0.74, 213, 136)}`;
};

const renderSnowboardBinding = (
  brand: string,
  specs: Record<string, string | number>,
  palette: Palette,
): string => {
  const flexMatch = text(specs, 'flexRating').match(/(\d+)/);
  const flex = flexMatch ? clamp(Number(flexMatch[1]), 1, 10) : 6;
  const highbackTop = round(258 - flex * 6.5);

  const art = `
<g>
  <path d="M280 300 Q400 316 520 300 L536 344 Q400 362 264 344 Z" fill="${palette.deep}" stroke="#0b0f17" stroke-width="2.4"/>
  <path d="M300 300 L500 300" stroke="#0b0f17" stroke-width="1.5" opacity="0.5"/>
  <path d="M320 ${highbackTop} Q400 ${round(highbackTop - 12)} 480 ${highbackTop} L488 300 L312 300 Z" fill="url(#topsheet)" stroke="#0b0f17" stroke-width="2.6"/>
  <path d="M320 ${highbackTop} Q400 ${round(highbackTop - 12)} 480 ${highbackTop} L488 300 L312 300 Z" fill="url(#sheen)"/>
  <rect x="330" y="${round(highbackTop + 26)}" width="140" height="14" rx="7" fill="#0b0f17" opacity="0.85"/>
  <path d="M296 262 Q400 246 504 262 L512 280 Q400 264 288 280 Z" fill="#111827" stroke="#0b0f17" stroke-width="2"/>
  <rect x="360" y="266" width="80" height="10" rx="5" fill="${palette.accent}" opacity="0.7"/>
  <text x="400" y="330" fill="${palette.ink}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="15" font-weight="800" letter-spacing="3" text-anchor="middle" opacity="0.9">${esc(brand.toUpperCase())}</text>
</g>`;

  return `${shadow(228, 118, 9, 0.42)}${compose(art, 0.85, 300, 142)}`;
};

const renderSkiBinding = (
  brand: string,
  specs: Record<string, string | number>,
  palette: Palette,
): string => {
  const dinNumbers = text(specs, 'dinRange').match(/[\d.]+/g)?.map(Number) ?? [];
  const dinMax = dinNumbers[dinNumbers.length - 1] ?? 10;

  const dialTicks = Array.from({ length: 6 }, (_, i) => {
    const x = 486 + i * 8;
    return `<line x1="${x}" y1="248" x2="${x}" y2="${round(248 - (i + 1) * 2.2)}" stroke="${palette.accent}" stroke-width="1.6" opacity="0.7"/>`;
  }).join('');

  const art = `
<g>
  <path d="M240 300 h320 v14 h-320 Z" fill="#111827" stroke="#0b0f17" stroke-width="2"/>
  <path d="M256 300 L544 300" stroke="#0b0f17" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.6"/>
  <path d="M258 300 L258 276 Q258 262 274 260 L318 254 Q332 252 336 264 L340 300 Z" fill="url(#topsheet)" stroke="#0b0f17" stroke-width="2.4"/>
  <path d="M258 300 L258 276 Q258 262 274 260 L318 254 Q332 252 336 264 L340 300 Z" fill="url(#sheen)"/>
  <rect x="460" y="256" width="66" height="44" rx="8" fill="url(#topsheet)" stroke="#0b0f17" stroke-width="2.4"/>
  <rect x="460" y="256" width="66" height="44" rx="8" fill="url(#sheen)"/>
  ${dialTicks}
  <circle cx="493" cy="278" r="10" fill="#0b0f17"/>
  <text x="493" y="282" fill="${palette.accent}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" font-weight="900" text-anchor="middle">${round(dinMax)}</text>
  <text x="400" y="336" fill="${palette.ink}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="15" font-weight="800" letter-spacing="3" text-anchor="middle" opacity="0.9">${esc(brand.toUpperCase())}</text>
</g>`;

  return `${shadow(228, 150, 9, 0.42)}${compose(art, 0.85, 300, 142)}`;
};

/* ------------------------------------------------------------------ */
/*  Public entry point                                                 */
/* ------------------------------------------------------------------ */

export interface GearImageInput {
  id: string;
  brand: string;
  category: GearCategory;
  specs: Record<string, string | number>;
  activity?: Activity | 'both';
}

/**
 * Render an item as a self-contained SVG data URI.
 * Deterministic: the same item always produces byte-identical output.
 */
export const buildGearImage = (item: GearImageInput): string => {
  const palette = paletteFor(item.brand);
  let body: string;

  switch (item.category) {
    case 'skis':
      body =
        item.activity === 'snowboard'
          ? renderSnowboard(item.brand, item.specs, palette)
          : renderSkis(item.brand, item.specs, palette);
      break;
    case 'boots':
      body =
        item.activity === 'snowboard'
          ? renderSnowboardBoot(item.brand, item.specs, palette)
          : renderSkiBoot(item.brand, item.specs, palette);
      break;
    case 'helmet':
      body = renderHelmet(item.brand, item.specs, palette);
      break;
    case 'goggles':
      body = renderGoggles(item.brand, item.specs, palette);
      break;
    case 'jacket':
      body = renderJacket(item.brand, item.specs, palette);
      break;
    case 'bindings':
      body =
        item.activity === 'snowboard'
          ? renderSnowboardBinding(item.brand, item.specs, palette)
          : renderSkiBinding(item.brand, item.specs, palette);
      break;
    default:
      body = '';
  }

  const svg = frame(item.id, palette, body).replace(/\n\s*/g, ' ').trim();
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export default buildGearImage;
