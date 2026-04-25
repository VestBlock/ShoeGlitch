import Link from 'next/link';
import GrowthTracker from '@/components/growth/GrowthTracker';
import { Badge, Card } from '@/components/ui';
import IntelligenceSignals from '@/components/intelligence/IntelligenceSignals';
import { buildReleaseSchemas } from '@/features/releases/schema';
import type { ReleasePageModel } from '@/features/releases/types';
import { formatDateOnly } from '@/lib/utils';

function scoreTone(value: number) {
  if (value >= 75) return 'text-neon';
  if (value >= 60) return 'text-cyan';
  return 'text-ink';
}

export default function ReleaseLandingPage({ model }: { model: ReleasePageModel }) {
  const schemas = buildReleaseSchemas(model);
  const marketValue = model.item.priceSummary.lowestAsk ?? model.item.priceSummary.averagePrice;
  const retailValue =
    (model.item.release.retailPrice ?? 0) > 0
      ? model.item.release.retailPrice
      : (model.item.priceSummary.retailPrice ?? 0) > 0
        ? model.item.priceSummary.retailPrice
        : null;

  return (
    <>
      <GrowthTracker routePath={model.path} pageTitle={model.title} />

      {schemas.map((schema, index) => (
        <script
          key={`release-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative overflow-hidden bg-bone">
        <div className="absolute inset-0 matrix-strip opacity-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_58%)] pointer-events-none" />
        <div className="container-x relative py-12 md:py-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] xl:items-start">
            <article className="rounded-[2rem] border border-ink/10 bg-white/84 p-6 shadow-[0_24px_80px_rgba(10,15,31,0.07)] backdrop-blur-xl md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{model.eyebrow}</Badge>
                <Badge tone="dark">{model.item.availability}</Badge>
                <Badge tone="glitch">{model.item.brand}</Badge>
              </div>

              <h1 className="h-display mt-5 text-[clamp(3rem,6vw,5.4rem)] leading-[0.92] tracking-tight text-ink">
                {model.h1}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/68">{model.intro}</p>

              <div className="mt-7 rounded-[1.5rem] border border-glitch/16 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(235,244,255,0.82))] p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">At a glance</div>
                <p className="mt-3 text-base leading-7 text-ink/72">{model.aiSummary}</p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.35rem] border border-ink/10 bg-bone-soft p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                    Release summary
                  </div>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/72">
                    {model.summaryBullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-cyan" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.35rem] border border-ink/10 bg-white p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                    Should you buy this?
                  </div>
                  <h2 className="h-display mt-3 text-[clamp(1.8rem,4vw,2.7rem)] leading-[0.96] text-ink">
                    {model.recommendation.headline}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-ink/68">{model.recommendation.body}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={model.item.primaryCta.href} className="btn-glitch" data-growth-cta={model.item.primaryCta.label}>
                  {model.item.primaryCta.label}
                </Link>
                <Link href={model.item.secondaryCta.href} className="btn-outline" data-growth-cta={model.item.secondaryCta.label}>
                  {model.item.secondaryCta.label}
                </Link>
                <Link href="/book" className="btn-outline" data-growth-cta="Book a service">
                  Book a service
                </Link>
              </div>
            </article>

            <aside className="space-y-5 xl:sticky xl:top-24">
              <div className="rounded-[2rem] border border-ink/10 bg-[linear-gradient(180deg,rgba(8,33,77,0.96),rgba(7,34,89,0.78))] p-4 shadow-[0_28px_90px_rgba(10,15,31,0.16)]">
                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/14 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_48%)] p-4">
                  <div
                    className="min-h-[340px] rounded-[1.2rem] bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${model.item.media.thumbnailUrl})` }}
                  />
                  <div className="pointer-events-none absolute inset-x-5 top-5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.28em] text-white/78">
                    <span>{model.item.brand}</span>
                    <span>{model.item.sku}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1rem] border border-white/14 bg-white/8 px-4 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/58">MSRP</div>
                      <div className="mt-2 text-xl font-semibold text-white">
                        {retailValue ? `$${retailValue}` : 'TBD'}
                      </div>
                    </div>
                    <div className="rounded-[1rem] border border-white/14 bg-white/8 px-4 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/58">Market</div>
                      <div className="mt-2 text-xl font-semibold text-white">{marketValue ? `$${marketValue}` : 'Thin data'}</div>
                    </div>
                    <div className="rounded-[1rem] border border-white/14 bg-white/8 px-4 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/58">Release</div>
                      <div className="mt-2 text-xl font-semibold text-white">{formatDateOnly(model.item.release.date)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                  What stands out
                </div>
                <div className="mt-4">
                  <IntelligenceSignals item={model.item} includeConfidence />
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_360px]">
          <article className="space-y-6">
            <Card className="p-6 md:p-8">
              <div className="prose-sg max-w-none">
                <section>
                  <h2>Release summary</h2>
                  <p>
                    {model.item.name} is currently tracked as a {model.item.availability} {model.item.brand} release. This page keeps the basics easy to scan, then adds market context and aftercare context so you can decide whether the pair is worth buying, saving, or protecting.
                  </p>
                  <p>{model.recommendation.body}</p>
                </section>

                <section>
                  <h2>Key product facts</h2>
                  <dl className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-ink/10 bg-bone-soft p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">SKU</dt>
                      <dd className="mt-2 text-lg font-semibold text-ink">{model.item.sku}</dd>
                    </div>
                    <div className="rounded-[1.1rem] border border-ink/10 bg-bone-soft p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Colorway</dt>
                      <dd className="mt-2 text-lg font-semibold text-ink">{model.item.colorway || 'Colorway pending'}</dd>
                    </div>
                    <div className="rounded-[1.1rem] border border-ink/10 bg-bone-soft p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Silhouette</dt>
                      <dd className="mt-2 text-lg font-semibold text-ink">{model.item.silhouette}</dd>
                    </div>
                    <div className="rounded-[1.1rem] border border-ink/10 bg-bone-soft p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Availability</dt>
                      <dd className="mt-2 text-lg font-semibold capitalize text-ink">{model.item.availability}</dd>
                    </div>
                  </dl>
                </section>

                <section>
                  <h2>Where to buy and availability</h2>
                  <p>
                    If the live market page exists, it belongs here. If pricing is still thin, the better move is saving the pair to your watchlist and waiting for a stronger update.
                  </p>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {model.buyingLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        data-growth-cta={link.label}
                        className="rounded-[1.15rem] border border-ink/10 bg-white p-4 transition hover:border-glitch/20 hover:shadow-[0_16px_45px_rgba(10,15,31,0.08)]"
                      >
                        <div className="font-semibold text-ink">{link.label}</div>
                        <p className="mt-2 text-sm leading-6 text-ink/64">{link.description}</p>
                      </Link>
                    ))}
                  </div>
                </section>

                <section>
                  <h2>Price history and market summary</h2>
                  <p>
                    When pricing is available, this page leans on retail, lowest ask, average market, and size-level depth so you can make a cleaner decision than hype alone would give you.
                  </p>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[1.15rem] border border-ink/10 bg-bone-soft p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">MSRP</div>
                      <div className="mt-2 text-2xl font-semibold text-ink">
                        {retailValue ? `$${retailValue}` : 'TBD'}
                      </div>
                    </div>
                    <div className="rounded-[1.15rem] border border-ink/10 bg-bone-soft p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Lowest ask</div>
                      <div className="mt-2 text-2xl font-semibold text-ink">
                        {model.item.priceSummary.lowestAsk ? `$${model.item.priceSummary.lowestAsk}` : 'Unavailable'}
                      </div>
                    </div>
                    <div className="rounded-[1.15rem] border border-ink/10 bg-bone-soft p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Average market</div>
                      <div className="mt-2 text-2xl font-semibold text-ink">
                        {model.item.priceSummary.averagePrice ? `$${model.item.priceSummary.averagePrice}` : 'Unavailable'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 rounded-[1.15rem] border border-ink/10 bg-white p-5">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Market read</div>
                        <p className="mt-3 text-sm leading-6 text-ink/68">
                          Market heat is <span className={scoreTone(model.item.scores.marketStrength)}>{model.item.scores.marketStrength}</span>
                          , liquidity is <span className={scoreTone(model.item.scores.liquidity)}>{model.item.scores.liquidity}</span>, and the
                          watchlist fit lands at <span className={scoreTone(model.item.scores.marketWatchFit)}>{model.item.scores.marketWatchFit}</span>.
                        </p>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Size depth</div>
                        <p className="mt-3 text-sm leading-6 text-ink/68">
                          {model.item.sizes.length > 0
                            ? `${model.item.sizes.length} size or variant records are currently visible for this release, which helps keep this page grounded in real product detail.`
                            : 'Size-level data is still thin for this release, so the page is leaning more on the main release record and watchlist view.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2>How this pair looks right now</h2>
                  <p>
                    These numbers are meant to support the save-or-skip decision first. They also give a quick read on what the pair may need later once it is actually in hand.
                  </p>
                  <ul>
                    <li>Easy care later: {model.item.scores.cleaning} based on visible wear risk, lighter tones, and texture-driven care needs.</li>
                    <li>Restore later: {model.item.scores.restoration} based on rarity, age profile, premium materials, and sole risk.</li>
                    <li>Material sensitivity: {model.item.scores.materialSensitivity} based on suede, nubuck, mesh, canvas, patent, and tone.</li>
                    <li>Collector appeal: {model.item.scores.preservationValue} based on long-term keep value and protection upside.</li>
                  </ul>
                </section>

                <section>
                  <h2>{model.recommendation.headline}</h2>
                  <p>{model.recommendation.body}</p>
                  <ul>
                    {model.recommendation.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2>Latest note</h2>
                  <p>
                    The release facts here come from structured provider data, while the extra notes below are hand-reviewed so the page stays useful instead of turning into filler.
                  </p>
                  <div className="mt-5 rounded-[1.2rem] border border-ink/10 bg-bone-soft p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                      Page note
                    </div>
                    <p className="mt-3 text-sm leading-6 text-ink/68">{model.editorial.reviewNote}</p>
                    {model.editorial.lastReviewedAt ? (
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/48">
                        Last reviewed {formatDateOnly(model.editorial.lastReviewedAt)}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {[
                      model.editorial.historyOfSilhouette,
                      model.editorial.culturalContext,
                      model.editorial.designerNotes,
                      model.editorial.releaseSignificance,
                    ]
                      .filter(Boolean)
                      .map((block) => (
                        <div key={block?.title} className="rounded-[1.15rem] border border-ink/10 bg-white p-5">
                          <h3>{block?.title}</h3>
                          {block?.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                        </div>
                      ))}
                  </div>
                </section>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <div className="max-w-3xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                  Frequently asked
                </div>
                <h2 className="h-display mt-4 text-[clamp(2.1rem,4vw,3.2rem)] leading-[0.95] text-ink">
                  Straight answers about this release.
                </h2>
              </div>
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {model.faqs.map((faq) => (
                  <div key={faq.question} className="rounded-[1.35rem] border border-ink/10 bg-bone-soft p-5">
                    <h3 className="text-lg font-semibold text-ink">{faq.question}</h3>
                    <p className="mt-3 text-sm font-medium text-glitch/85">{faq.shortAnswer}</p>
                    <p className="mt-3 text-sm leading-6 text-ink/68">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Card>
          </article>

          <aside className="space-y-5 xl:sticky xl:top-24">
            <Card className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                Next move
              </div>
              <h2 className="h-display mt-4 text-[clamp(2rem,4vw,2.9rem)] leading-[0.96] text-ink">
                Save it, shop it, or come back later.
              </h2>
              <p className="mt-4 text-sm leading-6 text-ink/68">
                Use this page to decide whether the pair deserves your watchlist, your money, or your attention later after it lands.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={model.item.primaryCta.href} className="btn-glitch" data-growth-cta={model.item.primaryCta.label}>
                  {model.item.primaryCta.label}
                </Link>
                <Link href={model.item.secondaryCta.href} className="btn-outline" data-growth-cta={model.item.secondaryCta.label}>
                  {model.item.secondaryCta.label}
                </Link>
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                More to explore
              </div>
              <div className="mt-4 space-y-3">
                {model.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-3 transition hover:border-glitch/25 hover:bg-white"
                  >
                    <div className="font-semibold text-ink">{link.label}</div>
                    <div className="mt-1 text-sm text-ink/60">{link.description}</div>
                  </Link>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}
