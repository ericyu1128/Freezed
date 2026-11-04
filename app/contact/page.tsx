import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — Freezed',
  description: 'Get in touch with Freezed.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-8 pt-12 sm:px-6">
      <h1 className="font-display text-4xl font-black text-white">Contact</h1>

      <p className="mt-6 text-base leading-relaxed text-slate-300">
        Have a question about Freezed or a gear recommendation? Email{' '}
        <a href="mailto:ericyu112807@gmail.com" className="text-frost-300 hover:underline">
          ericyu112807@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
