import type { Metadata } from 'next';
import { Fraunces, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '900'],
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Shoe Glitch — Sneaker cleaning, restoration & sole color',
  description:
    'A city-based sneaker cleaning and restoration marketplace. Pickup, drop-off, or mail-in. Milwaukee, Memphis, Atlanta — and counting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body
        className={`${fraunces.variable} ${interTight.variable} ${jetBrainsMono.variable} min-h-screen bg-bone text-ink font-sans selection:bg-glitch selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
