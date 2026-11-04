'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics';

/** Starts PostHog on the client. Renders nothing; a no-op when no key is configured. */
export default function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics();
  }, []);
  return null;
}
