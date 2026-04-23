import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GrowthTracker from '@/components/growth/GrowthTracker';
import IntelligenceSignals from '@/components/intelligence/IntelligenceSignals';
import { Badge } from '@/components/ui';
import { buildSneakerDetailSchemas, INTELLIGENCE_FAQS } from '@/features/intelligence/schema';
import { getSneakerBySlug } from '@/features/intelligence/service';
import { formatDateOnly } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getSneakerBySlug(slug);

  if (!item) {
    return {
      title: 'Sneaker intelligence not found | Shoe Glitch',
    };
  }

  return {
    title: `${item.name} intelligence | Shoe Glitch`,
    description: `${item.name}: cleanability ${item.scores.cleaning}, restoration upside ${item.scores.restoration}, market strength ${item.scores.marketStrength}, and the next best Shoe Glitch action.`,
  };
}

export default async function SneakerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getSneakerBySlug(slug);

  if (!item) {
    notFound();
  }

  const schemas = buildSneakerDetailSchemas(item);

  return (
    <>
      <GrowthTracker routePath={`/intelligence/${item.slug}`} pageTitle={`${item.name} intelligence`} />

      {schemas.map((schema, index) => (
        <script
          key={`detail-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative overflow-hidden bg-bone">
        <div className="absolute inset-0 matrix-strip opacity-20 pointer-events-none" />
        <div className="container-x relative py-12 md:py-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <article className="rounded-[2rem] border border-ink/10 bg-white/82 p-6 shadow-[0_24px_70px_rgba(10,15,31,0.06)] backdrop-blur-xl md:p-8">
              <Badge className="mb-5">Sneaker intelligence detail</Badge>
              <h1 className="h-display text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.94] text-ink">{item.name}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/68">{item.description}</p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div
                  className="min-h-[320px] rounded-[1.8rem] border border-ink/10 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(8,33,77,0.12), rgba(8,33,77,0.34)), url(${item.media.thumbnailUrl})`,
                  }}
                />
                <div className="space-y-4">
                  <div className="rounded-[1.4rem] border border-ink/10 bg-bone-soft p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                      Release snapshot
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-ink/70">
                      <div><strong>Name:</strong> {item.name}</div>
                      <div><strong>Brand:</strong> {item.brand}</div>
                      <div><strong>Silhouette:</strong> {item.silhouette}</div>
                      <div><strong>Release date:</strong> {formatDateOnly(item.release.date)}</div>
                      <div><strong>Retail:</strong> ${item.release.retailPrice}</div>
                      <div><strong>Resale estimate:</strong> {item.market.estimatedResale ? `$${item.market.estimatedResale}` : 'Awaiting market data'}</div>
                      <div><strong>Availability:</strong> {item.availability}</div>
                      <div><strong>Provider:</strong> {item.provider}</div>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-ink/10 bg-white p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                      Score summary
                    </div>
                    <div className="mt-4">
                      <IntelligenceSignals item={item} includeConfidence />
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-ink/10 bg-white p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                      Size and market view
                    </div>
                    <div className="mt-3 text-sm leading-6 text-ink/70">
                      {item.sizes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {item.sizes.slice(0, 8).map((size) => (
                            <div key={`${size.label}-${size.market ?? 'market'}`} className="rounded-[0.9rem] border border-ink/10 bg-bone-soft px-3 py-2">
                              <div className="font-semibold text-ink">{size.label}</div>
                              <div className="text-xs text-ink/58">
                                {size.lowestAsk ? `Lowest ask $${size.lowestAsk}` : 'Price unavailable'}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No size-level data is available yet for this record.</p>
                      )}
                    </div>
                    {item.marketUrl ? (
                      <div className="mt-4">
                        <Link href={item.marketUrl} className="btn-outline" target="_blank" data-growth-cta="Open market page">
                          Open market page
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <section className="mt-10 prose-sg max-w-none">
                <h2>Why this pair matters</h2>
                <p>{item.rankingNote}</p>
                <ul>
                  <li>Cleanability: {item.scores.cleaning} driven by color visibility, texture, and how quickly the pair will show dirt.</li>
                  <li>Restoration upside: {item.scores.restoration} driven by rarity, premium materials, age, and sole risk.</li>
                  <li>Market strength: {item.scores.marketStrength} driven by price spread, rank, and demand flow.</li>
                  <li>Collector value: {item.scores.rarity} paired with preservation value {item.scores.preservationValue} to show how much this pair deserves long-term care.</li>
                  <li>Confidence: {item.scores.confidence} based on provider quality, live market completeness, and demand signals.</li>
                </ul>
              </section>
            </article>

            <aside className="space-y-5 xl:sticky xl:top-24">
              <div className="rounded-[1.6rem] border border-ink/10 bg-white/82 p-5 shadow-[0_20px_55px_rgba(10,15,31,0.06)] backdrop-blur-xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                  Next action
                </div>
                <h2 className="h-display mt-4 text-3xl text-ink">Move while the pair is fresh.</h2>
                <p className="mt-3 text-sm leading-6 text-ink/66">
                  {item.primaryCta.kind === 'book-restoration'
                    ? 'This one leans restoration-first. Use the feed to capture intent before the pair ages into a harder job.'
                    : item.primaryCta.kind === 'join-waitlist'
                      ? 'This one looks more like a watchlist hold. Save it now, then let the release or restock signal bring you back in at the right moment.'
                      : 'This one looks cleaning-first. Turn release energy into a premium service booking before the pair gets away from the customer.'}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={item.primaryCta.href} className="btn-glitch" data-growth-cta={item.primaryCta.label}>
                    {item.primaryCta.label}
                  </Link>
                  <Link href={item.secondaryCta.href} className="btn-outline" data-growth-cta={item.secondaryCta.label}>
                    {item.secondaryCta.label}
                  </Link>
                  {item.marketUrl ? (
                    <Link href={item.marketUrl} className="btn-outline" target="_blank" data-growth-cta="Open market">
                      Open market
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-ink/10 bg-white/82 p-5 shadow-[0_20px_55px_rgba(10,15,31,0.06)] backdrop-blur-xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                  Frequently asked
                </div>
                <div className="mt-4 space-y-4">
                  {INTELLIGENCE_FAQS.slice(0, 2).map((faq) => (
                    <div key={faq.question} className="rounded-[1.1rem] border border-ink/10 bg-bone-soft p-4">
                      <div className="font-semibold text-ink">{faq.question}</div>
                      <p className="mt-2 text-sm leading-6 text-ink/66">{faq.shortAnswer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
