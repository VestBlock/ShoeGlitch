import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge, Card } from '@/components/ui';

/**
 * Stripe redirects here after a successful payment.
 * We show a polished "you're set" message and link to the order detail.
 *
 * Note: the webhook already marks the order paid — this page is just UX.
 * If the webhook is delayed (rare), the customer still sees confirmation.
 */
export default async function BookSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; session_id?: string };
}) {
  const orderId = searchParams.order;
  if (!orderId) redirect('/');

  const order = await db.orders.byId(orderId);
  if (!order) redirect('/');

  return (
    <section className="container-x pt-16 pb-24 max-w-2xl mx-auto text-center">
      <Badge tone="acid" className="mb-6">✓ Payment received</Badge>
      <h1 className="h-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] mb-4">
        You're all set.
      </h1>
      <p className="text-ink/70 text-lg mb-10">
        Order <span className="font-mono font-semibold">{order.code}</span> is
        confirmed. We'll email you with the next steps.
      </p>

      <Card className="p-8 text-left mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-xs text-ink/40 mb-1">Total charged</div>
            <div className="h-display text-3xl">${order.total}</div>
          </div>
          <Badge tone="glitch">{order.fulfillmentMethod.toUpperCase()}</Badge>
        </div>
        <div className="pt-4 border-t border-ink/10 space-y-2 text-sm">
          {order.items.map((it, i) => (
            <div key={i} className="flex justify-between">
              <span>
                {it.serviceName}
                {it.isAddOn && <span className="text-ink/40"> · add-on</span>}
              </span>
              <span className="font-mono">
                ${it.unitPrice * order.pairCount}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-center gap-3 flex-wrap">
        <Link href={`/book/confirmation/${order.id}`} className="btn-glitch">
          View order →
        </Link>
        <Link href="/customer" className="btn-outline">
          My dashboard
        </Link>
      </div>
    </section>
  );
}
