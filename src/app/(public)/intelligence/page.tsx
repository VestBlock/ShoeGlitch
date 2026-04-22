import Link from 'next/link';
import type { Metadata } from 'next';
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
          <div className="rounded-[2rem] border border-ink/10 bg-white/82 p-6 shadow-[0_28px_80px_rgba(10,15,31,0.08)] backdrop-blur-xl md:p-8">
            <Badge className="mb-5">Sneaker intelligence feed</Badge>
            <h1 className="h-display max-w-5xl text-[clamp(3rem,6vw,5.5rem)] leading-[0.92] tracking-tight text-ink">
              Releases with a <em className="h-italic text-glitch">service angle.</em>
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/68">
              This is Shoe Glitch&rsquo;s first intelligence layer: upcoming pairs, layered care and market scoring, watchlist hooks, and direct booking paths when the release story turns into a service moment.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/book" className="btn-glitch">
                Book a pair →
              </Link>
              <Link href="/services" className="btn-outline">
                Compare services
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.35rem] border border-ink/10 bg-bone-soft p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                  Quick answer
                </div>
                <p className="mt-3 text-sm leading-6 text-ink/70">
                  Sneaker Intelligence Feed ranks releases by cleanability, restoration upside, market strength, collector value, and release pressure so Shoe Glitch can turn interest into bookings and watchlist retention.
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-ink/10 bg-white p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                  What it surfaces
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/70">
                  <li>Upcoming drops with service hooks</li>
                  <li>Pairs with high cleaning or restoration demand</li>
                  <li>Collector and market-watch candidates</li>
                </ul>
              </div>
              <div className="rounded-[1.35rem] border border-ink/10 bg-white p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                  What comes next
                </div>
                <p className="mt-3 text-sm leading-6 text-ink/70">
                  This MVP keeps market placeholders isolated so real API, scraper, and affiliate layers can plug in later without rewriting the UI.
                </p>
              </div>
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
            Start with release timing, then sort by care demand, market strength, collector value, or service fit. Every result should either inform a service offer or create a smarter watchlist.
          </p>
        </div>

        <div className="mt-8">
          <SneakerFeedClient feed={feed} />
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="rounded-[2rem] border border-ink/10 bg-white/82 p-6 shadow-[0_24px_70px_rgba(10,15,31,0.06)] backdrop-blur-xl md:p-8">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
              Frequently asked questions
            </div>
            <h2 className="h-display mt-4 text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] text-ink">
              Built for search, AI, and actual decisions.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {INTELLIGENCE_FAQS.map((faq) => (
              <div key={faq.question} className="rounded-[1.35rem] border border-ink/10 bg-bone-soft p-5">
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
