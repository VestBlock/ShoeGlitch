import Link from 'next/link';
import GrowthTracker from '@/components/growth/GrowthTracker';
import { Badge, Card } from '@/components/ui';
import IntelligenceSignals from '@/components/intelligence/IntelligenceSignals';
import { buildReleaseSchemas } from '@/features/releases/schema';
import type { ReleasePageModel } from '@/features/releases/types';
import { formatDateOnly } from '@/lib/utils';

export default function HowToCleanLandingPage({ model }: { model: ReleasePageModel }) {
  const schemas = buildReleaseSchemas(model);

  return (
    <>
      <GrowthTracker routePath={model.path} pageTitle={model.title} />

      {schemas.map((schema, index) => (
        <script
          key={`how-to-clean-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative overflow-hidden bg-bone">
        <div className="absolute inset-0 matrix-strip opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(17,180,108,0.14),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(23,110,255,0.12),transparent_45%)] pointer-events-none" />
        <div className="container-x relative py-12 md:py-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] xl:items-start">
            <article className="rounded-[2rem] border border-ink/10 bg-white/86 p-6 shadow-[0_24px_80px_rgba(10,15,31,0.07)] backdrop-blur-xl md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="glitch">{model.eyebrow}</Badge>
                <Badge tone="dark">Care-first</Badge>
                <Badge>{model.item.brand}</Badge>
              </div>

              <h1 className="h-display mt-5 text-[clamp(3rem,6vw,5rem)] leading-[0.92] tracking-tight text-ink">
                {model.h1}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/68">{model.intro}</p>

              <div className="mt-7 grid gap-4 md:grid-cols-[minmax(0,1.1fr)_300px]">
                <div className="rounded-[1.5rem] border border-ink/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(239,255,247,0.84))] p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Quick cleaning read</div>
                  <p className="mt-3 text-base leading-7 text-ink/72">{model.aiSummary}</p>
                </div>
                <div className="rounded-[1.5rem] border border-ink/10 bg-bone-soft p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Cleaning summary</div>
                  <div className="mt-4 grid gap-3">
                    {model.summaryBullets.map((bullet) => (
                      <div key={bullet} className="rounded-[1rem] border border-ink/10 bg-white px-4 py-3 text-sm leading-6 text-ink/72">
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/book?intent=cleaning&pair=${model.item.slug}`} className="btn-glitch" data-growth-cta="Book cleaning">
                  Book cleaning
                </Link>
                <Link href={`/releases/${model.item.slug}`} className="btn-outline" data-growth-cta="Open release brief">
                  Open release brief
                </Link>
                <Link href={`/customer/watchlist?sku=${encodeURIComponent(model.item.sku)}&brand=${encodeURIComponent(model.item.brand)}&model=${encodeURIComponent(model.item.silhouette)}&colorway=${encodeURIComponent(model.item.colorway)}`} className="btn-outline" data-growth-cta="Track this pair">
                  Track this pair
                </Link>
              </div>
            </article>

            <aside className="space-y-5 xl:sticky xl:top-24">
              <div className="rounded-[2rem] border border-ink/10 bg-[linear-gradient(180deg,rgba(6,33,77,0.96),rgba(9,52,92,0.8))] p-4 shadow-[0_28px_90px_rgba(10,15,31,0.16)]">
                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/14 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_48%)] p-4">
                  <div
                    className="min-h-[320px] rounded-[1.2rem] bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${model.item.media.thumbnailUrl})` }}
                  />
                  <div className="pointer-events-none absolute inset-x-5 top-5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.28em] text-white/78">
                    <span>{model.item.brand}</span>
                    <span>{formatDateOnly(model.item.release.date)}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      ['Cleaning', model.item.scores.cleaning],
                      ['Wear', model.item.scores.wearVisibility],
                      ['Material', model.item.scores.materialSensitivity],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[1rem] border border-white/14 bg-white/8 px-3 py-3 text-center">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/58">{label}</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Card className="p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Why it needs cleaning</div>
                <div className="mt-4">
                  <IntelligenceSignals item={model.item} includeConfidence />
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_360px]">
          <article className="space-y-6">
            <Card className="p-6 md:p-8">
              <div className="prose-sg max-w-none">
                <section>
                  <h2>Why this shoe needs a real cleaning plan</h2>
                  <p>{model.recommendation.body}</p>
                  <p>
                    On Shoe Glitch, the deeper cleaning routes move into steam-assisted treatment above the entry tier. That matters because many pairs need more than a surface reset once dirt settles into the upper, lining, or stitch lines.
                  </p>
                  <ul>
                    {model.recommendation.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2>What to watch on this pair</h2>
                  <p>
                    The point of this page is not to publish generic cleaning fluff. It is to translate the structured release record into the parts of the shoe that will show dirt, lose sharpness, or need material-aware handling sooner than expected.
                  </p>
                  <dl className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-ink/10 bg-bone-soft p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Release date</dt>
                      <dd className="mt-2 text-lg font-semibold text-ink">{formatDateOnly(model.item.release.date)}</dd>
                    </div>
                    <div className="rounded-[1.1rem] border border-ink/10 bg-bone-soft p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">SKU</dt>
                      <dd className="mt-2 text-lg font-semibold text-ink">{model.item.sku}</dd>
                    </div>
                    <div className="rounded-[1.1rem] border border-ink/10 bg-bone-soft p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Colorway</dt>
                      <dd className="mt-2 text-lg font-semibold text-ink">{model.item.colorway || 'Colorway pending'}</dd>
                    </div>
                    <div className="rounded-[1.1rem] border border-ink/10 bg-bone-soft p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Availability</dt>
                      <dd className="mt-2 text-lg font-semibold capitalize text-ink">{model.item.availability}</dd>
                    </div>
                  </dl>
                </section>

                <section>
                  <h2>Editorial enrichment status</h2>
                  <p>{model.editorial.reviewNote}</p>
                </section>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Frequently asked</div>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {model.faqs.map((faq) => (
                  <div key={faq.question} className="rounded-[1.2rem] border border-ink/10 bg-bone-soft p-5">
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
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Related paths</div>
              <div className="mt-4 space-y-3">
                {model.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-growth-cta={link.label}
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
