/**
 * Freezed — saved setups vault
 * Made by Eric Yu
 *
 * Persists named snapshots of a match result to `localStorage` so a rider can
 * come back to "Deep Powder Rig" or "Park & Rails" without re-answering the
 * questionnaire. Pure browser-storage functions — no server, no network.
 */

import type { MatchResult, SavedGearSummary, SavedSetup } from './types';

const STORAGE_KEY = 'freezed:saved-setups:v1';

const isBrowser = () => typeof window !== 'undefined';

const generateId = (): string => {
  if (isBrowser() && 'randomUUID' in window.crypto) return window.crypto.randomUUID();
  return `setup-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/** Reads every saved setup, newest first. Never throws — a corrupt/blocked store just reads empty. */
export const loadSavedSetups = (): SavedSetup[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedSetup[]) : [];
  } catch {
    return [];
  }
};

const persist = (setups: SavedSetup[]): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(setups));
  } catch {
    // Storage full or blocked (private browsing) — fail silently, UI keeps working in-memory this session.
  }
};

const summarizeRecommendations = (result: MatchResult): SavedGearSummary[] =>
  result.recommendations.map((rec) => ({
    category: rec.category,
    itemId: rec.item.id,
    brand: rec.item.brand,
    name: rec.item.name,
    image: rec.item.image,
    bestPrice: rec.bestPrice.price,
    retailer: rec.bestPrice.retailer,
  }));

/** Save a new named configuration built from the current match result. Returns the updated list. */
export const addSavedSetup = (name: string, result: MatchResult): SavedSetup[] => {
  const setup: SavedSetup = {
    id: generateId(),
    name: name.trim() || 'Untitled setup',
    timestamp: new Date().toISOString(),
    stats: result.stats,
    recommendations: summarizeRecommendations(result),
    totalBestPrice: result.totalBestPrice,
  };
  const next = [setup, ...loadSavedSetups()];
  persist(next);
  return next;
};

/** Rename an existing setup in place. Returns the updated list. */
export const renameSavedSetup = (id: string, name: string): SavedSetup[] => {
  const trimmed = name.trim();
  const next = loadSavedSetups().map((setup) =>
    setup.id === id && trimmed ? { ...setup, name: trimmed } : setup,
  );
  persist(next);
  return next;
};

/** Remove a setup by id. Returns the updated list. */
export const deleteSavedSetup = (id: string): SavedSetup[] => {
  const next = loadSavedSetups().filter((setup) => setup.id !== id);
  persist(next);
  return next;
};
