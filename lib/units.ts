/**
 * Metric/imperial conversions for display purposes only.
 *
 * `UserStats.height`/`weight` (see lib/types.ts) stay in centimetres/kilograms
 * everywhere else in the app — matcherLogic's formulas and the Compatibility
 * Score are hardcoded to those units. These helpers exist so the input form
 * can show/accept inches and pounds while still storing the canonical value.
 */

export type UnitSystem = 'metric' | 'imperial';

const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.45359237;

export function cmToIn(cm: number): number {
  return cm / CM_PER_INCH;
}

export function inToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}
