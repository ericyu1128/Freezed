'use client';

import { useEffect, useState } from 'react';

interface Flake {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number;
}

/**
 * Ambient background snow. Flakes are generated after mount so the server and
 * client markup always agree (no hydration mismatch from Math.random).
 */
export default function Snowfall({ count = 42 }: { count?: number }) {
  const [flakes, setFlakes] = useState<Flake[]>([]);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    setFlakes(
      Array.from({ length: count }, (_, id) => ({
        id,
        left: Math.random() * 100,
        size: 1.5 + Math.random() * 3.5,
        duration: 12 + Math.random() * 18,
        delay: Math.random() * -30,
        opacity: 0.18 + Math.random() * 0.5,
        drift: -40 + Math.random() * 90,
      })),
    );
  }, [count]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Aurora wash */}
      <div className="absolute -top-40 left-1/4 h-[38rem] w-[38rem] animate-aurora-drift rounded-full bg-frost-500/10 blur-[140px]" />
      <div className="absolute -right-32 top-1/3 h-[30rem] w-[30rem] animate-aurora-drift rounded-full bg-neon-violet/10 blur-[130px] [animation-delay:-6s]" />

      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="absolute top-0 rounded-full bg-white"
          style={
            {
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              filter: 'blur(0.3px)',
              animation: `snowfall ${flake.duration}s linear ${flake.delay}s infinite`,
              '--drift': `${flake.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
