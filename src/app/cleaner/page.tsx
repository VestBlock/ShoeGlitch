import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { OrdersTable, buildLookups } from '@/components/OrdersTable';
import OperatorTrainingModule from '@/components/OperatorTrainingModule';
import { Badge, Card, StatusDot } from '@/components/ui';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import {
  extractPickupWindowFromNotes,
  pickupWindowLabel,
} from '@/lib/pickup-window';
import { STATUS_LABELS } from '@/lib/status';
import { formatDate } from '@/lib/utils';

function money(value: number) {
  return `$${value.toFixed(0)}`;
}

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
  const routeWork = active.filter((o) =>
    ['awaiting_pickup', 'pickup_assigned', 'ready_for_return', 'out_for_delivery', 'ready_for_pickup'].includes(o.status),
  );
  const payoutRate = Number(cleaner.payoutRate ?? 0.62);
  const pipelineValue = active.reduce((sum, order) => sum + order.total * payoutRate, 0);
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const completedThisWeek = done
    .filter((order) => new Date(order.completedAt ?? order.updatedAt).getTime() >= weekAgo)
    .reduce((sum, order) => sum + order.total * payoutRate, 0);
  const completedThisMonth = done
    .filter((order) => new Date(order.completedAt ?? order.updatedAt).getTime() >= monthAgo)
    .reduce((sum, order) => sum + order.total * payoutRate, 0);
  const topServices = Array.from(
    orders
      .flatMap((order) => order.items.filter((item) => !item.isAddOn).map((item) => item.serviceName))
      .reduce((map, serviceName) => {
        map.set(serviceName, (map.get(serviceName) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
      .entries(),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3);

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

      <section className="grid grid-cols-1 xl:grid-cols-[1.08fr_0.92fr] gap-5 mb-10">
        <Card className="card-lift">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-glitch mb-2">Today&apos;s work</div>
              <h2 className="h-display text-3xl">Route, returns, and jobs that move today.</h2>
            </div>
            <Badge tone="acid">{routeWork.length} stops in motion</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {routeWork.length > 0 ? routeWork.slice(0, 5).map((order) => {
              const customer = lookups.customers.get(order.customerId);
              const primary = order.items.find((item) => !item.isAddOn);
              const pickupWindow = pickupWindowLabel(extractPickupWindowFromNotes(order.notes));
              const address = order.pickupAddress
                ? `${order.pickupAddress.city}, ${order.pickupAddress.state}`
                : null;

              return (
                <Link
                  key={order.id}
                  href={`/cleaner/orders/${order.id}`}
                  className="block rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 transition hover:border-glitch/30 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">{customer?.name ?? order.code}</div>
                      <div className="mt-1 text-sm text-ink/60">
                        {primary?.serviceName ?? 'Service in progress'} · {STATUS_LABELS[order.status]}
                      </div>
                    </div>
                    <div className="text-right text-xs text-ink/45">
                      <div>{order.code}</div>
                      <div className="mt-1">{formatDate(order.createdAt)}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/48">
                    {pickupWindow ? <Badge>{pickupWindow}</Badge> : null}
                    {address ? <Badge tone="acid">{address}</Badge> : null}
                    <Badge>{money(order.total * payoutRate)} est. payout</Badge>
                  </div>
                </Link>
              );
            }) : (
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm leading-6 text-ink/60">
                No pickup or return route items are active right now. Keep an eye on the jobs needing action below for hub work and service updates.
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="card-lift">
            <div className="font-mono text-xs uppercase tracking-widest text-ink/42 mb-2">Earnings pipeline</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                <div className="text-xs text-ink/45">In flight</div>
                <div className="h-display mt-2 text-3xl">{money(pipelineValue)}</div>
              </div>
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                <div className="text-xs text-ink/45">This week</div>
                <div className="h-display mt-2 text-3xl">{money(completedThisWeek)}</div>
              </div>
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                <div className="text-xs text-ink/45">This month</div>
                <div className="h-display mt-2 text-3xl">{money(completedThisMonth)}</div>
              </div>
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                <div className="text-xs text-ink/45">Average job</div>
                <div className="h-display mt-2 text-3xl">
                  {orders.length > 0 ? money(orders.reduce((sum, order) => sum + order.total, 0) / orders.length) : '$0'}
                </div>
              </div>
            </div>
          </Card>

          <Card className="card-lift">
            <div className="font-mono text-xs uppercase tracking-widest text-ink/42 mb-2">Territory snapshot</div>
            <div className="space-y-3 text-sm leading-6 text-ink/62">
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                {city.name} · {cleaner.serviceAreaIds.length} active zone{cleaner.serviceAreaIds.length === 1 ? '' : 's'}
              </div>
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                Specializations: {cleaner.specializations.length > 0 ? cleaner.specializations.join(', ') : 'General care'}
              </div>
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                Top services: {topServices.length > 0 ? topServices.map(([name, count]) => `${name} (${count})`).join(' · ') : 'No service history yet'}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="h-display text-3xl mb-5">Jobs needing you</h2>
        {needsAction.length === 0 ? (
          <Card className="p-8 text-center text-ink/50">You&rsquo;re all caught up. 👟</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {needsAction.map((o) => {
              const customer = lookups.customers.get(o.customerId);
              const primary = o.items.find((i) => !i.isAddOn);
              const pickupWindow = pickupWindowLabel(extractPickupWindowFromNotes(o.notes));
              return (
                <Link key={o.id} href={`/cleaner/orders/${o.id}`} className="card p-6 card-lift">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-xs text-ink/40">{o.code}</span>
                    <Badge tone="glitch">{o.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="h-display text-2xl mb-1">{primary?.serviceName}</div>
                  <div className="text-sm text-ink/60 mb-4">{customer?.name} · {o.fulfillmentMethod}</div>
                  {pickupWindow ? (
                    <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink/45">
                      Pickup window · {pickupWindow}
                    </div>
                  ) : null}
                  <div className="text-[11px] uppercase tracking-[0.22em] text-ink/45">
                    {o.beforeImages.length} intake · {o.afterImages.length} finish
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-10">
        <OperatorTrainingModule title="Training library for real pair work" />
      </section>

      <section>
        <h2 className="h-display text-3xl mb-5">All your orders</h2>
        <OrdersTable orders={orders} hrefBase="/cleaner/orders" lookups={lookups} emptyLabel="No jobs assigned yet." />
      </section>
    </DashboardShell>
  );
}
