'use client';

import { useId, useMemo } from 'react';
import type { GearCategory, PerformanceProfile } from '@/lib/types';
import { getPerformanceAxes } from '@/lib/performanceProfile';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PerformanceHexagonProps {
  profile: PerformanceProfile;
  /** Selects which 6-axis attribute set to plot — see `GEAR_CATEGORY_AXES`. */
  category: GearCategory;
  className?: string;
  /** Hide the axis label text — used at very small render sizes. */
  showLabels?: boolean;
}

/** Fixed internal coordinate system; the wrapper controls on-page size via className. */
const VIEW = 260;
const CENTER = VIEW / 2;
const RADIUS = 76;
const RING_FRACTIONS = [0.25, 0.5, 0.75, 1];

/**
 * Responsive SVG radar/hexagon chart. No charting library — every point is a
 * trig-computed coordinate from a normalized 0–10 score per axis. The axis
 * set itself is looked up dynamically from `gear.category`, so a boot and a
 * binding plot entirely different attributes on the same six spokes.
 */
export default function PerformanceHexagon({
  profile,
  category,
  className = '',
  showLabels = true,
}: PerformanceHexagonProps) {
  const gradientId = useId();
  const { language } = useLanguage();
  const axes = useMemo(() => getPerformanceAxes(category, language), [category, language]);
  const axisCount = axes.length;

  const angleFor = (index: number) => (Math.PI * 2 * index) / axisCount - Math.PI / 2;

  const pointAt = (index: number, fraction: number) => {
    const angle = angleFor(index);
    const r = RADIUS * fraction;
    return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
  };

  const ringPolygons = RING_FRACTIONS.map((fraction) =>
    axes.map((_, index) => {
      const { x, y } = pointAt(index, fraction);
      return `${x},${y}`;
    }).join(' '),
  );

  const dataPoints = axes.map((axis, index) => {
    const value = Math.min(Math.max(profile[axis.key], 0), 10);
    return { ...pointAt(index, value / 10), value, axis };
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="h-full w-full"
        role="img"
        aria-label={`Performance hexagon: ${axes
          .map((axis) => `${axis.label} ${profile[axis.key].toFixed(1)} out of 10`)
          .join(', ')}`}
      >
        <defs>
          <linearGradient id={`hexfill-${gradientId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#5eead4" stopOpacity="0.32" />
          </linearGradient>
        </defs>

        {/* grid rings */}
        {ringPolygons.map((points, index) => (
          <polygon
            key={points}
            points={points}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={index === ringPolygons.length - 1 ? 1.25 : 0.75}
          />
        ))}

        {/* axis spokes */}
        {axes.map((axis, index) => {
          const { x, y } = pointAt(index, 1);
          return (
            <line
              key={axis.key}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={0.75}
            />
          );
        })}

        {/* data polygon */}
        <polygon
          points={dataPolygon}
          fill={`url(#hexfill-${gradientId})`}
          stroke="#7dd3fc"
          strokeWidth={1.75}
          strokeLinejoin="round"
          className="transition-[points] duration-500 ease-out"
        />

        {/* vertex dots */}
        {dataPoints.map((point) => (
          <circle
            key={point.axis.key}
            cx={point.x}
            cy={point.y}
            r={3}
            fill="#e0f2fe"
            stroke="#0ea5e9"
            strokeWidth={1}
          />
        ))}

        {/* center point */}
        <circle cx={CENTER} cy={CENTER} r={1.5} fill="rgba(255,255,255,0.35)" />

        {/* axis labels */}
        {showLabels &&
          axes.map((axis, index) => {
            const { x, y } = pointAt(index, 1.24);
            const cos = Math.cos(angleFor(index));
            const anchor = cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle';
            return (
              <text
                key={axis.key}
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="fill-slate-400 text-[9px] font-semibold uppercase tracking-wide"
              >
                {axis.short}
              </text>
            );
          })}
      </svg>
    </div>
  );
}
