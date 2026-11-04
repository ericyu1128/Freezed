import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Freezed',
  description: 'Who built Freezed, why, and how the gear matcher works.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-8 pt-12 sm:px-6">
      <h1 className="font-display text-4xl font-black text-white">About Freezed</h1>

      <div className="mt-6 space-y-5 text-base leading-relaxed text-slate-300">
        <p>
          Freezed was built by Eric Yu. Buying ski and snowboard gear is harder than it should be:
          size charts give you a number, but they don&apos;t tell you how a ski length, a waist
          width or a boot flex fits the way you actually ride.
        </p>
        <p>
          You enter your height, weight, ability, riding style, the temperatures you ride in and
          your budget. Freezed matches those against its gear catalogue and returns skis or a
          board, boots, bindings, a helmet, goggles and outerwear, each with the reason it was
          picked and prices from several retailers.
        </p>
        <p>
          It&apos;s aimed at intermediate skiers and snowboarders who are upgrading their setup and
          want to know what to look for, not just what&apos;s on sale.
        </p>
        <p>
          The recommendations are a starting point. Always have boots shell-fitted in person by a
          qualified bootfitter before you buy.
        </p>
      </div>
    </div>
  );
}
