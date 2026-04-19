import { Suspense } from 'react';
import { db } from '@/lib/db';
import { resolveCatalogForCity } from '@/services/catalog';
import { BookingFlow } from './BookingFlow';
import { Badge } from '@/components/ui';

export default async function BookPage() {
  const cities = await db.cities.all();
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
        <BookingFlow cities={cities} servicesByCity={servicesByCity} />
      </Suspense>
    </section>
  );
}
