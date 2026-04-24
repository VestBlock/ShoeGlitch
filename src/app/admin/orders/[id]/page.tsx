import { notFound, redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, ProgressBar } from '@/components/ui';
import { ImageUpload } from '@/components/ImageUpload';
import { OrderPhotoGallery } from '@/components/OrderPhotoGallery';
import { StatusPill } from '@/components/OrdersTable';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { STATUS_LABELS, progressPercent, nextAllowedStatuses } from '@/lib/status';
import {
  extractPickupWindowFromNotes,
  pickupWindowLabel,
  stripPickupWindowFromNotes,
} from '@/lib/pickup-window';
import {
  extractShoeProfileFromNotes,
  formatShoeProfile,
  stripShoeProfileFromNotes,
} from '@/lib/shoe-profile';
import { formatDate } from '@/lib/utils';
import { updateStatusAction, flagIssueAction } from '@/app/cleaner/actions';
import { assignCleanerAction } from '@/app/city-manager/actions';
import { suggestCleaners, requiredSpecializations } from '@/lib/assignment';

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const order = await db.orders.byId(params.id);
  if (!order) notFound();

  const [customer, city, events] = await Promise.all([
    db.customers.byId(order.customerId),
    db.cities.byId(order.cityId),
    db.orderEvents.forOrder(order.id),
  ]);
  const cleaner = order.cleanerId ? await db.cleaners.byId(order.cleanerId) : null;
  const nexts = nextAllowedStatuses(order.fulfillmentMethod, order.status);

  let suggestions: Awaited<ReturnType<typeof suggestCleaners>> = [];
  if (!cleaner) {
    const specs = await requiredSpecializations(order);
    suggestions = await suggestCleaners({
      cityId: order.cityId,
      serviceAreaId: order.serviceAreaId,
      requiredSpecializations: specs,
    });
  }

  const pct = progressPercent(order.fulfillmentMethod, order.status);
  const pickupWindow = pickupWindowLabel(extractPickupWindowFromNotes(order.notes));
  const shoeProfile = extractShoeProfileFromNotes(order.notes);
  const shoeSummary = formatShoeProfile({
    brand: shoeProfile.brand,
    title: shoeProfile.title ?? order.customShoeType,
  });
  const customerNotes = stripShoeProfileFromNotes(stripPickupWindowFromNotes(order.notes));

  return (
    <DashboardShell currentPath="/admin/orders">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-sm text-ink/50">{order.code}</span>
        <Badge tone="glitch">{order.fulfillmentMethod.toUpperCase()}</Badge>
        <Badge>{city?.name}</Badge>
      </div>
      <h1 className="h-display text-[clamp(2rem,5vw,3.5rem)] leading-none mb-8">{STATUS_LABELS[order.status]}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <ProgressBar percent={pct} />
            <div className="mt-3 text-xs font-mono text-ink/40">{pct}% complete</div>
          </Card>

          <Card>
            <h2 className="h-display text-2xl mb-4">Force status change</h2>
            <form action={updateStatusAction} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <select name="status" className="input">
                {nexts.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <input name="note" className="input" placeholder="Admin note" />
              <button className="btn-primary w-full">Save</button>
            </form>
          </Card>

          {!cleaner && suggestions.length > 0 && (
            <Card>
              <h2 className="h-display text-2xl mb-4">Assign cleaner</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map(({ cleaner: c, score, reasons }) => (
                  <form key={c.id} action={assignCleanerAction} className="p-3 rounded-lg border border-ink/10">
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="cleanerId" value={c.id} />
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{c.name}</span>
                      <span className="font-mono text-xs text-glitch">{score}</span>
                    </div>
                    <div className="text-xs text-ink/50 mb-2">★ {c.rating} · {c.activeJobCount} active</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {reasons.map(r => <span key={r} className="text-[10px] px-1.5 py-0.5 bg-bone-soft rounded">{r}</span>)}
                    </div>
                    <button className="btn-primary w-full py-2 text-xs">Assign →</button>
                  </form>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h2 className="h-display text-2xl mb-4">Flag issue</h2>
            <form action={flagIssueAction} className="flex gap-2">
              <input type="hidden" name="orderId" value={order.id} />
              <input name="note" className="input" placeholder="Describe the problem" required />
              <button className="btn-outline shrink-0">Flag</button>
            </form>
          </Card>

          <Card>
            <h2 className="h-display text-2xl mb-4">Order photo coverage</h2>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <OrderPhotoGallery
                eyebrow="Customer intake"
                title="Before photos"
                photos={order.beforeImages}
                emptyLabel="No intake photos attached yet."
              />
              <div className="space-y-5">
                <OrderPhotoGallery
                  eyebrow="Delivered back"
                  title="After photos"
                  photos={order.afterImages}
                  emptyLabel="No cleaned-shoe photos have been uploaded yet."
                />
                <div className="rounded-3xl border border-ink/10 bg-bone-soft p-5">
                  <div className="font-mono text-xs text-ink/40 mb-2">Admin upload</div>
                  <ImageUpload
                    orderId={order.id}
                    phase="after"
                    buttonLabel="Select finished photos"
                    uploadLabel="Add after photos"
                    helperText="Use this if you or the operator need to publish the cleaned result from HQ."
                  />
                </div>
              </div>
            </div>
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
                      <span className="text-xs text-ink/40">{formatDate(e.createdAt)} · {e.actorRole}</span>
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
            <div className="h-display text-xl">{customer?.name}</div>
            <div className="text-sm text-ink/60">{customer?.email}</div>
            <div className="text-sm text-ink/60">{customer?.phone}</div>
          </Card>

          <Card>
            <div className="font-mono text-xs text-ink/40 mb-1">Cleaner</div>
            {cleaner ? (
              <>
                <div className="h-display text-xl">{cleaner.name}</div>
                <div className="text-sm text-ink/60">★ {cleaner.rating} · {cleaner.activeJobCount} active</div>
              </>
            ) : (
              <div className="text-sm text-glitch">Unassigned</div>
            )}
          </Card>

          {pickupWindow && (
            <Card>
              <div className="font-mono text-xs text-ink/40 mb-1">Pickup window</div>
              <div className="h-display text-xl">{pickupWindow}</div>
            </Card>
          )}
          {shoeSummary && (
            <Card>
              <div className="font-mono text-xs text-ink/40 mb-1">Shoe submitted</div>
              <div className="h-display text-xl">{shoeSummary}</div>
            </Card>
          )}
          {order.fulfillmentMethod === 'mailin' && (
            <Card>
              <div className="font-mono text-xs text-ink/40 mb-1">Mail-in label</div>
              {order.mailInLabelUrl ? (
                <>
                  <div className="text-sm text-ink/60">
                    {order.mailInCarrier ?? 'Carrier pending'}
                    {order.mailInServiceLevel ? ` · ${order.mailInServiceLevel}` : ''}
                  </div>
                  {order.mailInTrackingNumber ? (
                    <div className="font-mono text-xs text-ink/50 mt-1">{order.mailInTrackingNumber}</div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={order.mailInLabelUrl} target="_blank" rel="noreferrer" className="btn-primary">
                      Open label →
                    </a>
                    {order.mailInTrackingUrl ? (
                      <a href={order.mailInTrackingUrl} target="_blank" rel="noreferrer" className="btn-outline">
                        Track parcel
                      </a>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="text-sm text-ink/60">No prepaid mail-in label has been generated yet.</div>
              )}
            </Card>
          )}

          <Card>
            <div className="font-mono text-xs text-ink/40 mb-1">Breakdown</div>
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between py-1 text-sm border-b border-ink/5 last:border-0">
                <span>{it.serviceName}</span>
                <span className="font-mono">${it.unitPrice * order.pairCount}</span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-ink/10 flex justify-between font-bold">
              <span>Total</span><span className="font-mono">${order.total}</span>
            </div>
          </Card>
          {customerNotes && (
            <Card>
              <div className="font-mono text-xs text-ink/40 mb-1">Customer notes</div>
              <p className="text-sm">{customerNotes}</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
