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
    'Track upcoming sneaker releases, save pairs to your watchlist, and stay ready for faster alerts and restock updates with Shoe Glitch Intelligence.',
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
                  Save the pairs that
                  <br />
                  <em className="h-italic text-cyan">matter before they move.</em>
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-bone/70">
                  Build a watchlist, follow the drop, and stay ready for restocks without digging through noise. This feed is here to help you decide what to save now and what can wait.
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
                      Best for
                    </div>
                    <p className="mt-3 text-sm leading-6 text-bone/68">
                      Save pairs early, skip the forgettable ones, and keep the right releases close without turning the feed into homework.
                    </p>
                  </div>
                  <div className="section-outline-dark p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan/85">
                      What you can do
                    </div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-bone/68">
                      <li>Save a pair to your watchlist in one click</li>
                      <li>Follow the release date and current price picture</li>
                      <li>Come back when alerting matters more</li>
                    </ul>
                  </div>
                  <div className="section-outline-dark p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan/85">
                      Why it matters
                    </div>
                    <p className="mt-3 text-sm leading-6 text-bone/68">
                      Watchlists are the free habit. Faster alerts and deeper tracking are the upgrade path once you actually want more speed.
                    </p>
                  </div>
                </div>
              </div>

              <aside className="section-shell-dark p-5 md:p-6">
                <div className="relative z-10">
                  <div className="section-kicker !border-cyan/15 !bg-white/8 !text-cyan">How to use it</div>
                  <div className="mt-4">
                    <OrbitalScene className="min-h-[240px] border-white/10" accent="#00e5ff" glow="#ff4d6d" />
                  </div>
                  <h2 className="h-display mt-5 text-3xl leading-[0.96] text-bone md:text-4xl">
                    Save first. Let alerts do the chasing later.
                  </h2>

                  <div className="mt-5 grid gap-3">
                    {[
                      ['Save the pair', 'Add it to your watchlist the moment it stands out.'],
                      ['Track the drop', 'Follow release timing, pricing, and restock movement.'],
                      ['Upgrade later', 'Pay for faster alerts only when speed starts to matter.'],
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
                      Book care later →
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
              Filter what deserves a save.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink/62">
            Every card should help you make one simple decision: skip it, save it, or stay close for the next update.
          </p>
        </div>

        <div className="section-shell mt-8 overflow-hidden p-4 md:p-6">
          <SneakerFeedClient feed={feed} />
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
          <div className="section-shell p-6 md:p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
              Plans
            </div>
            <h2 className="h-display mt-4 text-[clamp(2.2rem,4vw,3.8rem)] leading-[0.94] text-ink">
              Start with watchlists. Upgrade when alerts earn it.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/64">
              Intelligence works best when the free layer builds the habit and the paid layer saves real time. The upgrade should be about speed and convenience, not gating the whole product.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/customer/watchlist" className="btn-glitch">
                Start free with watchlists →
              </Link>
              <Link href="/intelligence" className="btn-outline">
                Keep browsing the feed →
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="section-outline p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                Free watchlists
              </div>
              <h3 className="h-display mt-3 text-3xl leading-[0.96] text-ink">Save pairs and follow the drop</h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-ink/64">
                <p>Browse the feed without the noise.</p>
                <p>Save the pairs you want to follow.</p>
                <p>Come back when the release picture sharpens.</p>
              </div>
            </div>

            <div className="section-outline-dark p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan/85">
                Intelligence Pro
              </div>
              <h3 className="h-display mt-3 text-3xl leading-[0.96] text-bone">Faster alerts when timing matters</h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-bone/68">
                <p>Release and restock alerts that hit faster.</p>
                <p>Deeper watchlists for heavier collectors.</p>
                <p>A paid layer built around speed, not filler.</p>
              </div>
            </div>
          </div>
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
