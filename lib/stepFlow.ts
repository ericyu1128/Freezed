/**
 * Freezed — questionnaire step machine
 * Made by Eric Yu
 *
 * The transition rules live here, separate from the form component, for one
 * reason: this is the logic that decides when results get generated, and it
 * needs to be provable without a browser. `transition()` is pure — same input,
 * same output, no React, no DOM.
 *
 * The invariant the whole thing exists to protect:
 *
 *   `complete` is true only for a `submit` raised from the final step.
 *
 * Every other combination returns `complete: false`, so no intent from a
 * mid-questionnaire step — Continue, Enter, an implicit form submit, a jump —
 * can bypass a later step and trigger results early.
 */

export const STEPS = [
  {
    id: 'discipline',
    title: 'Discipline',
    blurb: 'What are you riding, and which fit scale should we use?',
  },
  { id: 'metrics', title: 'Body metrics', blurb: 'Length and flex both scale off height and mass.' },
  {
    id: 'ability',
    title: 'Ability & style',
    blurb: 'This drives waist width, length and boot stiffness.',
  },
  { id: 'conditions', title: 'Conditions', blurb: 'Temperature sets lens VLT and jacket insulation.' },
  { id: 'budget', title: 'Budget', blurb: 'We filter the catalogue to your spend bracket.' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

export const LAST_STEP_INDEX = STEPS.length - 1;

export const indexOfStep = (id: StepId): number => STEPS.findIndex((entry) => entry.id === id);

export const stepIdAt = (index: number): StepId =>
  STEPS[Math.min(Math.max(index, 0), LAST_STEP_INDEX)].id;

/**
 * - `next`   — the Continue button
 * - `back`   — the Back button
 * - `jump`   — clicking a step chip in the progress rail
 * - `submit` — the final button, and any implicit form submission (Enter)
 */
export type StepIntent = 'next' | 'back' | 'jump' | 'submit';

export interface TransitionInput {
  /** Index of the step the user is currently on. */
  from: number;
  intent: StepIntent;
  /** Whether the current step passes its own validation. */
  stepIsValid: boolean;
  /** Destination index, for `jump` only. */
  target?: number;
}

export interface Transition {
  /** Index to move to. Equal to `from` when nothing should move. */
  to: number;
  direction: 'forward' | 'back';
  /** Generate results. True only for `submit` raised from the final step. */
  complete: boolean;
  /** Movement refused because the current step failed validation. */
  blocked: boolean;
}

const clampIndex = (index: number): number =>
  Math.min(Math.max(index, 0), LAST_STEP_INDEX);

export const transition = ({ from, intent, stepIsValid, target }: TransitionInput): Transition => {
  const current = clampIndex(from);

  if (intent === 'back') {
    const to = clampIndex(current - 1);
    return { to, direction: 'back', complete: false, blocked: false };
  }

  if (intent === 'jump') {
    const to = clampIndex(target ?? current);
    // Going backwards is always allowed; going forwards must pass validation.
    if (to > current && !stepIsValid) {
      return { to: current, direction: 'forward', complete: false, blocked: true };
    }
    return { to, direction: to < current ? 'back' : 'forward', complete: false, blocked: false };
  }

  // `next` and `submit` share one path so they can never disagree about where
  // the questionnaire goes — they differ only in what happens at the very end.
  if (!stepIsValid) {
    return { to: current, direction: 'forward', complete: false, blocked: true };
  }

  if (current < LAST_STEP_INDEX) {
    // Not finished yet. A `submit` from here behaves exactly like Continue,
    // which is what stops an Enter keypress from skipping the budget step.
    return { to: current + 1, direction: 'forward', complete: false, blocked: false };
  }

  // On the final step: only an explicit submit finishes. `next` is a no-op.
  return { to: current, direction: 'forward', complete: intent === 'submit', blocked: false };
};

export default transition;
