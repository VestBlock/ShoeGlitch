import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { resolveCatalogForCity } from '@/services/catalog';
import { resolveNationalMailInCity } from '@/lib/mail-in';
import { BookingFlow } from './BookingFlow';
import { Badge } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Book sneaker cleaning or restoration | ShoeGlitch',
  description:
    'Start a ShoeGlitch order for sneaker cleaning, steam-assisted care, restoration, pickup, drop-off, or mail-in service.',
};

export default async function BookPage() {
  const cities = await db.cities.all();
  const mailInCity = resolveNationalMailInCity(cities);
  const entries = await Promise.all(
    cities.map(async (c) => [c.id, await resolveCatalogForCity(c.id)] as const),
  );
  const servicesByCity: Record<string, Awaited<ReturnType<typeof resolveCatalogForCity>>> = {};
  for (const [id, catalog] of entries) servicesByCity[id] = catalog;

  return (
    <section className="container-x pt-8 pb-24">
      <div className="section-shell mb-12 p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end">
          <div className="max-w-4xl">
            <Badge className="mb-4">Booking</Badge>
            <h1 className="h-display text-[clamp(2.8rem,6vw,4.9rem)] leading-[0.9]">
              Pick the route, then the tier. <em className="h-italic text-glitch">That&rsquo;s it.</em>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink/66">
              Local cities are for pickup and drop-off. Mail-in stays open nationwide. Every order still runs through the same Basic, Pro, or Elite care system once the pair is in.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['1', 'Choose your handoff', 'Local pickup, drop-off, or nationwide mail-in'],
              ['2', 'Choose the tier', 'Basic, Pro, or Elite based on how hard the pair needs to be pushed'],
              ['3', 'Checkout once', 'Photos, pricing, shipping, and order tracking stay connected'],
            ].map(([step, title, detail]) => (
              <div key={step} className="section-outline p-4">
                <div className="section-kicker !bg-bone-soft !px-3 !py-1.5 !shadow-none">{step}</div>
                <div className="mt-4 text-base font-semibold text-ink">{title}</div>
                <div className="mt-2 text-sm leading-6 text-ink/60">{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="text-ink/50">Loading…</div>}>
        <BookingFlow cities={cities} servicesByCity={servicesByCity} mailInCityId={mailInCity?.id ?? ''} />
      </Suspense>
    </section>
  );
}
