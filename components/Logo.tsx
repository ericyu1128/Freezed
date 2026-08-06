interface LogoProps {
  className?: string;
}

/** Freezed mark — a stylised snowflake inside an icy rounded square. */
export default function Logo({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-label="Freezed logo" role="img">
      <defs>
        <linearGradient id="freezed-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="55%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="freezed-logo-flake" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>

      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#freezed-logo-bg)" />
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="13"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />

      <g
        stroke="url(#freezed-logo-flake)"
        strokeWidth="2.4"
        strokeLinecap="round"
        transform="translate(24 24)"
      >
        {[0, 60, 120].map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <line x1="0" y1="-13" x2="0" y2="13" />
            <line x1="0" y1="-13" x2="-4.5" y2="-8.5" />
            <line x1="0" y1="-13" x2="4.5" y2="-8.5" />
            <line x1="0" y1="13" x2="-4.5" y2="8.5" />
            <line x1="0" y1="13" x2="4.5" y2="8.5" />
            <line x1="0" y1="-6.5" x2="-3.2" y2="-3.4" />
            <line x1="0" y1="6.5" x2="3.2" y2="3.4" />
          </g>
        ))}
      </g>
    </svg>
  );
}
