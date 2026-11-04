'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { REGION_CURRENCY, type Currency, type Region } from '@/lib/retailers';

export const REGION_STORAGE_KEY = 'freezed:region';

/** Canada first: the default shopper is in CAD. */
export const DEFAULT_REGION: Region = 'CA';

interface RegionContextValue {
  region: Region;
  currency: Currency;
  setRegion: (region: Region) => void;
}

const RegionContext = createContext<RegionContextValue | null>(null);

const isRegion = (value: string | null): value is Region => value === 'CA' || value === 'US';

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<Region>(DEFAULT_REGION);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(REGION_STORAGE_KEY);
      if (isRegion(stored)) setRegionState(stored);
    } catch {
      // Storage blocked (private mode, disabled cookies) — keep the default.
    }
  }, []);

  const setRegion = useCallback((next: Region) => {
    setRegionState(next);
    try {
      window.localStorage.setItem(REGION_STORAGE_KEY, next);
    } catch {
      // Storage blocked — the choice still applies for this session.
    }
  }, []);

  const value = useMemo<RegionContextValue>(
    () => ({ region, currency: REGION_CURRENCY[region], setRegion }),
    [region, setRegion],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextValue {
  const context = useContext(RegionContext);
  if (!context) throw new Error('useRegion must be used within a RegionProvider');
  return context;
}
