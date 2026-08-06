import type { GearCategory } from '@/lib/types';

interface IconProps {
  className?: string;
}

const base = 'h-5 w-5';

export const SkiIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <path d="M4.5 3.5 8 19.2" strokeLinecap="round" />
    <path d="M12.5 3.5 16 19.2" strokeLinecap="round" />
    <path d="M3 19.5c1.6 1.2 3.4 1.2 5 0s3.4-1.2 5 0 3.4 1.2 5 0" strokeLinecap="round" />
    <path d="M18.5 4.2 21 6.4" strokeLinecap="round" />
  </svg>
);

export const SnowboardIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <path
      d="M7.8 2.8c-1.6 0-2.6 1.3-2.3 3l2.6 13.6c.3 1.7 1.5 2.8 3 2.8s2.3-1.2 2-2.9L10.6 5.6C10.3 3.9 9.4 2.8 7.8 2.8Z"
      strokeLinejoin="round"
    />
    <path d="M6.6 8.4h4.6M8.2 15.6h4.6" strokeLinecap="round" />
    <path d="M16 6.5 20 9M15 12.5l4 2.5" strokeLinecap="round" />
  </svg>
);

export const BootIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <path
      d="M6 3.5h4.6c.6 0 1 .5 1 1.1l-.3 7.6c0 1 .5 1.9 1.4 2.4l5.3 2.8c1 .5 1.6 1.5 1.6 2.6H6a1 1 0 0 1-1-1V4.5c0-.6.4-1 1-1Z"
      strokeLinejoin="round"
    />
    <path d="M5.2 8.5h6.2M5.2 12.2h6M3.5 20h17" strokeLinecap="round" />
  </svg>
);

export const HelmetIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <path d="M3.6 14.5a8.4 8.4 0 0 1 16.8 0v1.2a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2Z" strokeLinejoin="round" />
    <path d="M3.6 14.6h16.8" strokeLinecap="round" />
    <path d="M8 18v1.4a1.6 1.6 0 0 0 1.6 1.6h4.8a1.6 1.6 0 0 0 1.6-1.6V18" strokeLinecap="round" />
    <path d="M12 6.2v3" strokeLinecap="round" />
  </svg>
);

export const GoggleIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <rect x="2.6" y="7.4" width="18.8" height="9.2" rx="4.4" />
    <path d="M12 9.4v5.2" strokeLinecap="round" />
    <path d="M2.6 10.5H1M21.4 10.5H23" strokeLinecap="round" />
    <path d="M5.4 10.2c1.4-.9 3-1 4.4-.4" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const JacketIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <path
      d="M9 2.8 4.2 5.2A2 2 0 0 0 3 7v4.4h3v9.8h12v-9.8h3V7a2 2 0 0 0-1.2-1.8L15 2.8"
      strokeLinejoin="round"
    />
    <path d="M9 2.8 12 6l3-3.2M12 6v15.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SparkIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <path
      d="M12 2.8 13.9 9l6.2 1.9-6.2 1.9L12 19.2l-1.9-6.4L3.9 10.9 10.1 9Z"
      strokeLinejoin="round"
    />
    <path d="M19 3v3.4M17.3 4.7h3.4" strokeLinecap="round" />
  </svg>
);

export const TagIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <path
      d="M3.5 11.4V4.6a1 1 0 0 1 1-1h6.8c.3 0 .5.1.7.3l8.1 8.1a1 1 0 0 1 0 1.4l-6.8 6.8a1 1 0 0 1-1.4 0l-8.1-8.1a1 1 0 0 1-.3-.7Z"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="8" r="1.4" />
  </svg>
);

export const ThermometerIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4.2 4.2 0 1 0 4 0Z" strokeLinejoin="round" />
    <circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

export const CheckIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className}>
    <path d="m4.5 12.5 5 5 10-11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowRightIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
    <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowLeftIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
    <path d="M20 12H5m0 0 5.5-5.5M5 12l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ExternalIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
    <path d="M14 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 4 11 13" strokeLinecap="round" />
    <path
      d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const RefreshIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M20 11a8 8 0 1 0-.7 4.3" strokeLinecap="round" />
    <path d="M20 4.5V11h-6.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MountainIcon = ({ className = base }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <path d="m2.5 19 6.4-11.4L13 13.4l2.2-3.6L21.5 19Z" strokeLinejoin="round" />
    <path d="M6.6 11.6h4.6" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const categoryIcon = (
  category: GearCategory,
  activity: 'ski' | 'snowboard',
  className?: string,
) => {
  switch (category) {
    case 'skis':
      return activity === 'snowboard' ? (
        <SnowboardIcon className={className} />
      ) : (
        <SkiIcon className={className} />
      );
    case 'boots':
      return <BootIcon className={className} />;
    case 'helmet':
      return <HelmetIcon className={className} />;
    case 'goggles':
      return <GoggleIcon className={className} />;
    case 'jacket':
      return <JacketIcon className={className} />;
    default:
      return <SparkIcon className={className} />;
  }
};
