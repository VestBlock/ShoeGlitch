import Link from 'next/link';
import { Badge, Card } from '@/components/ui';
import { OPERATOR_TIER_LIST } from '@/features/operators/tiers';

export default function OperatorPage() {
  return (
    <>
      <section className="container-x pt-10 pb-16">
        <Badge tone="glitch" className="mb-6">For operators</Badge>
        <h1 className="h-display text-[clamp(3rem,8vw,7rem)] leading-[0.88] mb-6">
          Make money cleaning.<br />
          <em className="h-italic text-glitch">We&rsquo;ll send the gear.</em>
        </h1>
        <p className="text-ink/70 max-w-2xl text-lg mb-10">
          Join the Shoe Glitch network as a certified operator. Pick your tier, get a branded kit shipped to you, complete training, and build inside your city. Basic and Pro operators handle their own local marketing; Luxury operators qualify for ShoeGlitch-supported digital ad spend and exclusive territory review.
        </p>
        <div className="flex flex-wrap gap-3 mb-12">
          <div className="px-4 py-2 bg-bone-soft rounded-full text-sm">Luxury: 5-10% platform fee</div>
          <div className="px-4 py-2 bg-bone-soft rounded-full text-sm">Pro: 20-25% platform fee</div>
          <div className="px-4 py-2 bg-bone-soft rounded-full text-sm">Basic: 35-40% platform fee</div>
          <div className="px-4 py-2 bg-bone-soft rounded-full text-sm">Pro + Luxury include the ice box</div>
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OPERATOR_TIER_LIST.map((tier) => (
            <Card
              key={tier.id}
              className={`p-8 flex flex-col ${
                tier.featured ? 'card-glitch shadow-glitch scale-[1.02]' : ''
              }`}
            >
              {tier.featured && (
                <div className="badge-glitch bg-cyan text-ink self-start mb-4">Most popular</div>
              )}
              <h3 className={`h-display text-4xl mb-1 ${tier.featured ? 'text-white' : ''}`}>
                {tier.name}
              </h3>
              <p className={`text-sm mb-6 italic ${tier.featured ? 'text-white/70' : 'text-ink/50'}`}>
                {tier.tagline}
              </p>
              <div className={`h-display text-5xl mb-2 ${tier.featured ? 'text-white' : ''}`}>
                ${tier.price}
              </div>
              <div className={`text-xs uppercase tracking-widest mb-6 ${tier.featured ? 'text-white/60' : 'text-ink/40'}`}>
                One-time kit fee
              </div>

              <div className={`grid grid-cols-2 gap-2 mb-6 text-xs ${tier.featured ? 'text-white/80' : 'text-ink/70'}`}>
                <div className={`rounded-[1rem] px-3 py-3 ${tier.featured ? 'bg-white/10' : 'bg-bone-soft'}`}>
                  <div className="uppercase tracking-widest opacity-60">Platform fee</div>
                  <div className="mt-1 font-semibold">{tier.platformFeeRange}</div>
                </div>
                <div className={`rounded-[1rem] px-3 py-3 ${tier.featured ? 'bg-white/10' : 'bg-bone-soft'}`}>
                  <div className="uppercase tracking-widest opacity-60">Operator share</div>
                  <div className="mt-1 font-semibold">{tier.payoutRange}</div>
                </div>
              </div>

              <div className={`text-xs uppercase tracking-widest mb-3 ${tier.featured ? 'text-cyan' : 'text-ink/50'}`}>
                Kit includes
              </div>
              <ul className={`space-y-2 mb-6 text-sm ${tier.featured ? 'text-white/90' : 'text-ink/80'}`}>
                {tier.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className={tier.featured ? 'text-cyan' : 'text-glitch'}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className={`text-xs uppercase tracking-widest mb-3 pt-6 border-t ${
                tier.featured ? 'text-cyan border-white/20' : 'text-ink/50 border-ink/10'
              }`}>
                Unlocks these services
              </div>
              <div className="flex flex-wrap gap-1.5 mb-8">
                {tier.unlocks.map((u) => (
                  <span key={u} className={`text-[11px] px-2 py-1 rounded-full ${
                    tier.featured ? 'bg-white/15 text-white' : 'bg-bone-soft text-ink'
                  }`}>
                    {u}
                  </span>
                ))}
              </div>

              <div className={`space-y-2 mb-8 text-xs ${tier.featured ? 'text-white/80' : 'text-ink/65'}`}>
                <div><strong>Marketing:</strong> {tier.marketingSupport}</div>
                <div><strong>Territory:</strong> {tier.territory}</div>
              </div>

              <Link
                href={`/operator/apply?tier=${tier.id}`}
                className={`mt-auto ${tier.featured ? 'btn bg-white text-glitch hover:bg-cyan' : 'btn-glitch'}`}
              >
                Apply for {tier.name} →
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-x pb-16">
        <h2 className="h-display text-3xl mb-8">What you get as an operator</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { t: 'Tiered platform fee', d: 'Basic starts with a higher platform fee because support is lighter. Pro lowers the fee with stronger tools. Luxury has the lowest fee because it is treated like a city-partner path.' },
            { t: 'Real training', d: 'Video certification modules per service, including when to use steam-assisted cleaning versus a lighter exterior-only pass. Submit a test pair before luxury jobs route to you.' },
            { t: 'Consumables at cost+10%', d: 'Refill your oxidation solution, paints, and protectants through the operator portal at near-wholesale prices.' },
            { t: 'Marketing and territory', d: 'Basic and Pro operators market themselves locally. Luxury operators can qualify for ShoeGlitch-supported digital ad spend and an exclusive territory with clear performance standards.' },
          ].map((f) => (
            <Card key={f.t} className="p-6">
              <h3 className="h-display text-2xl mb-2">{f.t}</h3>
              <p className="text-sm text-ink/60">{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-x pb-24">
        <Card className="card-ink grain relative overflow-hidden p-12">
          <div className="absolute inset-0 matrix-strip opacity-30" />
          <div className="relative z-10">
            <h3 className="h-display text-4xl md:text-5xl mb-4">
              Ready to run your own territory?
            </h3>
            <p className="text-bone/70 max-w-xl mb-8">
              Limited spots per city. Luxury territory is reviewed carefully so exclusivity stays fair, measurable, and tied to real local performance.
            </p>
            <Link href="/operator/apply" className="btn bg-cyan text-ink hover:bg-white">
              Start your application →
            </Link>
          </div>
        </Card>
      </section>
    </>
  );
}
