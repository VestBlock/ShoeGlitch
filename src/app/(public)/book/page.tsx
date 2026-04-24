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
      <div className="max-w-4xl mb-12">
        <Badge className="mb-4">Booking</Badge>
        <h1 className="h-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9]">
          Six steps. <em className="h-italic text-glitch">Under two minutes.</em>
        </h1>
      </div>
      <Suspense fallback={<div className="text-ink/50">Loading…</div>}>
        <BookingFlow cities={cities} servicesByCity={servicesByCity} mailInCityId={mailInCity?.id ?? ''} />
      </Suspense>
    </section>
  );
}
