import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shoe Glitch — Sneaker cleaning, restoration & sole color',
  description:
    'A city-based sneaker cleaning and restoration marketplace. Pickup, drop-off, or mail-in. Milwaukee, Memphis, Atlanta — and counting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bone text-ink font-sans selection:bg-glitch selection:text-white">
        {children}
      </body>
    </html>
  );
}
