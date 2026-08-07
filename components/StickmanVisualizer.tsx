'use client';

import { useMemo } from 'react';
import type { Activity, CalculatedSpecs, GearCategory, Recommendation } from '@/lib/types';
import { CATEGORY_ORDER, categoryLabel } from '@/lib/matcherLogic';
import { categoryIcon } from './Icons';

interface Hotspot {
  category: GearCategory;
  bodyPart: string;
  /** Position within the 260 × 470 viewBox. */
  x: number;
  y: number;
  /** Which side the label chip flies out to. */
  side: 'left' | 'right';
}

const HOTSPOTS: Hotspot[] = [
  { category: 'helmet', bodyPart: 'Head', x: 130, y: 34, side: 'right' },
  { category: 'goggles', bodyPart: 'Face', x: 130, y: 74, side: 'left' },
  { category: 'jacket', bodyPart: 'Torso', x: 130, y: 168, side: 'right' },
  { category: 'boots', bodyPart: 'Feet', x: 130, y: 368, side: 'left' },
  { category: 'bindings', bodyPart: 'Bindings', x: 130, y: 400, side: 'left' },
  { category: 'skis', bodyPart: 'Base', x: 130, y: 424, side: 'right' },
];

/**
 * One distinct accent per gear category so the figure reads as actually
 * "dressed" — each equipped zone, its marker and its gear tag all share the
 * same colour, tying the SVG figure to the badges below it.
 */
const CATEGORY_TAG: Record<
  GearCategory,
  {
    /** Raw hex used for inline SVG stroke/glow, which cannot consume Tailwind classes. */
    accent: string;
    markerBorder: string;
    markerText: string;
    ring: string;
    chipBorder: string;
    chipBg: string;
    chipText: string;
    dot: string;
  }
> = {
  helmet: {
    accent: '#38bdf8',
    markerBorder: 'border-frost-400/70',
    markerText: 'text-frost-200',
    ring: 'bg-frost-400/50',
    chipBorder: 'border-frost-400/40',
    chipBg: 'bg-frost-400/12',
    chipText: 'text-frost-100',
    dot: 'bg-frost-400',
  },
  goggles: {
    accent: '#67e8f9',
    markerBorder: 'border-neon-ice/70',
    markerText: 'text-neon-ice',
    ring: 'bg-neon-ice/50',
    chipBorder: 'border-neon-ice/40',
    chipBg: 'bg-neon-ice/12',
    chipText: 'text-neon-ice',
    dot: 'bg-neon-ice',
  },
  jacket: {
    accent: '#a78bfa',
    markerBorder: 'border-neon-violet/70',
    markerText: 'text-neon-violet',
    ring: 'bg-neon-violet/50',
    chipBorder: 'border-neon-violet/40',
    chipBg: 'bg-neon-violet/12',
    chipText: 'text-violet-100',
    dot: 'bg-neon-violet',
  },
  boots: {
    accent: '#5eead4',
    markerBorder: 'border-neon-mint/70',
    markerText: 'text-neon-mint',
    ring: 'bg-neon-mint/50',
    chipBorder: 'border-neon-mint/40',
    chipBg: 'bg-neon-mint/12',
    chipText: 'text-neon-mint',
    dot: 'bg-neon-mint',
  },
  skis: {
    accent: '#7dd3fc',
    markerBorder: 'border-frost-300/70',
    markerText: 'text-frost-200',
    ring: 'bg-frost-300/50',
    chipBorder: 'border-frost-300/40',
    chipBg: 'bg-frost-300/12',
    chipText: 'text-frost-100',
    dot: 'bg-frost-300',
  },
  bindings: {
    accent: '#fbbf24',
    markerBorder: 'border-amber-400/70',
    markerText: 'text-amber-200',
    ring: 'bg-amber-400/50',
    chipBorder: 'border-amber-400/40',
    chipBg: 'bg-amber-400/12',
    chipText: 'text-amber-100',
    dot: 'bg-amber-400',
  },
};

/** Hex string + alpha -> rgba(), used to derive per-category zone fills from `CATEGORY_TAG.accent`. */
const hexToRgba = (hex: string, alpha: number): string => {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface StickmanVisualizerProps {
  activity: Activity;
  recommendations: Recommendation[];
  activeCategory: GearCategory | null;
  onHover: (category: GearCategory | null) => void;
  onSelect: (category: GearCategory) => void;
  specs?: CalculatedSpecs;
}

export default function StickmanVisualizer({
  activity,
  recommendations,
  activeCategory,
  onHover,
  onSelect,
  specs,
}: StickmanVisualizerProps) {
  const byCategory = useMemo(() => {
    const map = new Map<GearCategory, Recommendation>();
    recommendations.forEach((rec) => map.set(rec.category, rec));
    return map;
  }, [recommendations]);

  const isEquipped = (category: GearCategory) => byCategory.has(category);
  const isActive = (category: GearCategory) => activeCategory === category;

  /** Stroke colour for a body zone: bright white when active, the item's own accent when equipped, dim otherwise. */
  const zoneStroke = (category: GearCategory) =>
    isActive(category) ? '#ffffff' : isEquipped(category) ? CATEGORY_TAG[category].accent : '#475569';

  const zoneFill = (category: GearCategory, equippedFill?: string) =>
    isActive(category)
      ? 'rgba(255,255,255,0.22)'
      : isEquipped(category)
        ? (equippedFill ?? hexToRgba(CATEGORY_TAG[category].accent, 0.3))
        : 'rgba(71,85,105,0.18)';

  const zoneGlow = (category: GearCategory) =>
    isActive(category)
      ? 'drop-shadow(0 0 12px rgba(255,255,255,0.75))'
      : isEquipped(category)
        ? `drop-shadow(0 0 7px ${hexToRgba(CATEGORY_TAG[category].accent, 0.6)})`
        : 'none';

  return (
    <div className="glass-strong relative p-5 sm:p-6">
      {/* Panel header */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-white">Your loadout</h3>
          <p className="text-xs text-slate-400">
            {recommendations.length > 0
              ? 'Hover a marker to highlight the matching card'
              : 'Markers light up once you run the matcher'}
          </p>
        </div>
        <span className="pill shrink-0">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              recommendations.length > 0 ? 'bg-neon-mint' : 'bg-slate-600'
            }`}
          />
          {byCategory.size}/{CATEGORY_ORDER.length} equipped
        </span>
      </div>

      {/* Figure */}
      <div className="relative mx-auto aspect-[260/470] w-full max-w-[320px]">
        {/* Ambient floor glow */}
        <div className="pointer-events-none absolute inset-x-6 bottom-6 h-24 rounded-[50%] bg-frost-400/20 blur-2xl" />

        <svg
          viewBox="0 0 260 470"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Stickman rider showing recommended gear placement"
        >
          <defs>
            <linearGradient id="jacket-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="ski-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <radialGradient id="lens-grad" cx="0.35" cy="0.3" r="0.85">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.55" />
            </radialGradient>
          </defs>

          {/* ---------- snow / ground line ---------- */}
          <path
            d="M18 432 Q 70 420 130 428 T 244 430"
            stroke="rgba(148,163,184,0.28)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* ---------- BASE: skis or snowboard ---------- */}
          <g
            style={{ filter: zoneGlow('skis'), transition: 'filter 300ms ease' }}
            onMouseEnter={() => onHover('skis')}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect('skis')}
            className="cursor-pointer"
          >
            {activity === 'ski' ? (
              <>
                <rect
                  x="46"
                  y="404"
                  width="76"
                  height="9"
                  rx="4.5"
                  fill={isEquipped('skis') ? 'url(#ski-grad)' : 'rgba(71,85,105,0.5)'}
                  stroke={zoneStroke('skis')}
                  strokeWidth="1.5"
                />
                <path
                  d="M46 408.5c-6-1.5-9-5-10-9"
                  stroke={zoneStroke('skis')}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <rect
                  x="138"
                  y="404"
                  width="76"
                  height="9"
                  rx="4.5"
                  fill={isEquipped('skis') ? 'url(#ski-grad)' : 'rgba(71,85,105,0.5)'}
                  stroke={zoneStroke('skis')}
                  strokeWidth="1.5"
                />
                <path
                  d="M214 408.5c6-1.5 9-5 10-9"
                  stroke={zoneStroke('skis')}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* poles */}
                <path
                  d="M40 214v186M220 214v186"
                  stroke={isEquipped('skis') ? 'rgba(148,163,184,0.75)' : 'rgba(71,85,105,0.55)'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="40" cy="392" r="7" fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="2" />
                <circle cx="220" cy="392" r="7" fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="2" />
              </>
            ) : (
              <g transform="rotate(-8 130 408)">
                <rect
                  x="42"
                  y="401"
                  width="176"
                  height="13"
                  rx="6.5"
                  fill={isEquipped('skis') ? 'url(#ski-grad)' : 'rgba(71,85,105,0.5)'}
                  stroke={zoneStroke('skis')}
                  strokeWidth="1.5"
                />
                <path
                  d="M90 401v13M170 401v13"
                  stroke="rgba(5,10,20,0.55)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
            )}
          </g>

          {/* ---------- BINDINGS ---------- */}
          <g
            style={{ filter: zoneGlow('bindings'), transition: 'filter 300ms ease' }}
            onMouseEnter={() => onHover('bindings')}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect('bindings')}
            className="cursor-pointer"
          >
            <rect
              x="72"
              y="396"
              width="26"
              height="12"
              rx="3"
              fill={zoneFill('bindings')}
              stroke={zoneStroke('bindings')}
              strokeWidth="2"
            />
            <rect
              x="162"
              y="396"
              width="26"
              height="12"
              rx="3"
              fill={zoneFill('bindings')}
              stroke={zoneStroke('bindings')}
              strokeWidth="2"
            />
          </g>

          {/* ---------- BOOTS ---------- */}
          <g
            style={{ filter: zoneGlow('boots'), transition: 'filter 300ms ease' }}
            onMouseEnter={() => onHover('boots')}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect('boots')}
            className="cursor-pointer"
          >
            <rect
              x="70"
              y="358"
              width="30"
              height="46"
              rx="9"
              fill={zoneFill('boots')}
              stroke={zoneStroke('boots')}
              strokeWidth="2.5"
            />
            <rect
              x="160"
              y="358"
              width="30"
              height="46"
              rx="9"
              fill={zoneFill('boots')}
              stroke={zoneStroke('boots')}
              strokeWidth="2.5"
            />
            <path
              d="M72 372h26M72 386h26M162 372h26M162 386h26"
              stroke={isEquipped('boots') ? 'rgba(224,242,254,0.8)' : 'rgba(148,163,184,0.4)'}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* ---------- LEGS ---------- */}
          <path
            d="M113 250 L85 362M147 250 L175 362"
            stroke="#94a3b8"
            strokeWidth="13"
            strokeLinecap="round"
            fill="none"
          />

          {/* ---------- ARMS ---------- */}
          <path
            d="M92 158 L44 216M168 158 L216 216"
            stroke="#94a3b8"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />

          {/* ---------- TORSO / JACKET ---------- */}
          <g
            style={{ filter: zoneGlow('jacket'), transition: 'filter 300ms ease' }}
            onMouseEnter={() => onHover('jacket')}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect('jacket')}
            className="cursor-pointer"
          >
            <path
              d="M130 118c-16 0-30 5-38 12-6 5-8 12-8 20v92c0 8 5 14 13 14h66c8 0 13-6 13-14v-92c0-8-2-15-8-20-8-7-22-12-38-12Z"
              fill={
                isActive('jacket')
                  ? 'rgba(255,255,255,0.25)'
                  : isEquipped('jacket')
                    ? 'url(#jacket-grad)'
                    : 'rgba(71,85,105,0.28)'
              }
              stroke={zoneStroke('jacket')}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* zip + pocket detail */}
            <path
              d="M130 122v134"
              stroke={isEquipped('jacket') ? 'rgba(224,242,254,0.85)' : 'rgba(148,163,184,0.4)'}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M100 226h18M142 226h18"
              stroke={isEquipped('jacket') ? 'rgba(224,242,254,0.6)' : 'rgba(148,163,184,0.3)'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* ---------- NECK ---------- */}
          <rect x="122" y="104" width="16" height="20" rx="7" fill="#94a3b8" />

          {/* ---------- HEAD ---------- */}
          <circle cx="130" cy="76" r="30" fill="#cbd5e1" />

          {/* ---------- GOGGLES ---------- */}
          <g
            style={{ filter: zoneGlow('goggles'), transition: 'filter 300ms ease' }}
            onMouseEnter={() => onHover('goggles')}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect('goggles')}
            className="cursor-pointer"
          >
            <rect
              x="99"
              y="63"
              width="62"
              height="26"
              rx="12"
              fill={
                isActive('goggles')
                  ? 'rgba(255,255,255,0.85)'
                  : isEquipped('goggles')
                    ? 'url(#lens-grad)'
                    : 'rgba(71,85,105,0.5)'
              }
              stroke={zoneStroke('goggles')}
              strokeWidth="2.5"
            />
            <path
              d="M99 70H92M161 70h7"
              stroke={zoneStroke('goggles')}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {isEquipped('goggles') && (
              <path
                d="M108 82c4-8 11-13 19-14"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.75"
              />
            )}
          </g>

          {/* ---------- HELMET ---------- */}
          <g
            style={{ filter: zoneGlow('helmet'), transition: 'filter 300ms ease' }}
            onMouseEnter={() => onHover('helmet')}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect('helmet')}
            className="cursor-pointer"
          >
            <path
              d="M96 62a34 34 0 0 1 68 0v4a3 3 0 0 1-3 3H99a3 3 0 0 1-3-3Z"
              fill={zoneFill('helmet')}
              stroke={zoneStroke('helmet')}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M96 60h68"
              stroke={isEquipped('helmet') ? 'rgba(224,242,254,0.8)' : 'rgba(148,163,184,0.4)'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M118 34v8M130 31v8M142 34v8"
              stroke={isEquipped('helmet') ? 'rgba(224,242,254,0.7)' : 'rgba(148,163,184,0.35)'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* ---------- Interactive markers overlay ---------- */}
        {HOTSPOTS.map((hotspot) => {
          const rec = byCategory.get(hotspot.category);
          const equipped = Boolean(rec);
          const active = isActive(hotspot.category);

          return (
            <button
              key={hotspot.category}
              type="button"
              onMouseEnter={() => onHover(hotspot.category)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(hotspot.category)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(hotspot.category)}
              aria-label={`${hotspot.bodyPart}: ${
                rec ? `${rec.item.brand} ${rec.item.name}` : 'no recommendation yet'
              }`}
              className="focus-ring group absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(hotspot.x / 260) * 100}%`,
                top: `${(hotspot.y / 470) * 100}%`,
              }}
            >
              {/* pulsing ring — colour matches this item's gear tag below */}
              {equipped && (
                <span
                  className={`absolute inset-0 rounded-full ${
                    active ? 'bg-white/60' : CATEGORY_TAG[hotspot.category].ring
                  } animate-pulse-ring`}
                />
              )}

              {/* marker dot */}
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                  active
                    ? 'scale-110 border-white bg-white text-glacier-1000 shadow-glow-lg'
                    : equipped
                      ? `${CATEGORY_TAG[hotspot.category].markerBorder} bg-glacier-900/90 ${CATEGORY_TAG[hotspot.category].markerText} shadow-glow backdrop-blur`
                      : 'border-white/15 bg-glacier-900/80 text-slate-600'
                }`}
              >
                {categoryIcon(hotspot.category, activity, 'h-4 w-4')}
              </span>

              {/* flyout label */}
              <span
                className={`pointer-events-none absolute top-1/2 z-30 max-w-[min(11rem,calc(100vw-2rem))] -translate-y-1/2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] leading-tight backdrop-blur-xl transition-all duration-300 ${
                  hotspot.side === 'right'
                    ? 'left-full ml-2 origin-left'
                    : 'right-full mr-2 origin-right'
                } ${
                  active
                    ? 'scale-100 border-white/40 bg-white/15 opacity-100'
                    : 'scale-90 border-white/10 bg-glacier-900/80 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                }`}
              >
                <span className="block font-semibold text-white">
                  {categoryLabel(hotspot.category, activity)}
                </span>
                <span className="block text-slate-400">
                  {rec ? `${rec.item.brand} ${rec.item.name}` : 'Awaiting match'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Colour-coded gear tags — the same accent worn on the figure above */}
      {recommendations.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Equipped gear
          </p>
          <div className="flex flex-wrap gap-1.5">
            {recommendations.map((rec) => {
              const tag = CATEGORY_TAG[rec.category];
              const active = isActive(rec.category);
              return (
                <button
                  key={rec.category}
                  type="button"
                  onMouseEnter={() => onHover(rec.category)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onSelect(rec.category)}
                  className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all duration-300 ${
                    active
                      ? 'scale-105 border-white/50 bg-white/15 text-white shadow-glow'
                      : `${tag.chipBorder} ${tag.chipBg} ${tag.chipText} hover:scale-105`
                  }`}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-white' : tag.dot}`} />
                  {rec.item.brand} {rec.item.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Key metrics under the figure */}
      {specs && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricChip
            label={specs.length.label}
            value={`${specs.length.value} cm`}
            accent
          />
          <MetricChip
            label={activity === 'snowboard' ? 'Waist' : 'Waist width'}
            value={`${specs.waistWidth.min}–${specs.waistWidth.max}`}
          />
          <MetricChip label="Boot flex" value={`${specs.bootFlex.min}–${specs.bootFlex.max}`} />
          <MetricChip label="Lens VLT" value={`${specs.vlt.min}–${specs.vlt.max}%`} />
        </div>
      )}
    </div>
  );
}

function MetricChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        accent ? 'border-frost-400/40 bg-frost-500/10' : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={`font-display text-sm font-bold tabular-nums ${
          accent ? 'text-frost-200' : 'text-slate-200'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
