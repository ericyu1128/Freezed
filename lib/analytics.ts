/**
 * Freezed — product analytics (PostHog)
 * Made by Eric Yu
 *
 * Every event name and its property shape lives in `AnalyticsEvents`, and
 * every call goes through `track()`, so TypeScript rejects an unknown event
 * or a wrong property. Anonymous usage only:
 *
 *   - Height and weight are NEVER sent. No event type has a field for them,
 *     and `quiz_complete` copies the allowed fields one by one rather than
 *     spreading `UserStats`.
 *   - Autocapture and session recording are off; only the events below and
 *     pageviews are captured. No person profiles are created.
 *
 * If `NEXT_PUBLIC_POSTHOG_KEY` is missing, `initAnalytics()` does nothing and
 * `track()` is a silent no-op — no warnings, no network.
 */

import type { PostHog } from 'posthog-js';
import type { Language } from './i18n/translations';
import type { Region, RetailerId } from './retailers';
import type { StepId } from './stepFlow';
import type { Activity, BudgetTier, GearCategory, Gender, Level, RidingStyle, Temperature } from './types';

export interface AnalyticsEvents {
  /** First interaction with step 1 of the questionnaire (once per form mount). */
  quiz_start: Record<string, never>;
  /** The questionnaire moved to another step. `step_index` is 0-based. */
  quiz_step: { step_id: StepId; step_index: number; direction: 'forward' | 'back' };
  /** The questionnaire was submitted from its final step. Deliberately has no height/weight. */
  quiz_complete: {
    activity: Activity;
    gender: Gender;
    level: Level;
    style: RidingStyle;
    temperature: Temperature;
    budgetTier: BudgetTier;
    language: Language;
    region: Region;
  };
  /** A results dashboard rendered. `top_item_ids` is in the same order as `categories`. */
  recommendations_shown: { categories: GearCategory[]; top_item_ids: string[] };
  /** A ranked candidate was picked inside a gear card. `rank` is 1-based (1 = top pick). */
  candidate_selected: { category: GearCategory; item_id: string; rank: number };
  /** A retailer link was clicked. `rank` is the item's 1-based rank in its category. */
  outbound_click: {
    retailer_id: RetailerId;
    region: Region;
    item_id: string;
    category: GearCategory;
    rank: number;
    is_top_pick: boolean;
    has_price: boolean;
  };
}

export type AnalyticsEventName = keyof AnalyticsEvents;

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

/** Events tracked before the SDK chunk finishes loading; flushed in order once it does. */
const MAX_QUEUED = 50;
const queue: [AnalyticsEventName, AnalyticsEvents[AnalyticsEventName]][] = [];

let client: PostHog | null = null;
let loading = false;

const enabled = () => typeof window !== 'undefined' && Boolean(POSTHOG_KEY);

/**
 * Call once on the client. Safe to call repeatedly; does nothing without a
 * key. The SDK is loaded with a dynamic import so it stays out of the
 * first-load bundle and is never downloaded at all when analytics is off.
 */
export const initAnalytics = (): void => {
  if (loading || !enabled() || !POSTHOG_KEY) return;
  loading = true;
  const key = POSTHOG_KEY;
  import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: POSTHOG_HOST,
        autocapture: false,
        rageclick: false,
        // 'history_change' also counts client-side navigations (/about, /privacy) as pageviews.
        capture_pageview: 'history_change',
        disable_session_recording: true,
        person_profiles: 'identified_only',
      });
      client = posthog;
      for (const [event, properties] of queue.splice(0)) posthog.capture(event, properties);
    })
    .catch(() => {
      // Chunk failed to load (offline, blocked) — analytics stays silently off.
      queue.length = 0;
    });
};

export const track = <E extends AnalyticsEventName>(event: E, properties: AnalyticsEvents[E]): void => {
  if (!enabled()) return;
  if (client) {
    client.capture(event, properties);
    return;
  }
  initAnalytics();
  if (queue.length < MAX_QUEUED) queue.push([event, properties]);
};
