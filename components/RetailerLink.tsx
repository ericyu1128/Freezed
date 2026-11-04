'use client';

/**
 * Every outbound retailer link renders through this component so they all
 * share the same new-tab, `sponsored` rel and click handling. The click is
 * stopped from bubbling so a link inside a gear card never also selects the
 * card.
 */
export default function RetailerLink({
  href,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={ariaLabel}
      onClick={(event) => event.stopPropagation()}
      className={className}
    >
      {children}
    </a>
  );
}
