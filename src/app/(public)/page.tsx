import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { Badge, Card } from '@/components/ui';
import HomeHeroMotion from '@/components/HomeHeroMotion';
import TrustProofStrip from '@/components/TrustProofStrip';
import EditorialSpotlight from '@/components/EditorialSpotlight';
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
      label: 'Live in real cities',
      detail: `${activeCityCount} active routes, with pickup, drop-off, and mail-in options depending on coverage.`,
    },
    {
      label: 'Photo-backed intake',
      detail: 'Upload the pair before checkout so the customer, operator, and admin team all see the same reference.',
    },
    {
      label: 'Tracked all the way through',
      detail: 'The order keeps its notes, status, and service history from intake to final return.',
    },
    {
      label: 'Steam where it matters',
      detail: 'Steam Clean is part of Basic, Pro, and Elite, so every order starts from the same care baseline.',
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
                eyebrow: 'Research first',
                title: 'Use Intelligence before you book',
                detail: 'Check releases, care scores, restoration upside, and watchlist signals before you commit.',
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
                  Sneaker intelligence
                </div>
                <h2 className="h-display mt-3 text-3xl leading-[0.95] text-ink md:text-5xl">
                  See what is worth cleaning, restoring, or watching next.
                </h2>
                <p className="mt-4 text-sm leading-6 text-ink/65 md:text-base">
                  Open the live feed for release signals, care scores, restoration upside, market-watch reads, and watchlist actions powered by ShoeGlitch sneaker data.
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

      <section className="container-x py-20 md:py-24">
        <div className="section-shell p-7 md:p-10">
          <div className="grid grid-cols-1 gap-8 items-center md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <Badge className="mb-4">Live right now</Badge>
            <h2 className="h-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] mb-6">
              Real jobs. <em className="h-italic">Real tracking.</em>
            </h2>
            <p className="text-ink/70 max-w-md mb-6">
              Every order gets a unique code, photo-backed intake notes, and a tracked status pipeline that stays visible across customer, operator, and admin views. Steam Clean is built into Basic, Pro, and Elite.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/book" className="btn-glitch">Start your order →</Link>
              <Link href="/mail-in" className="btn-outline">Nationwide mail-in →</Link>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <Card className="card-glitch grain relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-dark border-white/20 text-white">Order SG-AV1029</span>
                  <Badge tone="glitch" className="bg-white text-glitch">In Cleaning</Badge>
                </div>
                <div className="h-display text-3xl mb-1">Travis Scott 1s</div>
                <div className="text-sm text-white/70">Milwaukee · Pro + Street Shield</div>
                <div className="mt-6">
                  <div className="h-1.5 rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-white w-[55%]" />
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="section-outline p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-glitch/80">Care routes</div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    ['Basic', 'Steam refresh'],
                    ['Pro', 'De-crease + touch-up'],
                    ['Elite', 'Restoration path'],
                  ].map(([title, detail]) => (
                    <div key={title} className="rounded-[1.1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                      <div className="text-sm font-semibold text-ink">{title}</div>
                      <div className="mt-1 text-xs leading-5 text-ink/58">{detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-shell-dark p-5">
                <div className="relative z-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    ['Mail-in open', 'Nationwide', 'Prepaid inbound label + optional box kit'],
                    ['Pickup cities', `${activeCityCount} active`, 'Cities stay focused on local handoff only'],
                    ['Intelligence loop', 'Feed → watch → book', 'Research and booking stay connected'],
                  ].map(([eyebrow, value, detail]) => (
                    <div key={eyebrow} className="section-outline-dark p-4">
                      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan/80">{eyebrow}</div>
                      <div className="mt-2 h-display text-3xl text-bone">{value}</div>
                      <div className="mt-2 text-sm leading-6 text-bone/62">{detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <EditorialSpotlight />

      <section className="container-x py-16 md:py-20">
        <div className="flex flex-col gap-6 mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-4">01 — The menu</Badge>
            <h2 className="h-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] max-w-2xl">
              Named. <em className="h-italic">Priced.</em> No guesswork.
            </h2>
          </div>
          <Link href="/services" className="btn-outline shrink-0">See everything →</Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Link key={service.id} href={`/book?service=${service.slug}`} className="card card-lift p-6 flex min-h-[280px] flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="font-mono text-xs text-ink/40">0{index + 1}</span>
                  <Badge tone={service.category === 'luxury' ? 'glitch' : 'default'}>{service.category}</Badge>
                </div>
                <h3 className="h-display text-3xl mb-2 group-hover:text-glitch transition">{service.name}</h3>
                <p className="text-sm text-ink/60">{service.tagline}</p>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-ink/40">from</div>
                  <div className="h-display text-3xl">${service.priceMin ?? service.basePrice}</div>
                </div>
                <span className="text-ink/40 text-2xl transition-all group-hover:text-glitch group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 section-outline flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/80">Cleaner decision-making</div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
              Use one tier, then stack only the extras the pair actually needs. That keeps the booking path simple and stops the page from reading like a giant repair menu.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/services" className="btn-outline">
              Compare all tiers →
            </Link>
            <Link href="/mail-in" className="btn-outline">
              Mail-in nationwide →
            </Link>
          </div>
        </div>
      </section>

      <ResultsProofGrid />

      <section className="bg-ink text-bone py-24 relative overflow-hidden">
        <div className="absolute inset-0 matrix-strip opacity-20" />
        <div className="container-x relative">
          <div className="mb-12">
            <Badge tone="dark" className="border-cyan/30 text-cyan mb-4">02 — Where we live</Badge>
            <h2 className="h-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] max-w-2xl">
              Built in Milwaukee. <em className="h-italic text-cyan">Built for everywhere.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {cities.map((city, index) => (
              <div key={city.id} className={`rounded-card border p-6 hover:border-cyan transition ${index === 0 ? 'border-cyan bg-glitch/10' : 'border-bone/15'}`}>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-bone/40">{city.state}</span>
                  {city.active ? (
                    index === 0 ? <span className="badge-glitch bg-cyan text-ink">HQ · LIVE</span> : <span className="badge-glitch">Live</span>
                  ) : (
                    <span className="badge-dark border-bone/20 text-bone/60">Soon</span>
                  )}
                </div>
                <div className="h-display text-4xl mb-6">{city.name}</div>
                <div className="space-y-1.5 text-xs text-bone/60">
                  <div className="flex justify-between"><span>Pickup fee</span><span className="font-mono text-bone">${city.defaultPickupFee}</span></div>
                  <div className="flex justify-between"><span>Rush fee</span><span className="font-mono text-bone">${city.defaultRushFee}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-16">
        <Card className="p-8 md:p-12 border-2 border-glitch/30 bg-gradient-to-br from-glitch/8 via-white to-cyan/10 shadow-[0_26px_80px_rgba(10,15,31,0.12)]">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <Badge tone="glitch" className="mb-4">For operators</Badge>
              <h3 className="h-display text-4xl md:text-5xl mb-3">
                Become a Shoe Glitch operator.
              </h3>
              <p className="text-ink/70 max-w-lg">
                Certified training. Branded equipment kit. Basic and Pro operators market themselves locally, while Luxury operators can qualify for digital ad spend, exclusive territory, and the steam cleaner brush setup used on deeper packages.
              </p>
            </div>
            <Link href="/operator" className="btn-glitch shrink-0">Apply now →</Link>
          </div>
        </Card>
      </section>
    </>
  );
}
