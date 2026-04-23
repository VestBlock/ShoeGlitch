import Link from 'next/link';
import GrowthTracker from '@/components/growth/GrowthTracker';
import { Badge, Card } from '@/components/ui';
import { buildSeoSchemas } from '@/features/seo/schema';
import type { SeoPageModel } from '@/features/seo/types';
import TrustProofStrip from '@/components/TrustProofStrip';

export default function LocalLandingPage({ model }: { model: SeoPageModel }) {
  const schemas = buildSeoSchemas(model);

  return (
    <>
      <GrowthTracker routePath={model.path} pageTitle={model.title} />

      {schemas.map((schema, index) => (
        <script
          key={`seo-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative overflow-hidden bg-bone">
        <div className="absolute inset-0 matrix-strip opacity-20 pointer-events-none" />
        <div className="container-x relative py-12 md:py-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_380px] xl:items-start">
            <div className="rounded-[2rem] border border-ink/10 bg-white/82 p-6 shadow-[0_20px_70px_rgba(10,15,31,0.06)] backdrop-blur-xl md:p-8">
              <Badge className="mb-5">{model.eyebrow}</Badge>
              <h1 className="h-display text-[clamp(2.8rem,6vw,5rem)] leading-[0.92] tracking-tight">
                {model.h1}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/68">{model.intro}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={model.cta.primaryHref} className="btn-glitch" data-growth-cta={model.cta.primaryLabel}>
                  {model.cta.primaryLabel}
                </Link>
                <Link href={model.cta.secondaryHref} className="btn-outline" data-growth-cta={model.cta.secondaryLabel}>
                  {model.cta.secondaryLabel}
                </Link>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.35rem] border border-ink/10 bg-bone-soft p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                    Direct answer
                  </div>
                  <p className="mt-3 text-base leading-7 text-ink/72">{model.quickAnswer}</p>
                </div>
                <div className="rounded-[1.35rem] border border-ink/10 bg-white p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                    Why this page matters
                  </div>
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-ink/70">
                    {model.summaryBullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-cyan" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <TrustProofStrip
                className="mt-8"
                items={[
                  {
                    label: 'Built for a real next step',
                    detail: 'These pages route straight into booking, coverage, and the right service path instead of stopping at generic information.',
                  },
                  {
                    label: 'Grounded in real coverage',
                    detail: model.serviceAreas.length > 0
                      ? `${model.city.name} is tied to active service areas, so the local claim stays real.`
                      : 'Mail-in stays available while local coverage expands.',
                  },
                  {
                    label: 'Clear answers up front',
                    detail: 'Direct answers and FAQs sit near the top so the page is useful before it gets long.',
                  },
                ]}
              />
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24">
              <Card className="p-6">
                <div className="font-mono text-xs uppercase tracking-[0.28em] text-glitch/85">
                  Service areas
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {model.serviceAreas.length > 0 ? (
                    model.serviceAreas.map((area) => (
                      <span key={area.id} className="rounded-full border border-ink/10 bg-bone-soft px-3 py-2 text-xs text-ink/70">
                        {area.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-ink/60">
                      Mail-in remains available while local service coverage expands.
                    </span>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <div className="font-mono text-xs uppercase tracking-[0.28em] text-glitch/85">
                  Best next moves
                </div>
                <div className="mt-4 space-y-3">
                  {model.links.map((link) => (
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
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <article className="rounded-[2rem] border border-ink/10 bg-white/82 p-6 shadow-[0_20px_70px_rgba(10,15,31,0.06)] backdrop-blur-xl md:p-8">
            <div className="prose-sg max-w-none">
              {model.sections.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets?.length ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </article>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="font-mono text-xs uppercase tracking-[0.28em] text-glitch/85">
                Not sure which route fits?
              </div>
              <h2 className="h-display mt-4 text-[clamp(1.9rem,3vw,2.8rem)] leading-[0.96] text-ink">
                Start with the fastest next action.
              </h2>
              <div className="mt-4 space-y-3">
                <Link
                  href="/coverage"
                  data-growth-cta="Check your ZIP first"
                  className="block rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-3 transition hover:border-glitch/25 hover:bg-white"
                >
                  <div className="font-semibold text-ink">Check your ZIP first</div>
                  <div className="mt-1 text-sm text-ink/60">Use this if you need to know whether pickup or drop-off is live for your area.</div>
                </Link>
                <Link
                  href="/services"
                  data-growth-cta="Compare services"
                  className="block rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-3 transition hover:border-glitch/25 hover:bg-white"
                >
                  <div className="font-semibold text-ink">Compare services</div>
                  <div className="mt-1 text-sm text-ink/60">Use this if you still need to decide between cleaning, restoration, or local handling.</div>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <div className="font-mono text-xs uppercase tracking-[0.28em] text-glitch/85">
                Best next step
              </div>
              <h2 className="h-display mt-4 text-[clamp(2rem,4vw,3rem)] leading-[0.95]">
                {model.cta.headline}
              </h2>
              <p className="mt-4 text-sm leading-7 text-ink/66">{model.cta.body}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={model.cta.primaryHref} className="btn-glitch" data-growth-cta={model.cta.primaryLabel}>
                  {model.cta.primaryLabel}
                </Link>
                <Link href={model.cta.secondaryHref} className="btn-outline" data-growth-cta={model.cta.secondaryLabel}>
                  {model.cta.secondaryLabel}
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="rounded-[2rem] border border-ink/10 bg-white/82 p-6 shadow-[0_20px_70px_rgba(10,15,31,0.06)] backdrop-blur-xl md:p-8">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
              Frequently asked questions
            </div>
            <h2 className="h-display mt-4 text-[clamp(2.1rem,4vw,3.2rem)] leading-[0.95] text-ink">
              Straight answers before you book.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {model.faqs.map((faq) => (
              <div key={faq.question} className="rounded-[1.35rem] border border-ink/10 bg-bone-soft p-5">
                <h3 className="text-lg font-semibold text-ink">{faq.question}</h3>
                <p className="mt-3 text-sm font-medium text-glitch/85">{faq.shortAnswer}</p>
                <p className="mt-3 text-sm leading-6 text-ink/66">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
