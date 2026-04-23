import { db } from '@/lib/db';
import { Badge, Card } from '@/components/ui';
import { submitApplicationAction } from './actions';

const PRICES = { starter: 349, pro: 599, luxury: 899 };

export default async function OperatorApplyPage({
  searchParams,
}: {
  searchParams: { tier?: string; city?: string; focus?: string; availability?: string };
}) {
  const tier = (searchParams.tier as 'starter' | 'pro' | 'luxury') || 'pro';
  const cities = await db.cities.all();
  const selectedCity =
    cities.find((city) => city.slug === searchParams.city) ??
    cities.find((city) => city.id === searchParams.city) ??
    cities[0];
  const price = PRICES[tier];
  const focusLabel =
    searchParams.focus === 'pickup-dropoff'
      ? 'Pickup & drop-off focus'
      : searchParams.focus === 'restoration'
        ? 'Restoration focus'
        : searchParams.focus === 'cleaning'
          ? 'Cleaning focus'
          : null;
  const availabilityLabel =
    searchParams.availability === 'nights-weekends'
      ? 'Availability: nights & weekends'
      : searchParams.availability === 'part-time-weekday'
        ? 'Availability: part-time weekdays'
        : searchParams.availability === 'full-time-ready'
          ? 'Availability: ready for full-time territory work'
          : null;

  return (
    <section className="container-x pt-10 pb-24 max-w-3xl mx-auto">
      <Badge tone="glitch" className="mb-4">Operator application</Badge>
      <h1 className="h-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] mb-4">
        Apply to join Shoe Glitch.
      </h1>
      <p className="text-ink/70 mb-10">
        Selected kit: <strong className="capitalize">{tier}</strong> · <span className="font-mono">${price}</span>.
      </p>
      {selectedCity ? (
        <div className="mb-8 rounded-[1.25rem] border border-ink/10 bg-bone-soft px-5 py-4 text-sm text-ink/70">
          Applying with <strong>{selectedCity.name}, {selectedCity.state}</strong> preselected.
          {focusLabel ? <> <span className="text-glitch/85">{focusLabel}.</span></> : null}
          {availabilityLabel ? <> <span className="text-ink/65">{availabilityLabel}.</span></> : null}
        </div>
      ) : null}

      <Card className="p-8">
        <form action={submitApplicationAction} encType="multipart/form-data" className="space-y-5">
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
              <select name="cityId" className="input" required defaultValue={selectedCity?.id}>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}, {c.state}{!c.active && ' (pre-launch)'}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Experience</label>
            <textarea
              name="experience"
              className="input min-h-[100px]"
              defaultValue={focusLabel || availabilityLabel ? [focusLabel, availabilityLabel].filter(Boolean).join(' · ') : undefined}
              placeholder="Cleaning / restoration experience."
            />
          </div>
          <div>
            <label className="label">Why Shoe Glitch?</label>
            <textarea name="whyJoin" className="input min-h-[80px]" />
          </div>
          <div>
            <label className="label">Driver license upload</label>
            <input
              name="licenseFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="input file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              required
            />
            <p className="mt-2 text-xs leading-relaxed text-ink/55">
              Required for operator review because pickup and drop-off work involves customer property and local routes.
              JPG, PNG, WebP, or PDF accepted. Max 10MB.
            </p>
          </div>
          <div className="pt-4 border-t border-ink/10 flex items-center justify-between">
            <div className="text-sm text-ink/60">Your application is submitted first, then you continue to the one-time kit payment so the review can move forward.</div>
            <button className="btn-glitch">Continue to kit payment →</button>
          </div>
        </form>
      </Card>
    </section>
  );
}
