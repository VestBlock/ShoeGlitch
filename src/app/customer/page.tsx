import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { OrdersTable, buildLookups } from '@/components/OrdersTable';
import { Badge, Card, ProgressBar } from '@/components/ui';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { progressPercent, STATUS_LABELS } from '@/lib/status';

export default async function CustomerDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'customer') redirect('/login');

  const customer = await db.customers.byUserId(session.userId);
  if (!customer) redirect('/login');

  const orders = await db.orders.byCustomer(customer.id);
  const [cities, customers] = await Promise.all([db.cities.all(), Promise.resolve([customer])]);
  const lookups = buildLookups(cities, customers);

  const active = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const lifetime = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <DashboardShell currentPath="/customer" pageTitle={`Hey, ${session.name.split(' ')[0]}.`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Active orders</div>
          <div className="h-display text-5xl">{active.length}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Lifetime spend</div>
          <div className="h-display text-5xl">${lifetime}</div>
        </Card>
        <Card className="card-ink flex flex-col justify-between">
          <div>
            <div className="font-mono text-xs text-bone/40 mb-1">Quick action</div>
            <div className="h-display text-2xl mt-1">Got another pair?</div>
          </div>
          <Link href="/book" className="btn-glitch mt-4 self-start">Book a clean →</Link>
        </Card>
      </div>

      {active.length > 0 && (
        <section className="mb-10">
          <h2 className="h-display text-3xl mb-5">In progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {active.map((o) => {
              const city = lookups.cities.get(o.cityId);
              const primary = o.items.find((i) => !i.isAddOn);
              const pct = progressPercent(o.fulfillmentMethod, o.status);
              return (
                <Link key={o.id} href={`/customer/orders/${o.id}`} className="card p-6 card-lift">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-xs text-ink/40">{o.code}</span>
                    <Badge tone="glitch">{STATUS_LABELS[o.status]}</Badge>
                  </div>
                  <div className="h-display text-2xl mb-1">{primary?.serviceName ?? '—'}</div>
                  <div className="text-sm text-ink/60 mb-4">{city?.name} · {o.fulfillmentMethod}</div>
                  <ProgressBar percent={pct} />
                  <div className="flex justify-between mt-2 text-[10px] uppercase tracking-widest text-ink/40">
                    <span>{pct}% complete</span>
                    <span>${o.total}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-end justify-between mb-5">
          <h2 className="h-display text-3xl">All orders</h2>
          <Link href="/customer/orders" className="btn-ghost text-xs">View all →</Link>
        </div>
        <OrdersTable orders={orders.slice(0, 8)} hrefBase="/customer/orders" lookups={lookups} emptyLabel="You haven't booked yet." />
      </section>
    </DashboardShell>
  );
}
