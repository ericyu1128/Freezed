'use client';

import { track, type AnalyticsEvents } from '@/lib/analytics';

/**
 * Every outbound retailer link renders through this component so they all
 * share the same new-tab, `sponsored` rel, click tracking and click handling.
 * The click is stopped from bubbling so a link inside a gear card never also
 * selects the card.
 */
export default function RetailerLink({
  href,
  className,
  ariaLabel,
  tracking,
  children,
}: {
  href: string;
  className?: string;
  ariaLabel?: string;
  /** Sent as an `outbound_click` event when the link is clicked. */
  tracking: AnalyticsEvents['outbound_click'];
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation();
        track('outbound_click', tracking);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
