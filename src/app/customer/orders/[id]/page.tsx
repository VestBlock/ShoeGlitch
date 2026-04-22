import { notFound, redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, ProgressBar } from '@/components/ui';
import { OrderPhotoGallery } from '@/components/OrderPhotoGallery';
import { StatusPill } from '@/components/OrdersTable';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { STATUS_LABELS, progressPercent, flowFor } from '@/lib/status';
import {
  extractPickupWindowFromNotes,
  pickupWindowLabel,
} from '@/lib/pickup-window';
import { formatDate } from '@/lib/utils';

export default async function CustomerOrderDetail({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'customer') redirect('/login');

  const order = await db.orders.byId(params.id);
  if (!order) notFound();

  const customer = await db.customers.byUserId(session.userId);
  if (!customer || order.customerId !== customer.id) {
    return (
      <DashboardShell currentPath="/customer/orders" pageTitle="Order">
        <Card className="p-8">
          <p className="text-ink/70">You don&rsquo;t have access to this order.</p>
        </Card>
      </DashboardShell>
    );
  }

  const [city, events] = await Promise.all([
    db.cities.byId(order.cityId),
    db.orderEvents.forOrder(order.id),
  ]);
  const cleaner = order.cleanerId ? await db.cleaners.byId(order.cleanerId) : null;
  const pct = progressPercent(order.fulfillmentMethod, order.status);
  const flow = flowFor(order.fulfillmentMethod);
  const currentIdx = flow.indexOf(order.status);
  const pickupWindow = pickupWindowLabel(extractPickupWindowFromNotes(order.notes));

  return (
    <DashboardShell currentPath="/customer/orders">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-sm text-ink/50">{order.code}</span>
        <Badge tone="glitch">{order.fulfillmentMethod.toUpperCase()}</Badge>
      </div>
      <h1 className="h-display text-[clamp(2rem,5vw,3.5rem)] leading-none mb-8">
        {STATUS_LABELS[order.status]}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Card className="lg:col-span-2">
          <div className="mb-6">
            <ProgressBar percent={pct} />
            <div className="mt-3 text-xs font-mono text-ink/40">{pct}% complete</div>
          </div>
          <div className="space-y-3">
            {flow.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${i <= currentIdx ? 'bg-glitch' : 'bg-ink/15'}`} />
                <span className={`text-sm ${i <= currentIdx ? 'text-ink font-medium' : 'text-ink/40'}`}>
                  {STATUS_LABELS[s]}
                </span>
                {i === currentIdx && <span className="badge-glitch text-[9px]">Now</span>}
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="font-mono text-xs text-ink/40 mb-1">City</div>
            <div className="h-display text-2xl">{city?.name}</div>
            <div className="text-sm text-ink/60">{city?.state}</div>
          </Card>
          {pickupWindow && (
            <Card>
              <div className="font-mono text-xs text-ink/40 mb-1">Pickup window</div>
              <div className="h-display text-2xl">{pickupWindow}</div>
            </Card>
          )}
          {cleaner && (
            <Card>
              <div className="font-mono text-xs text-ink/40 mb-1">Your cleaner</div>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-10 w-10 rounded-full bg-glitch grid place-items-center text-white text-xs font-bold">
                  {cleaner.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold">{cleaner.name}</div>
                  <div className="text-xs text-ink/50">★ {cleaner.rating}</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <h3 className="h-display text-2xl mb-4">Line items</h3>
        <div className="space-y-2">
          {order.items.map((it, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-ink/5 last:border-0">
              <div>
                <div className="font-medium">{it.serviceName}</div>
                {it.isAddOn && <Badge className="mt-1">Add-on</Badge>}
              </div>
              <div className="font-mono">${it.unitPrice * order.pairCount}</div>
            </div>
          ))}
          <div className="pt-3 border-t border-ink/10 flex justify-between font-bold">
            <span>Total</span><span className="font-mono">${order.total}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 mb-6 lg:grid-cols-2">
        <OrderPhotoGallery
          eyebrow="Intake reference"
          title="Before photos"
          photos={order.beforeImages}
          emptyLabel="No intake photos have been added yet."
        />
        <OrderPhotoGallery
          eyebrow="Finished result"
          title="After photos"
          photos={order.afterImages}
          emptyLabel="Your finished photos will show up here once the team uploads them."
        />
      </div>

      <Card>
        <h3 className="h-display text-2xl mb-4">Timeline</h3>
        <ol className="space-y-4">
          {events.map((e) => (
            <li key={e.id} className="flex gap-4">
              <div className="shrink-0 w-2 h-2 rounded-full bg-ink mt-2" />
              <div>
                <div className="flex items-center gap-2">
                  <StatusPill status={e.status} />
                  <span className="text-xs text-ink/40">{formatDate(e.createdAt)}</span>
                </div>
                {e.note && <p className="text-sm text-ink/60 mt-1">{e.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </DashboardShell>
  );
}
