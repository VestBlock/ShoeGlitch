import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { Badge, Card } from '@/components/ui';
import HomeHeroMotion from '@/components/HomeHeroMotion';
import TrustProofStrip from '@/components/TrustProofStrip';
import EditorialSpotlight from '@/components/EditorialSpotlight';
import HomeBodyShowcase from '@/components/HomeBodyShowcase';
import ResultsProofGrid from '@/components/ResultsProofGrid';

export const metadata: Metadata = {
  title: 'ShoeGlitch | Sneaker cleaning, restoration, pickup, and mail-in care',
  description:
    'Book sneaker cleaning, restoration, steam-assisted deep care, pickup, drop-off, and mail-in service with ShoeGlitch.',
};

export default async function HomePage() {
  const [cities, allServices] = await Promise.all([
    db.cities.all().catch(() => []),
    db.services.primary().catch(() => []),
  ]);
  const services = allServices.filter((service) => service.category !== 'luxury').slice(0, 6);
  const activeCityCount = cities.filter((city) => city.active).length;
  const trustItems = [
    {
      label: 'Local where we serve',
      detail: `${activeCityCount} active cities with pickup, drop-off, and nationwide mail-in when local service is not available.`,
    },
    {
      label: 'Photo intake first',
      detail: 'Upload your pair before checkout so we can see the condition before service begins.',
    },
    {
      label: 'Tracked from start to finish',
      detail: 'You can follow the order from intake to final return without guessing where your pair is.',
    },
    {
      label: 'Steam in every tier',
      detail: 'Basic, Pro, and Elite all start with the same Steam Clean foundation.',
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-bone">
        <div className="absolute inset-0 matrix-strip opacity-30 pointer-events-none" />
        <div className="container-x relative pt-8 pb-16 md:pt-10 md:pb-24">
          <HomeHeroMotion activeCityCount={activeCityCount} />
        </div>

        <div className="container-x relative -mt-2 pb-14 md:pb-16">
          <TrustProofStrip items={trustItems} />
        </div>

        <div className="container-x relative pb-14 md:pb-18">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                eyebrow: 'Fastest route',
                title: 'Book local pickup or drop-off',
                detail: 'Use local city coverage when you want the easiest handoff and live order tracking.',
                href: '/book',
                cta: 'Start booking →',
              },
              {
                eyebrow: 'Nationwide',
                title: 'Ship pairs in from anywhere',
                detail: 'Mail-in stays open nationwide, with prepaid labels, tracking, and an optional box kit.',
                href: '/mail-in',
                cta: 'See mail-in →',
              },
              {
                eyebrow: 'Track the next pair',
                title: 'Build a watchlist before the drop',
                detail: 'Follow releases, save the pairs that matter, and come back when alerts are worth it.',
                href: '/intelligence',
                cta: 'Open intelligence →',
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-[1.7rem] border border-ink/10 bg-white/82 p-6 shadow-[0_18px_44px_rgba(10,15,31,0.07)] transition hover:-translate-y-1 hover:border-glitch/20 hover:bg-white"
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-glitch/80">{item.eyebrow}</div>
                <h2 className="h-display mt-3 text-3xl leading-[0.96] text-ink">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ink/65">{item.detail}</p>
                <div className="mt-5 text-sm font-semibold text-glitch">{item.cta}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="container-x relative pb-14 md:pb-20">
          <div className="section-shell pulse-border p-6 md:p-8">
            <div className="absolute -right-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-cyan/20 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-36 w-36 rounded-full bg-glitch/15 blur-3xl" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="font-mono text-[11px] uppercase tracking-[0.34em] text-glitch/80">
                  Watchlists and alerts
                </div>
                <h2 className="h-display mt-3 text-3xl leading-[0.95] text-ink md:text-5xl">
                  Follow the pairs you care about before they move.
                </h2>
                <p className="mt-4 text-sm leading-6 text-ink/65 md:text-base">
                  Open the feed for release tracking, watchlists, and faster follow-up when a pair is worth saving.
                </p>
              </div>
              <Link
                href="/intelligence"
                className="btn-intelligence group shrink-0"
                data-growth-cta="Open intelligence feed"
              >
                <span className="relative z-10">Open intelligence feed</span>
                <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-y border-glitch/20 bg-ink text-bone overflow-hidden relative">
          <div className="absolute inset-0 matrix-strip opacity-40" />
          <div className="track py-5 relative">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-center gap-12 pr-12 whitespace-nowrap">
                {['BASIC', 'PRO', 'ELITE', 'STEAM CLEAN', 'DE-CREASE METHOD', 'ICE METHOD', 'STREET SHIELD', 'LACE LAB', 'DETAIL FIX'].map((item) => (
                  <span key={item} className="h-display text-4xl md:text-5xl flex items-center gap-12">
                    <span>{item}</span>
                    <span className="text-cyan">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <EditorialSpotlight />

      <HomeBodyShowcase
        services={services.map((service) => ({
          id: service.id,
          slug: service.slug,
          name: service.name,
          tagline: service.tagline,
          basePrice: service.basePrice,
          priceMin: service.priceMin ?? null,
          category: service.category,
        }))}
        cities={cities.map((city) => ({
          id: city.id,
          name: city.name,
          state: city.state,
          active: city.active,
          defaultPickupFee: city.defaultPickupFee,
          defaultRushFee: city.defaultRushFee,
        }))}
        activeCityCount={activeCityCount}
      />

      <ResultsProofGrid showTestimonials={false} />
    </>
  );
}
