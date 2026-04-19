import { db } from '@/lib/db';
import { Badge, Card } from '@/components/ui';
import { submitApplicationAction } from './actions';

const PRICES = { starter: 349, pro: 599, luxury: 899 };

export default async function OperatorApplyPage({ searchParams }: { searchParams: { tier?: string } }) {
  const tier = (searchParams.tier as 'starter' | 'pro' | 'luxury') || 'pro';
  const cities = await db.cities.all();
  const price = PRICES[tier];

  return (
    <section className="container-x pt-10 pb-24 max-w-3xl mx-auto">
      <Badge tone="glitch" className="mb-4">Operator application</Badge>
      <h1 className="h-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] mb-4">
        Apply to join Shoe Glitch.
      </h1>
      <p className="text-ink/70 mb-10">
        Selected kit: <strong className="capitalize">{tier}</strong> · <span className="font-mono">${price}</span>.
      </p>

      <Card className="p-8">
        <form action={submitApplicationAction} className="space-y-5">
          <input type="hidden" name="tier" value={tier} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Full name</label>
              <input name="name" className="input" required placeholder="Your name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" required placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" className="input" required placeholder="(###) ###-####" />
            </div>
            <div>
              <label className="label">Which city?</label>
              <select name="cityId" className="input" required>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}, {c.state}{!c.active && ' (pre-launch)'}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Experience</label>
            <textarea name="experience" className="input min-h-[100px]" placeholder="Cleaning / restoration experience." />
          </div>
          <div>
            <label className="label">Why Shoe Glitch?</label>
            <textarea name="whyJoin" className="input min-h-[80px]" />
          </div>
          <div className="pt-4 border-t border-ink/10 flex items-center justify-between">
            <div className="text-sm text-ink/60">Kit fee charged only after approval.</div>
            <button className="btn-glitch">Submit application →</button>
          </div>
        </form>
      </Card>
    </section>
  );
}
