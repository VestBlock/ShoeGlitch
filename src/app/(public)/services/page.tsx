import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge, Card } from '@/components/ui';
import TrustProofStrip from '@/components/TrustProofStrip';

const SERVICE_GUIDE = [
  {
    title: 'Start with a clean',
    bestFor: 'Daily pairs, mesh runners, and visible dirt or salt.',
    route: '/book?service=fresh-start',
  },
  {
    title: 'Go restoration',
    bestFor: 'Scuffs, sole yellowing, heavy wear, or a pair you want to keep long-term.',
    route: '/book?service=full-reset',
  },
  {
    title: 'Use pickup or mail-in',
    bestFor: 'When you want the easiest handoff and tracked updates instead of guessing next steps.',
    route: '/pickup-dropoff',
  },
] as const;

export default async function ServicesPage() {
  const allPrimary = await db.services.primary();
  const cleanServices = allPrimary.filter(s => s.category === 'clean' || s.category === 'specialty' || s.category === 'restoration');
  const luxuryServices = allPrimary.filter(s => s.category === 'luxury');
  const addOns = await db.services.addOns();

  return (
    <>
      <section className="container-x pt-10 pb-16">
        <Badge className="mb-6">The catalog</Badge>
        <h1 className="h-display text-[clamp(3rem,8vw,7rem)] leading-[0.88] mb-6">
          Every job, <em className="h-italic text-glitch">named and priced.</em>
        </h1>
        <p className="text-ink/70 max-w-2xl text-lg">
          Pricing shown is the national default. Your city may have local pricing — you&rsquo;ll see the final number at checkout.
        </p>
        <TrustProofStrip
          className="mt-8"
          items={[
            {
              label: 'See pricing before checkout',
              detail: 'Quotes update live based on city, route, service mix, and rush selection.',
            },
            {
              label: 'Built around the pair',
              detail: 'Cleaning, restoration, sole work, and add-ons all stack into one tracked order.',
            },
            {
              label: 'Use the route that fits',
              detail: 'Pickup, drop-off, and mail-in stay in the same booking flow so the handoff stays clear.',
            },
          ]}
        />
      </section>

      <section className="container-x pb-16">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <Card className="p-7">
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-glitch/85">Need the right service fast?</div>
            <h2 className="h-display mt-4 text-[clamp(2.2rem,4vw,3.6rem)] leading-[0.96]">
              Start with the outcome, not the menu.
            </h2>
            <p className="mt-4 text-base leading-7 text-ink/68">
              Most customers only need one question answered: does this pair need a quick clean, a deeper restoration, or the easiest route to hand it off?
            </p>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {SERVICE_GUIDE.map((item) => (
              <Link
                key={item.title}
                href={item.route}
                className="rounded-[1.6rem] border border-ink/10 bg-white/80 p-5 shadow-[0_18px_40px_rgba(10,15,31,0.06)] transition hover:-translate-y-1 hover:border-glitch/20 hover:bg-white"
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
        <h2 className="h-display text-3xl mb-6">
          <span className="font-mono text-sm text-glitch">CLEANING + RESTORATION</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cleanServices.map((s) => (
            <Card key={s.id} className="p-8 card-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="h-display text-4xl">{s.name}</h3>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-ink/40">from</div>
                  <div className="h-display text-3xl">
                    ${s.priceMin ?? s.basePrice}
                    {s.priceMax && <span className="text-ink/40 text-lg"> — ${s.priceMax}</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-ink/50 italic mb-4">{s.tagline}</p>
              <p className="text-ink/70 mb-6">{s.description}</p>
              <div className="mb-6 flex flex-wrap gap-2">
                {s.category === 'clean' && <Badge tone="neon">Best for visible dirt</Badge>}
                {s.category === 'restoration' && <Badge tone="acid">Best for deeper recovery</Badge>}
                {s.category === 'specialty' && <Badge>Best for material-specific care</Badge>}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-ink/10">
                <div className="flex gap-2 flex-wrap">
                  <Badge>{s.category}</Badge>
                  {s.rushEligible && <Badge tone="acid">Rush OK</Badge>}
                  <Badge>{s.estimatedTurnaroundDays}d turnaround</Badge>
                </div>
                <Link href={`/book?service=${s.slug}`} className="btn-primary py-2 px-4 text-xs shrink-0">
                  Book →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-ink text-bone py-16 relative overflow-hidden">
        <div className="absolute inset-0 matrix-strip opacity-20" />
        <div className="container-x relative">
          <h2 className="h-display text-3xl mb-2">
            <span className="font-mono text-sm text-cyan">SOLE COLOR</span>
          </h2>
          <p className="text-bone/60 mb-8 max-w-xl">
            Professional sole repaint for heels — red bottoms, black soles, custom colors.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {luxuryServices.map((s) => (
              <div key={s.id} className="rounded-card border border-bone/15 p-8 hover:border-cyan transition bg-bone/5">
                <Badge tone="glitch" className="bg-cyan text-ink mb-3">{s.category}</Badge>
                <h3 className="h-display text-3xl mb-2">{s.name}</h3>
                <p className="text-sm text-bone/60 italic mb-4">{s.tagline}</p>
                <div className="h-display text-3xl mb-4">
                  ${s.priceMin ?? s.basePrice}
                  {s.priceMax && <span className="text-bone/40 text-lg"> — ${s.priceMax}</span>}
                </div>
                <p className="text-xs text-bone/60 mb-6">{s.description}</p>
                <Link href={`/book?service=${s.slug}`} className="btn bg-cyan text-ink hover:bg-white w-full justify-center text-xs py-2">
                  Book →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="h-display text-3xl mb-6">
          <span className="font-mono text-sm text-glitch">ADD-ONS</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {addOns.map((s) => (
            <Card key={s.id} className="p-6 card-lift">
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
