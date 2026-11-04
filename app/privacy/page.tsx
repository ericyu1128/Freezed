import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy — Freezed',
  description: 'What Freezed collects, how it is used, and how affiliate links work.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-8 pt-12 sm:px-6">
      <h1 className="font-display text-4xl font-black text-white">Privacy</h1>

      <div className="mt-6 space-y-5 text-base leading-relaxed text-slate-300">
        <p>
          Freezed has no accounts and no login. The only things you enter are the inputs for a
          recommendation: height, weight, ability, riding style, temperature and budget. No
          personal data is stored by Freezed.
        </p>
        <p>
          Those inputs are used only to generate your gear recommendation during that session.
        </p>
        <p>
          Freezed participates in affiliate programs. Some links on the site are affiliate links,
          and Freezed may earn a commission if you buy through them, at no extra cost to you.
        </p>
        <p>
          When you click a retailer link, the retailer&apos;s affiliate program may set a tracking
          cookie. Those cookies are set by the retailer, not by Freezed.
        </p>
        <p>
          Contact:{' '}
          <a href="mailto:ericyu112807@gmail.com" className="text-frost-300 hover:underline">
            ericyu112807@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
