import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, StatusDot } from '@/components/ui';
import { OrdersTable, buildLookups } from '@/components/OrdersTable';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export default async function AdminOverview() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'super_admin') redirect('/login');

  const [cities, orders] = await Promise.all([db.cities.all(), db.orders.all()]);

  const uniqueCustomerIds = Array.from(new Set(orders.map((o) => o.customerId)));
  const customers = (
    await Promise.all(uniqueCustomerIds.map((id) => db.customers.byId(id)))
  ).filter((c): c is NonNullable<typeof c> => !!c);
  const lookups = buildLookups(cities, customers);

  const liveOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const flagged = orders.filter(o => o.status === 'issue_flagged');
  const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const byCity = cities.map((c) => {
    const cityOrders = orders.filter((o) => o.cityId === c.id);
    return {
      city: c,
      orders: cityOrders.length,
      active: cityOrders.filter(o => !['completed', 'cancelled'].includes(o.status)).length,
      revenue: cityOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0),
    };
  });

  return (
    <DashboardShell currentPath="/admin" pageTitle="HQ control room">
      <div className="flex items-center gap-3 mb-8">
        <Badge tone="dark"><StatusDot tone="live" /> {cities.filter(c=>c.active).length} cities live</Badge>
        <Badge>{cities.filter(c=>!c.active).length} pending</Badge>
        <Badge tone="glitch">{flagged.length} flagged</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <Card className="card-ink">
          <div className="font-mono text-xs text-bone/40 mb-1">Total revenue</div>
          <div className="h-display text-5xl text-bone">${revenue}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Live orders</div>
          <div className="h-display text-5xl">{liveOrders.length}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Completed</div>
          <div className="h-display text-5xl">{completedCount}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Flagged</div>
          <div className="h-display text-5xl text-glitch">{flagged.length}</div>
        </Card>
      </div>

      <section className="mb-10">
        <div className="flex items-end justify-between mb-5">
          <h2 className="h-display text-3xl">Cities</h2>
          <Link href="/admin/cities" className="btn-ghost text-xs">Manage →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {byCity.map(({ city, orders, active, revenue }) => (
            <Card key={city.id} className={city.active ? '' : 'opacity-60'}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-ink/40">{city.state}</span>
                {city.active ? <Badge tone="acid">LIVE</Badge> : <Badge>OFF</Badge>}
              </div>
              <div className="h-display text-3xl mb-3">{city.name}</div>
              <div className="space-y-1 text-xs text-ink/60">
                <div className="flex justify-between"><span>Total orders</span><span className="font-mono text-ink">{orders}</span></div>
                <div className="flex justify-between"><span>Active</span><span className="font-mono text-ink">{active}</span></div>
                <div className="flex justify-between"><span>Revenue</span><span className="font-mono text-ink">${revenue}</span></div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {flagged.length > 0 && (
        <section className="mb-10">
          <h2 className="h-display text-3xl mb-5 text-glitch">Flagged issues</h2>
          <OrdersTable orders={flagged} hrefBase="/admin/orders" showCustomer lookups={lookups} />
        </section>
      )}

      <section>
        <div className="flex items-end justify-between mb-5">
          <h2 className="h-display text-3xl">Recent orders</h2>
          <Link href="/admin/orders" className="btn-ghost text-xs">View all →</Link>
        </div>
        <OrdersTable orders={orders.slice(0, 10)} hrefBase="/admin/orders" showCustomer lookups={lookups} />
      </section>
    </DashboardShell>
  );
}
