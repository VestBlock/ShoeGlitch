import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { STATUS_LABELS, progressPercent } from '@/lib/status';
import { Badge, Card, ProgressBar } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default async function ConfirmationPage({ params }: { params: { orderId: string } }) {
  const order = await db.orders.byId(params.orderId);
  if (!order) notFound();

  const city = await db.cities.byId(order.cityId);
  if (!city) notFound();

  const events = await db.orderEvents.forOrder(order.id);
  const pct = progressPercent(order.fulfillmentMethod, order.status);

  return (
    <section className="container-x pt-16 pb-24 max-w-3xl mx-auto">
      <Badge tone="acid" className="mb-4">✓ Order confirmed</Badge>
      <h1 className="h-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] mb-4">
        We&rsquo;ve got it from here.
      </h1>
      <p className="text-ink/70 text-lg mb-10">
        Order <span className="font-mono font-semibold">{order.code}</span> is now in the queue.
        {order.fulfillmentMethod === 'mailin' && ' Shipping instructions are on their way to your email.'}
      </p>

      <Card className="p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="font-mono text-xs text-ink/40 mb-1">Status</div>
            <div className="h-display text-3xl">{STATUS_LABELS[order.status]}</div>
          </div>
          <Badge tone="glitch">{order.fulfillmentMethod.toUpperCase()}</Badge>
        </div>
        <ProgressBar percent={pct} />
        <div className="mt-3 text-xs font-mono text-ink/40">{pct}% complete</div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">City</div>
          <div className="h-display text-2xl">{city.name}, {city.state}</div>
          {city.hubAddress && <div className="text-sm text-ink/60 mt-2">Hub: {city.hubAddress}</div>}
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Total paid</div>
          <div className="h-display text-2xl">${order.total}</div>
          <div className="text-sm text-ink/60 mt-2">{order.items.length} line items</div>
        </Card>
      </div>

      <Card className="p-8 mb-6">
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
        </div>
      </Card>

      {events.length > 0 && (
        <Card className="p-8 mb-6">
          <h3 className="h-display text-2xl mb-4">Timeline</h3>
          <ol className="space-y-4">
            {events.map((e) => (
              <li key={e.id} className="flex gap-4">
                <div className="shrink-0 w-2 h-2 rounded-full bg-ink mt-2" />
                <div>
                  <div className="text-sm font-semibold">{STATUS_LABELS[e.status]}</div>
                  <div className="text-xs text-ink/50">{formatDate(e.createdAt)}{e.note && ` · ${e.note}`}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/customer" className="btn-primary">Go to dashboard →</Link>
        <Link href="/book" className="btn-outline">Book another</Link>
      </div>
    </section>
  );
}
