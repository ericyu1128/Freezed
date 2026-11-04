'use client';

import { useEffect } from 'react';
import { initializePostHog } from '@/lib/posthog';

export default function PostHogInit() {
  useEffect(() => {
    initializePostHog(true);
  }, []);

  return null;
}
