import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GrowthTracker from '@/components/growth/GrowthTracker';
import IntelligenceSignals from '@/components/intelligence/IntelligenceSignals';
import WatchlistQuickAddButton from '@/components/intelligence/WatchlistQuickAddButton';
import OrbitalScene from '@/components/OrbitalScene';
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
    title: `${item.name} release intelligence | Shoe Glitch`,
    description: `${item.name}: save it to your watchlist, follow the release, and stay ready for alerts, pricing movement, and restocks inside Shoe Glitch Intelligence.`,
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
      <GrowthTracker routePath={`/intelligence/${item.slug}`} pageTitle={`${item.name} release intelligence`} />

      {schemas.map((schema, index) => (
        <script
          key={`detail-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative overflow-hidden bg-[#07111f] text-bone">
        <div className="absolute inset-0 matrix-strip opacity-24 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(0,229,255,0.14),transparent_22%),radial-gradient(circle_at_84%_12%,rgba(255,77,109,0.12),transparent_24%)] pointer-events-none" />
        <div className="container-x relative py-12 md:py-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <article className="section-shell-dark overflow-hidden p-6 md:p-8">
              <Badge className="mb-5 border-white/14 bg-white/8 text-bone">Release detail</Badge>
              <h1 className="h-display text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.94] text-bone">{item.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-bone/66">{item.description}</p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div
                  className="min-h-[320px] rounded-[1.8rem] border border-ink/10 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(8,33,77,0.12), rgba(8,33,77,0.34)), url(${item.media.thumbnailUrl})`,
                  }}
                />
                <div className="space-y-4">
                  <div className="section-outline-dark p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan/85">
                      Release snapshot
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-bone/68">
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

                  <div className="section-outline-dark p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan/85">
                      Why it stands out
                    </div>
                    <div className="mt-4">
                      <IntelligenceSignals item={item} includeConfidence />
                    </div>
                  </div>

                  <div className="section-outline-dark p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan/85">
                      Size and market view
                    </div>
                    <div className="mt-3 text-sm leading-6 text-bone/68">
                      {item.sizes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {item.sizes.slice(0, 8).map((size) => (
                            <div key={`${size.label}-${size.market ?? 'market'}`} className="rounded-[0.9rem] border border-white/10 bg-white/6 px-3 py-2">
                              <div className="font-semibold text-bone">{size.label}</div>
                              <div className="text-xs text-bone/58">
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

              <section className="mt-10 prose-sg max-w-none !text-bone/76">
                <h2>Why this pair matters</h2>
                <p>{item.rankingNote}</p>
                <ul>
                  <li>Why save it now: {item.scores.reasons.releasePressure[0] ?? 'This pair is worth keeping close for the next release update.'}</li>
                  <li>What demand looks like: {item.scores.reasons.marketStrength[0] ?? 'Current market activity still makes this worth tracking.'}</li>
                  <li>Why collectors may care: {item.scores.reasons.rarity[0] ?? 'There is still enough long-term interest to justify a watchlist save.'}</li>
                  <li>What happens after you buy it: {item.scores.reasons.cleaning[0] ?? item.scores.reasons.restoration[0] ?? 'Aftercare matters more once the pair is in hand.'}</li>
                  <li>How reliable this read is: {item.scores.reasons.confidence[0] ?? 'The current read depends on the latest available release and market data.'}</li>
                </ul>
              </section>
            </article>

            <aside className="space-y-5 xl:sticky xl:top-24">
              <div className="section-shell-dark p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan/85">
                  Next action
                </div>
                <div className="mt-4">
                  <OrbitalScene className="min-h-[220px] border-white/10" />
                </div>
                <h2 className="h-display mt-5 text-3xl text-bone">Save it while it is still early.</h2>
                <p className="mt-3 text-sm leading-6 text-bone/66">
                  {item.primaryCta.kind === 'book-restoration'
                    ? 'Catch the release first, save the pair, and come back for care after it actually lands.'
                    : item.primaryCta.kind === 'join-waitlist'
                      ? 'This one is watchlist-first. Save it now, then let the next release or restock update bring you back in at the right moment.'
                      : 'This one is still release-led. Save it now, follow the drop, and decide on care after the pair is in hand.'}
                </p>
                <div className="mt-5">
                  <WatchlistQuickAddButton item={item} />
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={item.primaryCta.href} className="btn-glitch" data-growth-cta={item.primaryCta.label}>
                    {item.primaryCta.label}
                  </Link>
                  <Link href={item.secondaryCta.href} className="btn-outline border-white/16 bg-white/6 text-bone hover:bg-white hover:text-ink" data-growth-cta={item.secondaryCta.label}>
                    {item.secondaryCta.label}
                  </Link>
                  {item.marketUrl ? (
                    <Link href={item.marketUrl} className="btn-outline border-white/16 bg-white/6 text-bone hover:bg-white hover:text-ink" target="_blank" data-growth-cta="Open market">
                      Open market
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="section-shell p-5">
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
