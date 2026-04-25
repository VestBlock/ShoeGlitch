import type { Metadata } from 'next';
import { Fraunces, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
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
  metadataBase: new URL('https://shoeglitch.com'),
  title: 'Shoe Glitch — Sneaker cleaning, restoration & sole color',
  description:
    'A city-based sneaker cleaning and restoration marketplace. Pickup, drop-off, or mail-in. Milwaukee, Memphis, Atlanta — and counting.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://shoeglitch.com',
    siteName: 'Shoe Glitch',
    title: 'Shoe Glitch — Sneaker cleaning, restoration & sole color',
    description:
      'A city-based sneaker cleaning and restoration marketplace. Pickup, drop-off, or mail-in. Milwaukee, Memphis, Atlanta — and counting.',
    images: [
      {
        url: '/brand/og-image.jpg',
        width: 1024,
        height: 1024,
        alt: 'Shoe Glitch logo and brand preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shoe Glitch — Sneaker cleaning, restoration & sole color',
    description:
      'A city-based sneaker cleaning and restoration marketplace. Pickup, drop-off, or mail-in. Milwaukee, Memphis, Atlanta — and counting.',
    images: ['/brand/og-image.jpg'],
  },
  icons: {
    icon: [{ url: '/brand/icon.png', type: 'image/png' }],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/brand/icon.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body
        className={`${fraunces.variable} ${interTight.variable} ${jetBrainsMono.variable} min-h-screen bg-bone text-ink font-sans selection:bg-glitch selection:text-white`}
      >
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
