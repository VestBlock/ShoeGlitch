import Link from 'next/link';
import GrowthChatbot from '@/components/growth/GrowthChatbot';
import GrowthTracker from '@/components/growth/GrowthTracker';
import ExitIntentOffer from '@/components/growth/ExitIntentOffer';
import LeadCaptureForm from '@/components/growth/LeadCaptureForm';
import { buildGrowthSchemas } from '@/lib/growth/schema';
import type { GrowthLinkSuggestion, GrowthPageContent, GrowthRouteSpec } from '@/lib/growth/types';

export default function SeoLandingPage({
  spec,
  content,
  relatedLinks,
}: {
  spec: GrowthRouteSpec;
  content: GrowthPageContent;
  relatedLinks: GrowthLinkSuggestion[];
}) {
  const schemas = buildGrowthSchemas(spec, content);

  return (
    <>
      <GrowthTracker routePath={spec.path} pageTitle={content.title} />
      <GrowthChatbot routePath={spec.path} />
      <ExitIntentOffer routePath={spec.path} offer={content.cta.offer} />
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative overflow-hidden bg-bone">
        <div className="absolute inset-0 matrix-strip opacity-25 pointer-events-none" />
        <div className="container-x relative py-12 md:py-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] xl:items-start">
            <div className="rounded-[2rem] border border-ink/10 bg-white/78 p-6 shadow-[0_26px_80px_rgba(10,15,31,0.08)] backdrop-blur-xl md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-glitch/15 bg-glitch/[0.07] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-glitch/85">
                <span className="h-2 w-2 rounded-full bg-cyan" />
                SEO + AEO landing page
              </div>

              <h1 className="h-display mt-5 max-w-4xl text-[clamp(2.8rem,5vw,5rem)] leading-[0.92] tracking-tight text-ink">
                {content.h1}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/68">{content.intro}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={content.cta.primaryHref} className="btn-glitch" data-growth-cta="hero-primary">
                  {content.cta.primaryLabel}
                </Link>
                <Link href={content.cta.secondaryHref} className="btn-outline" data-growth-cta="hero-secondary">
                  {content.cta.secondaryLabel}
                </Link>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-ink/10 bg-bone-soft p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                    Quick answer
                  </div>
                  <p className="mt-3 text-base leading-7 text-ink/72">{content.quickAnswer}</p>
                </div>
                <div className="rounded-[1.4rem] border border-ink/10 bg-white p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                    Summary
                  </div>
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-ink/70">
                    {content.summaryBullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-cyan" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <aside className="xl:sticky xl:top-24">
              <LeadCaptureForm routePath={spec.path} offer={content.cta.offer} />
              <div className="mt-4 rounded-[1.4rem] border border-ink/10 bg-white/70 p-5 text-sm text-ink/65 shadow-[0_16px_40px_rgba(10,15,31,0.06)] backdrop-blur-xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                  Best next moves
                </div>
                <div className="mt-3 space-y-3">
                  <Link href="/book" className="block hover:text-glitch" data-growth-cta="sticky-book">
                    Start your order →
                  </Link>
                  <Link href="/coverage" className="block hover:text-glitch" data-growth-cta="sticky-coverage">
                    Check your city →
                  </Link>
                  <Link href="/services" className="block hover:text-glitch" data-growth-cta="sticky-services">
                    Compare service options →
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <article className="rounded-[2rem] border border-ink/10 bg-white/82 p-6 shadow-[0_24px_70px_rgba(10,15,31,0.06)] backdrop-blur-xl md:p-8">
            <header className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                Long answer
              </div>
              <p className="mt-4 text-lg leading-8 text-ink/70">{content.longAnswer}</p>
            </header>

            <div className="prose-sg mt-10 max-w-none">
              {content.sections.map((section) => (
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
            <div className="rounded-[1.8rem] border border-ink/10 bg-white/82 p-6 shadow-[0_20px_55px_rgba(10,15,31,0.06)] backdrop-blur-xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                How to move forward
              </div>
              <ol className="mt-4 space-y-4">
                {content.howToSteps.map((step, index) => (
                  <li key={step.name} className="rounded-[1.2rem] border border-ink/10 bg-bone-soft p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-glitch/80">
                      Step {index + 1}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-ink">{step.name}</div>
                    <p className="mt-2 text-sm leading-6 text-ink/66">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-[1.8rem] border border-ink/10 bg-white/82 p-6 shadow-[0_20px_55px_rgba(10,15,31,0.06)] backdrop-blur-xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
                Related pages
              </div>
              <div className="mt-4 space-y-3">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-[1.1rem] border border-ink/10 bg-bone-soft px-4 py-3 transition hover:border-glitch/25 hover:bg-white"
                    data-growth-cta={`related-${link.label}`}
                  >
                    <div className="font-semibold text-ink">{link.label}</div>
                    <div className="mt-1 text-sm text-ink/60">{link.reason}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="rounded-[2rem] border border-ink/10 bg-white/82 p-6 shadow-[0_24px_70px_rgba(10,15,31,0.06)] backdrop-blur-xl md:p-8">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
              Frequently asked questions
            </div>
            <h2 className="h-display mt-4 text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.95] text-ink">
              Direct answers before you book.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {content.faqs.map((faq) => (
              <div key={faq.question} className="rounded-[1.4rem] border border-ink/10 bg-bone-soft p-5">
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
