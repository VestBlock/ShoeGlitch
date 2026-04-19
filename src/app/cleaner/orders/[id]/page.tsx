import { notFound, redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, ProgressBar } from '@/components/ui';
import { StatusPill } from '@/components/OrdersTable';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { STATUS_LABELS, progressPercent, nextAllowedStatuses } from '@/lib/status';
import { formatDate } from '@/lib/utils';
import { updateStatusAction, addAfterPhotoAction, flagIssueAction } from '../../actions';

export default async function CleanerOrderDetail({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'cleaner') redirect('/login');

  const order = await db.orders.byId(params.id);
  if (!order) notFound();

  const cleaner = await db.cleaners.byUserId(session.userId);
  if (!cleaner || order.cleanerId !== cleaner.id) {
    return (
      <DashboardShell currentPath="/cleaner">
        <Card className="p-8">
          <h2 className="h-display text-3xl mb-2">Not your job</h2>
          <p className="text-ink/60">This order isn't assigned to you.</p>
        </Card>
      </DashboardShell>
    );
  }

  const [customer, city, events] = await Promise.all([
    db.customers.byId(order.customerId),
    db.cities.byId(order.cityId),
    db.orderEvents.forOrder(order.id),
  ]);
  const nexts = nextAllowedStatuses(order.fulfillmentMethod, order.status).filter(
    (s) => s !== 'cancelled' && s !== 'awaiting_customer_response',
  );
  const pct = progressPercent(order.fulfillmentMethod, order.status);

  return (
    <DashboardShell currentPath="/cleaner">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-sm text-ink/50">{order.code}</span>
        <Badge tone="glitch">{order.fulfillmentMethod.toUpperCase()}</Badge>
      </div>
      <h1 className="h-display text-[clamp(2rem,5vw,3.5rem)] leading-none mb-8">
        {STATUS_LABELS[order.status]}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="mb-4"><ProgressBar percent={pct} /></div>
            <h2 className="h-display text-2xl mb-4">Advance status</h2>
            <form action={updateStatusAction} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <select name="status" className="input" defaultValue={nexts[0]}>
                {nexts.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <textarea name="note" className="input min-h-[70px]" placeholder="Note (optional)" />
              <button className="btn-glitch w-full">Save update →</button>
            </form>
          </Card>

          <Card>
            <h2 className="h-display text-2xl mb-4">After-photos ({order.afterImages.length})</h2>
            {order.afterImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {order.afterImages.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={url} alt={`After ${i}`} className="rounded-lg aspect-square object-cover" />
                ))}
              </div>
            )}
            <form action={addAfterPhotoAction} className="flex gap-2">
              <input type="hidden" name="orderId" value={order.id} />
              <input name="url" className="input" placeholder="Image URL (blank for demo)" />
              <button className="btn-primary">Upload</button>
            </form>
          </Card>

          <Card>
            <h2 className="h-display text-2xl mb-4">Flag issue</h2>
            <form action={flagIssueAction} className="flex gap-2">
              <input type="hidden" name="orderId" value={order.id} />
              <input name="note" className="input" placeholder="Describe the problem" required />
              <button className="btn-outline shrink-0">Flag</button>
            </form>
          </Card>

          <Card>
            <h2 className="h-display text-2xl mb-4">Timeline</h2>
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
        </div>

        <div className="space-y-5">
          <Card>
            <div className="font-mono text-xs text-ink/40 mb-1">Customer</div>
            <div className="h-display text-2xl mb-1">{customer?.name}</div>
            <div className="text-sm text-ink/60">{customer?.phone}</div>
            <div className="text-sm text-ink/60">{customer?.email}</div>
          </Card>

          {order.pickupAddress && (
            <Card>
              <div className="font-mono text-xs text-ink/40 mb-1">Pickup address</div>
              <div className="text-sm">{order.pickupAddress.line1}</div>
              <div className="text-sm">{order.pickupAddress.city}, {order.pickupAddress.state} {order.pickupAddress.zip}</div>
            </Card>
          )}

          <Card>
            <div className="font-mono text-xs text-ink/40 mb-2">Service</div>
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between py-1 text-sm border-b border-ink/5 last:border-0">
                <span>{it.serviceName}{it.isAddOn && ' (add-on)'}</span>
                <span className="font-mono">${it.unitPrice}</span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-ink/10 text-xs">
              <div className="flex justify-between"><span className="text-ink/50">City</span><span>{city?.name}</span></div>
            </div>
          </Card>

          {order.conditionIssues && (
            <Card>
              <div className="font-mono text-xs text-ink/40 mb-1">Condition issues</div>
              <p className="text-sm">{order.conditionIssues}</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
