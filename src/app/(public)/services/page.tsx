import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import OrbitalScene from '@/components/OrbitalScene';
import { Badge, Card } from '@/components/ui';
import TrustProofStrip from '@/components/TrustProofStrip';

export const metadata: Metadata = {
  title: 'Basic, Pro, and Elite sneaker care | ShoeGlitch',
  description:
    'Compare ShoeGlitch Basic, Pro, and Elite sneaker care tiers, plus add-ons for pickup, drop-off, and nationwide mail-in orders.',
};

const SERVICE_GUIDE = [
  {
    title: 'Pick Basic',
    bestFor: 'Daily pairs, quick refreshes, and routine Steam Clean work.',
    route: '/book?service=basic',
  },
  {
    title: 'Move into Pro',
    bestFor: 'Creasing, visible wear, and pairs that need more than a standard clean.',
    route: '/book?service=pro',
  },
  {
    title: 'Step up to Elite',
    bestFor: 'Collector pairs, repaint work, Ice method jobs, and full restorations.',
    route: '/book?service=elite',
  },
] as const;

const TIER_DETAILS: Record<string, {
  tone: 'default' | 'acid' | 'neon' | 'glitch';
  label: string;
  includes: string[];
  note?: string;
}> = {
  svc_fresh_start: {
    tone: 'neon',
    label: 'Routine refresh',
    includes: [
      'Steam Clean baseline',
      'Upper and sole cleaning',
      'Lace cleaning',
      'Routine finishing',
    ],
  },
  svc_full_reset: {
    tone: 'acid',
    label: 'Most popular',
    includes: [
      'Everything in Basic',
      'De-crease method',
      'Deeper detailing',
      'Light paint touch-ups',
    ],
  },
  svc_revival: {
    tone: 'glitch',
    label: 'Full restoration',
    includes: [
      'Everything in Pro',
      'Ice method work',
      'Basic-color repaint touch-ups',
      'High-restoration routing, including rebottom evaluation for qualifying pairs',
    ],
    note: 'Elite repaint coverage is limited to basic colors. Complex custom colorways are not included by default.',
  },
};

export default async function ServicesPage() {
  const cleanServices = await db.services.primary();
  const addOns = await db.services.addOns();

  return (
    <>
      <section className="container-x pt-10 pb-16">
        <div className="section-shell p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.85fr)] lg:items-center">
            <div>
              <Badge className="mb-6">Services</Badge>
              <h1 className="h-display text-[clamp(3rem,8vw,6.8rem)] leading-[0.86] mb-5">
                Three tiers.
                <br />
                <em className="h-italic text-glitch">Zero clutter.</em>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink/68">
                Pick Basic, Pro, or Elite. Steam Clean stays standard. The correction and restoration work scales up only when the pair actually needs it.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/book" className="btn-glitch">Book a tier →</Link>
                <Link href="/mail-in" className="btn-outline">Nationwide mail-in →</Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
              <OrbitalScene className="min-h-[320px]" />
              <div className="grid gap-4">
                {[
                  ['Basic', 'Routine refresh', 'Steam Clean, upper/sole work, lace cleaning'],
                  ['Pro', 'Most popular', 'De-crease method, deeper detail, light touch-ups'],
                  ['Elite', 'Restoration path', 'Ice method, basic-color repaint touch-ups, major recovery'],
                ].map(([title, label, detail]) => (
                  <div key={title} className="section-outline p-4">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-glitch/80">{label}</div>
                    <div className="mt-2 h-display text-3xl text-ink">{title}</div>
                    <div className="mt-2 text-sm leading-6 text-ink/62">{detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <TrustProofStrip
            className="mt-8"
            items={[
              {
                label: 'See pricing before checkout',
                detail: 'Quotes update live based on city, route, service mix, and rush selection.',
              },
              {
                label: 'Use the route that fits',
                detail: 'Pickup, drop-off, and mail-in stay in one booking flow so the handoff stays clear.',
              },
              {
                label: 'Steam is standard',
                detail: 'Every tier starts from the same Steam Clean baseline before correction work begins.',
              },
            ]}
          />
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)] lg:items-start">
          <Card className="p-7 border-2 border-ink/10">
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-glitch/85">Choose by outcome</div>
            <h2 className="h-display mt-4 text-[clamp(2.2rem,4vw,3.6rem)] leading-[0.96]">
              Start with what the pair needs.
            </h2>
            <div className="mt-6 grid gap-3">
              {[
                'Basic is for regular care and visible dirt.',
                'Pro is for creases, visible wear, and light correction.',
                'Elite is for collector pairs, icy soles, repaint work, and major restoration.',
              ].map((line) => (
                <div key={line} className="rounded-[1.1rem] border border-ink/10 bg-bone-soft px-4 py-3 text-sm leading-6 text-ink/62">
                  {line}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {SERVICE_GUIDE.map((item) => (
              <Link
                key={item.title}
                href={item.route}
                className="rounded-[1.6rem] border-2 border-ink/10 bg-white/80 p-5 shadow-[0_18px_40px_rgba(10,15,31,0.06)] transition hover:-translate-y-1 hover:border-glitch/20 hover:bg-white"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Best for</div>
                <h3 className="h-display mt-3 text-3xl leading-[0.96] text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/66">{item.bestFor}</p>
                <div className="mt-5 text-sm font-semibold text-glitch">Go this route →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.24em] text-glitch/85">Three core tiers</div>
            <h2 className="h-display text-3xl">A cleaner menu, with clearer expectations.</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink/60">
            Less reading. Better decisions. The only real question is how far the pair needs to be pushed after the Steam Clean baseline.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cleanServices.map((s) => (
            <Card key={s.id} className="p-8 card-lift border-2 border-ink/10">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/45">{TIER_DETAILS[s.id]?.label}</div>
                  <h3 className="h-display mt-2 text-4xl">{s.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-ink/40">from</div>
                  <div className="h-display text-3xl">
                    ${s.priceMin ?? s.basePrice}
                    {s.priceMax && <span className="text-ink/40 text-lg"> — ${s.priceMax}</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-ink/50 italic mb-4">{s.tagline}</p>
              <p className="text-sm leading-6 text-ink/66 mb-5">{s.description}</p>
              <div className="mb-5 flex flex-wrap gap-2">
                <Badge tone={TIER_DETAILS[s.id]?.tone ?? 'default'}>{TIER_DETAILS[s.id]?.label}</Badge>
                <Badge>Steam Clean included</Badge>
                <Badge>{s.estimatedTurnaroundDays} day turnaround</Badge>
              </div>
              <div className="mb-6 rounded-[1.35rem] border border-ink/10 bg-bone-soft px-5 py-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/45">Included</div>
                <ul className="mt-3 space-y-2 text-sm text-ink/62">
                  {(TIER_DETAILS[s.id]?.includes ?? []).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              {TIER_DETAILS[s.id]?.note ? (
                <p className="mb-6 rounded-[1.15rem] border border-glitch/15 bg-glitch/5 px-4 py-4 text-xs leading-6 text-ink/55">
                  {TIER_DETAILS[s.id]?.note}
                </p>
              ) : null}
              <div className="flex items-center justify-between pt-4 border-t border-ink/10">
                <div className="flex gap-2 flex-wrap">
                  {s.rushEligible && <Badge tone="acid">Rush OK</Badge>}
                  <Badge>{s.category}</Badge>
                </div>
                <Link href={`/book?service=${s.slug}`} className="btn-primary py-2 px-4 text-xs shrink-0">
                  Book →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-x py-16">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.24em] text-glitch/85">Optional add-ons</div>
            <h2 className="h-display text-3xl">Small extras, if the pair needs them.</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink/60">
            Add-ons stay separate so the main tiers stay simple. Choose them only when the pair needs extra protection, lace work, interior refresh, or spot correction.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {addOns.map((s) => (
            <Card key={s.id} className="p-6 card-lift border-2 border-ink/10">
              <h3 className="h-display text-2xl mb-1">{s.name}</h3>
              <p className="text-xs text-ink/50 mb-4">{s.tagline}</p>
              <div className="h-display text-xl">
                +${s.priceMin ?? s.basePrice}
                {s.priceMax && <span className="text-ink/40 text-sm">–{s.priceMax}</span>}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
