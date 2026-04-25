import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { OrdersTable, buildLookups } from '@/components/OrdersTable';
import SneakerFeedClient from '@/components/intelligence/SneakerFeedClient';
import { Badge, Card, ProgressBar } from '@/components/ui';
import { getSneakerFeed } from '@/features/intelligence/service';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { getWatchlistDashboard } from '@/features/intelligence/watchlist/service';
import {
  extractPickupWindowFromNotes,
  pickupWindowLabel,
} from '@/lib/pickup-window';
import { extractShoeProfileFromNotes, formatShoeProfile } from '@/lib/shoe-profile';
import { progressPercent, STATUS_LABELS } from '@/lib/status';
import { formatDate } from '@/lib/utils';

function nextCustomerStep(order: Awaited<ReturnType<typeof db.orders.byCustomer>>[number] | undefined) {
  if (!order) {
    return {
      eyebrow: 'Fresh start',
      title: 'Book your next pair.',
      detail: 'Start a new order, upload intake photos, and we will guide the pair through the same tracked workflow.',
      href: '/book',
      label: 'Book a clean →',
    };
  }

  switch (order.status) {
    case 'awaiting_pickup':
    case 'pickup_assigned':
      return {
        eyebrow: 'Next move',
        title: 'Your pickup is getting lined up.',
        detail: 'Keep an eye on the order timeline. The next meaningful update should be pickup confirmation or an operator-on-the-way notice.',
        href: `/customer/orders/${order.id}`,
        label: 'Track pickup →',
      };
    case 'received_at_hub':
    case 'in_cleaning':
    case 'in_restoration':
    case 'quality_check':
      return {
        eyebrow: 'Next move',
        title: 'Your pair is in the care phase.',
        detail: 'The next update should land when the team advances the service or publishes finished photos.',
        href: `/customer/orders/${order.id}`,
        label: 'Open timeline →',
      };
    case 'ready_for_return':
    case 'ready_for_pickup':
    case 'out_for_delivery':
    case 'shipped_back':
      return {
        eyebrow: 'Next move',
        title: 'Return is the next milestone.',
        detail: 'This order is in the handoff phase now. Check the order detail for the latest delivery or pickup status.',
        href: `/customer/orders/${order.id}`,
        label: 'View return status →',
      };
    default:
      return {
        eyebrow: 'Next move',
        title: 'Stay close to the order timeline.',
        detail: 'This order already has enough motion that the detail page is the best place to catch the next update.',
        href: `/customer/orders/${order.id}`,
        label: 'View order →',
      };
  }
}

export default async function CustomerDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'customer') redirect('/login');

  const customer = await db.customers.byUserId(session.userId);
  if (!customer) redirect('/login');

  const orders = await db.orders.byCustomer(customer.id);
  const [cities, customers, intelligenceFeed] = await Promise.all([
    db.cities.all(),
    Promise.resolve([customer]),
    getSneakerFeed().catch(() => null),
  ]);
  const watchlist = await getWatchlistDashboard(session.userId).catch(() => null);
  const lookups = buildLookups(cities, customers);

  const active = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const completed = orders.filter((o) => o.status === 'completed');
  const lifetime = orders.reduce((sum, o) => sum + o.total, 0);
  const latestOrder = orders[0];
  const nextAction = nextCustomerStep(active[0] ?? latestOrder);
  const rebookSource = completed[0] ?? latestOrder;
  const rebookPrimary = rebookSource?.items.find((item) => !item.isAddOn);
  const rebookShoe = rebookSource
    ? formatShoeProfile({
        brand: extractShoeProfileFromNotes(rebookSource.notes).brand,
        title: extractShoeProfileFromNotes(rebookSource.notes).title ?? rebookSource.customShoeType,
      })
    : null;
  const watchCount = watchlist?.items.length ?? 0;
  const alertHits = watchlist?.history.filter((item) => item.delivery.status === 'sent').length ?? 0;
  const recentAlerts = watchlist?.history.slice(0, 3) ?? [];

  return (
    <DashboardShell currentPath="/customer" pageTitle={`Hey, ${session.name.split(' ')[0]}.`}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Active orders</div>
          <div className="h-display text-5xl">{active.length}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Lifetime spend</div>
          <div className="h-display text-5xl">${lifetime}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Watched pairs</div>
          <div className="h-display text-5xl">{watchCount}</div>
        </Card>
        <Card className="card-ink">
          <div className="font-mono text-xs text-bone/40 mb-1">Alert hits</div>
          <div className="h-display text-5xl text-bone">{alertHits}</div>
        </Card>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5 mb-10">
        <Card className="card-lift">
          <div className="font-mono text-xs uppercase tracking-widest text-glitch mb-2">{nextAction.eyebrow}</div>
          <h2 className="h-display text-3xl mb-3">{nextAction.title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-ink/64">{nextAction.detail}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={nextAction.href} className="btn-glitch">{nextAction.label}</Link>
            <Link href="/book" className="btn-outline">Start another order</Link>
          </div>
        </Card>

        <Card className="card-lift">
          <div className="font-mono text-xs uppercase tracking-widest text-ink/42 mb-2">Rebook faster</div>
          <h2 className="h-display text-3xl mb-3">
            {rebookPrimary ? `Run back ${rebookPrimary.serviceName}.` : 'Got another pair?'}
          </h2>
          <p className="text-sm leading-6 text-ink/64">
            {rebookSource
              ? `Your most recent completed setup${rebookShoe ? ` was for ${rebookShoe}` : ''}. Jump back in with a new order when the next pair is ready.`
              : 'Book a clean, add photos, and let the dashboard do the tracking from there.'}
          </p>
          {rebookSource ? (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/50">
              {rebookPrimary ? <Badge>{rebookPrimary.serviceName}</Badge> : null}
              {rebookShoe ? <Badge tone="acid">{rebookShoe}</Badge> : null}
              <Badge>{STATUS_LABELS[rebookSource.status]}</Badge>
            </div>
          ) : null}
          <div className="mt-5">
            <Link href="/book" className="btn-primary">Book the next pair →</Link>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-5 mb-10">
        <Card className="card-lift">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-glitch mb-2">Intelligence</div>
              <h2 className="h-display text-3xl">Keep a market eye on your pairs.</h2>
            </div>
            <Badge tone="acid">{watchCount} active watches</Badge>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/64">
            Your watchlist and the intelligence feed work better together: save the pairs you care about, catch release or restock movement, then jump back into booking when something is worth cleaning or restoring.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/customer/watchlist" className="btn-glitch">Open watchlist →</Link>
            <Link href="/intelligence" className="btn-outline">Browse intelligence feed</Link>
          </div>
        </Card>

        <Card className="card-lift">
          <div className="font-mono text-xs uppercase tracking-widest text-ink/42 mb-2">Recent alert history</div>
          <div className="space-y-3">
            {recentAlerts.length > 0 ? recentAlerts.map((alert) => (
              <div key={alert.delivery.id} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-ink">{alert.event.name}</div>
                  <Badge tone={alert.delivery.status === 'sent' ? 'acid' : 'default'}>
                    {alert.event.eventType.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-ink/60">
                  {alert.watchlistItem.brand} · {alert.watchlistItem.model}
                </div>
                <div className="mt-2 text-xs text-ink/46">
                  {formatDate(alert.event.eventDate)}
                </div>
              </div>
            )) : (
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm leading-6 text-ink/60">
                No alert history yet. Save a pair in your watchlist or add one from the intelligence feed to start catching release, restock, and price-drop signals.
              </div>
            )}
          </div>
        </Card>
      </section>

      {intelligenceFeed ? (
        <section className="mb-10">
          <Card className="card-lift overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-ink/8 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-glitch mb-2">Live intelligence feed</div>
                <h2 className="h-display text-3xl">Save pairs without leaving your dashboard.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/64">
                  Browse current release candidates, add any pair to your watchlist with one click, and jump into booking later if something becomes worth cleaning or restoring.
                </p>
              </div>
              <Link href="/intelligence" className="btn-outline">Open full intelligence feed →</Link>
            </div>

            <div className="mt-6">
              <SneakerFeedClient
                feed={{
                  ...intelligenceFeed,
                  items: intelligenceFeed.items.slice(0, 4),
                }}
              />
            </div>
          </Card>
        </section>
      ) : null}

      {active.length > 0 && (
        <section className="mb-10">
          <h2 className="h-display text-3xl mb-5">In progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {active.map((o) => {
              const city = lookups.cities.get(o.cityId);
              const primary = o.items.find((i) => !i.isAddOn);
              const pct = progressPercent(o.fulfillmentMethod, o.status);
              const pickupWindow = pickupWindowLabel(extractPickupWindowFromNotes(o.notes));
              return (
                <Link key={o.id} href={`/customer/orders/${o.id}`} className="card p-6 card-lift">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-xs text-ink/40">{o.code}</span>
                    <Badge tone="glitch">{STATUS_LABELS[o.status]}</Badge>
                  </div>
                  <div className="h-display text-2xl mb-1">{primary?.serviceName ?? '—'}</div>
                  <div className="text-sm text-ink/60 mb-4">{city?.name} · {o.fulfillmentMethod}</div>
                  {pickupWindow ? (
                    <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink/45">
                      Pickup window · {pickupWindow}
                    </div>
                  ) : null}
                  <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink/45">
                    {o.beforeImages.length} intake photo{o.beforeImages.length === 1 ? '' : 's'} · {o.afterImages.length} finish photo{o.afterImages.length === 1 ? '' : 's'}
                  </div>
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
