import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { OrdersTable, buildLookups } from '@/components/OrdersTable';
import { Badge, Card, StatusDot } from '@/components/ui';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export default async function CleanerDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'cleaner') redirect('/login');

  const cleaner = await db.cleaners.byUserId(session.userId);
  if (!cleaner) redirect('/login');

  const [city, orders] = await Promise.all([
    db.cities.byId(cleaner.cityId),
    db.orders.byCleaner(cleaner.id),
  ]);
  if (!city) redirect('/login');

  // Fetch all customers referenced in orders
  const uniqueCustomerIds = Array.from(new Set(orders.map((o) => o.customerId)));
  const customers = (
    await Promise.all(uniqueCustomerIds.map((id) => db.customers.byId(id)))
  ).filter((c): c is NonNullable<typeof c> => !!c);
  const lookups = buildLookups([city], customers);

  const active = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const done = orders.filter((o) => o.status === 'completed');
  const needsAction = active.filter((o) =>
    ['pickup_assigned', 'picked_up', 'received_at_hub', 'in_cleaning', 'in_restoration', 'quality_check'].includes(o.status),
  );

  return (
    <DashboardShell currentPath="/cleaner" pageTitle={`Let's work, ${session.name.split(' ')[0]}.`}>
      <div className="flex items-center gap-3 mb-8">
        <Badge tone="dark"><StatusDot tone="live" /> {city.name} · {city.state}</Badge>
        <Badge>Territory: {cleaner.serviceAreaIds.length} zones</Badge>
        <Badge tone="acid">★ {cleaner.rating}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Needs action</div>
          <div className="h-display text-5xl text-glitch">{needsAction.length}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Active jobs</div>
          <div className="h-display text-5xl">{active.length}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Completed</div>
          <div className="h-display text-5xl">{done.length}</div>
        </Card>
        <Card className="card-ink">
          <div className="font-mono text-xs text-bone/40 mb-1">Payout rate</div>
          <div className="h-display text-5xl">{Math.round(cleaner.payoutRate * 100)}%</div>
        </Card>
      </div>

      <section className="mb-10">
        <h2 className="h-display text-3xl mb-5">Jobs needing you</h2>
        {needsAction.length === 0 ? (
          <Card className="p-8 text-center text-ink/50">You're all caught up. 👟</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {needsAction.map((o) => {
              const customer = lookups.customers.get(o.customerId);
              const primary = o.items.find((i) => !i.isAddOn);
              return (
                <Link key={o.id} href={`/cleaner/orders/${o.id}`} className="card p-6 card-lift">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-xs text-ink/40">{o.code}</span>
                    <Badge tone="glitch">{o.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="h-display text-2xl mb-1">{primary?.serviceName}</div>
                  <div className="text-sm text-ink/60 mb-4">{customer?.name} · {o.fulfillmentMethod}</div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="h-display text-3xl mb-5">All your orders</h2>
        <OrdersTable orders={orders} hrefBase="/cleaner/orders" lookups={lookups} emptyLabel="No jobs assigned yet." />
      </section>
    </DashboardShell>
  );
}
