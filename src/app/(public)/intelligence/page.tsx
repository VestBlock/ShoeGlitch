import Link from 'next/link';
import type { Metadata } from 'next';
import GrowthTracker from '@/components/growth/GrowthTracker';
import OrbitalScene from '@/components/OrbitalScene';
import SneakerFeedClient from '@/components/intelligence/SneakerFeedClient';
import { Badge } from '@/components/ui';
import { getSneakerFeed } from '@/features/intelligence/service';
import { buildFeedSchemas, INTELLIGENCE_FAQS } from '@/features/intelligence/schema';

export const metadata: Metadata = {
  title: 'Sneaker Intelligence Feed | Shoe Glitch',
  description:
    'Track sneaker releases with cleaning, restoration, market, and collector signals, then move into watchlists or Shoe Glitch service actions from one feed.',
};

export default async function IntelligencePage() {
  const feed = await getSneakerFeed();
  const schemas = buildFeedSchemas(feed);

  return (
    <>
      <GrowthTracker routePath="/intelligence" pageTitle="Sneaker Intelligence Feed" />

      {schemas.map((schema, index) => (
        <script
          key={`intelligence-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative overflow-hidden bg-bone">
        <div className="absolute inset-0 matrix-strip opacity-25 pointer-events-none" />
        <div className="container-x relative py-12 md:py-16">
          <div className="section-shell p-6 md:p-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.98fr)_minmax(320px,0.72fr)] xl:items-stretch">
              <div>
                <Badge className="mb-5">Sneaker intelligence feed</Badge>
                <h1 className="h-display max-w-5xl text-[clamp(3rem,6vw,5.6rem)] leading-[0.90] tracking-tight text-ink">
                  Releases with a <em className="h-italic text-glitch">service angle.</em>
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/68">
                  This is Shoe Glitch&rsquo;s first intelligence layer: upcoming pairs, layered care and market scoring, watchlist hooks, and direct booking paths when the release story turns into a service moment.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/book" className="btn-glitch" data-growth-cta="Book a pair">
                    Book a pair →
                  </Link>
                  <Link href="/services" className="btn-outline" data-growth-cta="Compare services">
                    Compare services
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="section-outline p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                      Quick answer
                    </div>
                    <p className="mt-3 text-sm leading-6 text-ink/70">
                      Sneaker Intelligence Feed ranks releases by cleanability, restoration upside, market strength, collector value, and release pressure so Shoe Glitch can turn interest into bookings and watchlist retention.
                    </p>
                  </div>
                  <div className="section-outline p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                      What it surfaces
                    </div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/70">
                      <li>Upcoming drops with service hooks</li>
                      <li>Pairs with high cleaning or restoration demand</li>
                      <li>Collector and market-watch candidates</li>
                    </ul>
                  </div>
                  <div className="section-outline p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                      What comes next
                    </div>
                    <p className="mt-3 text-sm leading-6 text-ink/70">
                      Live release data drives the feed now, and the market layer will keep getting sharper as deeper pricing coverage comes online.
                    </p>
                  </div>
                </div>
              </div>

              <aside className="section-shell-dark p-5 md:p-6">
                <div className="relative z-10">
                  <div className="section-kicker !border-cyan/15 !bg-white/8 !text-cyan">Monetization lane</div>
                  <div className="mt-4">
                    <OrbitalScene className="min-h-[240px] border-white/10" accent="#00e5ff" glow="#ff4d6d" />
                  </div>
                  <h2 className="h-display mt-5 text-3xl leading-[0.96] text-bone md:text-4xl">
                    Premium alerts are the product.
                  </h2>

                  <div className="mt-5 grid gap-3">
                    {[
                      ['Free', 'Open feed + search + service hooks'],
                      ['Pro alerts', 'Unlimited watchlists, instant alerting, weekly digest'],
                      ['Mail-in care', 'Pair credits, prepaid labels, optional box kit convenience'],
                    ].map(([title, detail]) => (
                      <div key={title} className="section-outline-dark p-4">
                        <div className="text-sm font-semibold text-bone">{title}</div>
                        <div className="mt-2 text-sm leading-6 text-bone/64">{detail}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/customer/watchlist" className="btn-glitch">
                      Start with watchlists →
                    </Link>
                    <Link href="/mail-in" className="btn-outline border-white/16 bg-white/6 text-bone hover:bg-white hover:text-ink">
                      See mail-in care →
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
              Feed view
            </div>
            <h2 className="h-display mt-3 text-[clamp(2.2rem,4vw,3.8rem)] leading-[0.95] text-ink">
              Filter the next best move.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink/62">
            Less blog, more decision engine. Every card should either push a booking, a watchlist save, or a stronger release read.
          </p>
        </div>

        <div className="section-shell mt-8 p-4 md:p-6">
          <SneakerFeedClient feed={feed} />
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="section-shell p-6 md:p-8">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
              Frequently asked questions
            </div>
            <h2 className="h-display mt-4 text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] text-ink">
              Straight answers for real release decisions.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {INTELLIGENCE_FAQS.map((faq) => (
              <div key={faq.question} className="section-outline p-5">
                <h3 className="text-lg font-semibold text-ink">{faq.question}</h3>
                <p className="mt-3 text-sm font-medium text-glitch/80">{faq.shortAnswer}</p>
                <p className="mt-3 text-sm leading-6 text-ink/66">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
