'use client';

import { useState } from 'react';
import type { Activity, GearCategory } from '@/lib/types';
import { categoryIcon } from './Icons';

interface GearImageProps {
  src: string;
  alt: string;
  category: GearCategory;
  activity: Activity;
  className?: string;
}

const GRADIENTS: Record<GearCategory, string> = {
  skis: 'from-frost-600/40 via-glacier-800 to-neon-violet/25',
  boots: 'from-neon-violet/30 via-glacier-800 to-frost-600/30',
  helmet: 'from-frost-500/35 via-glacier-800 to-glacier-900',
  goggles: 'from-neon-ice/25 via-glacier-800 to-frost-700/35',
  jacket: 'from-frost-400/25 via-glacier-800 to-neon-violet/25',
};

/**
 * Remote gear photo with a graceful gradient + icon fallback. Uses a plain
 * <img> so the app renders identically without the Next image optimiser.
 */
export default function GearImage({ src, alt, category, activity, className = '' }: GearImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${GRADIENTS[category]} ${className}`}
    >
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-700 ${
            loaded ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-md'
          } group-hover:scale-105`}
        />
      )}

      {(failed || !loaded) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/25">{categoryIcon(category, activity, 'h-14 w-14')}</div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-glacier-1000 via-glacier-1000/25 to-transparent" />
    </div>
  );
}
