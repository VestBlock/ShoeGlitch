import Link from 'next/link';
import type { Metadata } from 'next';
import GrowthTracker from '@/components/growth/GrowthTracker';
import OrbitalScene from '@/components/OrbitalScene';
import SneakerFeedClient from '@/components/intelligence/SneakerFeedClient';
import { Badge } from '@/components/ui';
import { getSneakerFeed } from '@/features/intelligence/service';
import { buildFeedSchemas, INTELLIGENCE_FAQS } from '@/features/intelligence/schema';

export const metadata: Metadata = {
  title: 'Sneaker Alerts, Watchlists & Release Tracking | Shoe Glitch',
  description:
    'Track upcoming sneaker releases, save watchlists, and move into premium alerts as Shoe Glitch expands its release-tracking product.',
};

export default async function IntelligencePage() {
  const feed = await getSneakerFeed();
  const schemas = buildFeedSchemas(feed);

  return (
    <>
      <GrowthTracker routePath="/intelligence" pageTitle="Sneaker alerts and watchlists" />

      {schemas.map((schema, index) => (
        <script
          key={`intelligence-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative overflow-hidden bg-[#07111f] text-bone">
        <div className="absolute inset-0 matrix-strip opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(0,229,255,0.16),transparent_22%),radial-gradient(circle_at_84%_14%,rgba(255,77,109,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_42%)] pointer-events-none" />
        <div className="container-x relative py-12 md:py-16">
          <div className="section-shell-dark overflow-hidden p-6 md:p-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.98fr)_minmax(320px,0.72fr)] xl:items-stretch">
              <div>
                <Badge className="mb-5 border-white/14 bg-white/8 text-bone">Release alerts and watchlists</Badge>
                <h1 className="h-display max-w-5xl text-[clamp(3rem,6vw,5.6rem)] leading-[0.90] tracking-tight text-bone">
                  Track the pairs that
                  <br />
                  <em className="h-italic text-cyan">matter next.</em>
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-bone/70">
                  Shoe Glitch Intelligence is about upcoming drops, watchlists, and the alert layer we can monetize over time. Scores still help rank what deserves attention, but the product is following the right release before everyone else does.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/customer/watchlist" className="btn-glitch" data-growth-cta="Start a watchlist">
                    Start a watchlist →
                  </Link>
                  <Link href="/book" className="btn-outline border-white/16 bg-white/6 text-bone hover:bg-white hover:text-ink" data-growth-cta="Book care later">
                    Book care later
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="section-outline-dark p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan/85">
                      At a glance
                    </div>
                    <p className="mt-3 text-sm leading-6 text-bone/68">
                      The feed exists to help customers decide what to watch, what to save, and what deserves an alert. Scoring is support, not the product.
                    </p>
                  </div>
                  <div className="section-outline-dark p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan/85">
                      What it surfaces
                    </div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-bone/68">
                      <li>Upcoming drops worth saving early</li>
                      <li>Pairs with strong restock or release urgency</li>
                      <li>Watchlist candidates for premium alerts later</li>
                    </ul>
                  </div>
                  <div className="section-outline-dark p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan/85">
                      What unlocks next
                    </div>
                    <p className="mt-3 text-sm leading-6 text-bone/68">
                      Free feed first, then better watchlists, faster alerting, and subscriber-ready release coverage as the data layer deepens.
                    </p>
                  </div>
                </div>
              </div>

              <aside className="section-shell-dark p-5 md:p-6">
                <div className="relative z-10">
                  <div className="section-kicker !border-cyan/15 !bg-white/8 !text-cyan">What we sell here</div>
                  <div className="mt-4">
                    <OrbitalScene className="min-h-[240px] border-white/10" accent="#00e5ff" glow="#ff4d6d" />
                  </div>
                  <h2 className="h-display mt-5 text-3xl leading-[0.96] text-bone md:text-4xl">
                    Premium alerts are the product.
                  </h2>

                  <div className="mt-5 grid gap-3">
                    {[
                      ['Free', 'Open release feed, search, and starter watchlists'],
                      ['Pro alerts', 'Unlimited watchlists, instant alerting, weekly digest'],
                      ['Care conversion', 'After the drop, turn the same customer into cleaning, restoration, or mail-in revenue'],
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
                      See care conversion →
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
              Live feed
            </div>
            <h2 className="h-display mt-3 text-[clamp(2.2rem,4vw,3.8rem)] leading-[0.95] text-ink">
              Filter what to follow next.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink/62">
            Less blog, more alert console. Every card should help someone save a pair, follow a drop, or understand why it deserves a watchlist spot.
          </p>
        </div>

        <div className="section-shell mt-8 overflow-hidden p-4 md:p-6">
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
