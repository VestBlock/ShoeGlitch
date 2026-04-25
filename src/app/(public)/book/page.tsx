import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { resolveCatalogForCity } from '@/services/catalog';
import { resolveNationalMailInCity } from '@/lib/mail-in';
import { getSession } from '@/lib/session';
import { getNationalMailInHubAddressLabel } from '@/lib/mail-in-hub';
import { BookingFlow } from './BookingFlow';
import { Badge } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Book sneaker cleaning or restoration | ShoeGlitch',
  description:
    'Start a ShoeGlitch order for sneaker cleaning, steam-assisted care, restoration, pickup, drop-off, or mail-in service.',
};

export default async function BookPage() {
  const session = await getSession();
  const cities = await db.cities.all();
  const mailInCity = resolveNationalMailInCity(cities);
  const entries = await Promise.all(
    cities.map(async (c) => [c.id, await resolveCatalogForCity(c.id)] as const),
  );
  const customer =
    session?.role === 'customer' ? await db.customers.byUserId(session.userId) : undefined;
  const servicesByCity: Record<string, Awaited<ReturnType<typeof resolveCatalogForCity>>> = {};
  for (const [id, catalog] of entries) servicesByCity[id] = catalog;

  return (
    <section className="container-x pt-8 pb-24">
      <div className="section-shell-dark mb-12 overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(0,229,255,0.18),transparent_22%),radial-gradient(circle_at_82%_24%,rgba(255,77,109,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_44%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end">
          <div className="max-w-4xl">
            <Badge className="mb-4 border-white/15 bg-white/8 text-bone">Booking</Badge>
            <h1 className="h-display text-[clamp(2.8rem,6vw,4.9rem)] leading-[0.9] text-bone">
              Pick the route.
              <br />
              <em className="h-italic text-cyan">Then the tier.</em>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-bone/72">
              Local cities are for pickup and drop-off. Mail-in stays open nationwide. Every order still runs through the same Basic, Pro, or Elite care system once the pair is in.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-bone/54">
              Checkout works with or without an account. We only need your contact details so we can send the receipt, label, and order updates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="badge-dark border-white/15">Guest checkout enabled</span>
              <span className="badge-dark border-white/15">Mail-in nationwide</span>
              <span className="badge-dark border-white/15">Basic / Pro / Elite</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['1', 'Choose your handoff', 'Local pickup, drop-off, or nationwide mail-in'],
              ['2', 'Choose the tier', 'Basic, Pro, or Elite based on how hard the pair needs to be pushed'],
              ['3', 'Checkout once', 'Photos, pricing, shipping, and order tracking stay connected'],
            ].map(([step, title, detail]) => (
              <div key={step} className="rounded-[1.4rem] border border-white/12 bg-white/6 p-4 shadow-[0_18px_40px_rgba(10,15,31,0.14)] backdrop-blur-xl">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan/20 bg-white/8 text-sm font-semibold text-cyan">
                  {step}
                </div>
                <div className="mt-4 text-base font-semibold text-bone">{title}</div>
                <div className="mt-2 text-sm leading-6 text-bone/62">{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="text-ink/50">Loading…</div>}>
        <BookingFlow
          cities={cities}
          servicesByCity={servicesByCity}
          mailInCityId={mailInCity?.id ?? ''}
          mailInHubAddressLabel={getNationalMailInHubAddressLabel()}
          initialCustomer={
            customer
              ? {
                  name: customer.name,
                  email: customer.email,
                  phone: customer.phone,
                }
              : session
                ? {
                    name: session.name,
                    email: session.email,
                  }
                : null
          }
        />
      </Suspense>
    </section>
  );
}
