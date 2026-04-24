import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { Badge, Card } from '@/components/ui';
import { PhotoUploadSection } from './PhotoUploadSection';
import type { Order } from '@/types';
import { hasMailInBoxKit, MAIL_IN_BOX_KIT_DELAY, MAIL_IN_BOX_KIT_NAME } from '@/lib/mail-in-config';
import { getSession } from '@/lib/session';

/**
 * Stripe redirects here after a successful payment.
 * We show a polished "you're set" message and link to the order detail.
 *
 * Note: the webhook already marks the order paid — this page is just UX.
 * If the webhook is delayed (rare), the customer still sees confirmation.
 *
 * Uses admin client to bypass RLS — the user just completed checkout,
 * we want them to see their order even if their session cookie hasn't
 * fully propagated yet.
 */
export default async function BookSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; session_id?: string };
}) {
  const orderId = searchParams.order;
  if (!orderId) redirect('/');

  const admin = createAdminSupabaseClient();
  const session = await getSession();
  const { data: order } = await admin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle<Order>();

  if (!order) redirect('/');
  const includesBoxKit = hasMailInBoxKit(order);

  return (
    <section className="container-x pt-16 pb-24 max-w-2xl mx-auto text-center">
      <Badge tone="acid" className="mb-6">✓ Payment received</Badge>
      <h1 className="h-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] mb-4">
        You&rsquo;re all set.
      </h1>
      <p className="text-ink/70 text-lg mb-10">
        Order <span className="font-mono font-semibold">{order.code}</span> is
        confirmed. We&rsquo;ll email you with the next steps.
      </p>
      {order.fulfillmentMethod === 'mailin' && includesBoxKit ? (
        <p className="text-sm text-ink/60 mb-8">
          <strong>{MAIL_IN_BOX_KIT_NAME}</strong> selected. {MAIL_IN_BOX_KIT_DELAY}
        </p>
      ) : null}

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

      {order.fulfillmentMethod === 'mailin' && (
        <Card className="p-8 mb-8 text-left">
          <div className="font-mono text-xs text-ink/40 mb-2">Mail-in shipping</div>
          <div className="text-sm text-ink/70">
            {order.mailInLabelUrl
              ? 'Your prepaid inbound label is ready below and has also been emailed to you.'
              : 'We’re generating your prepaid inbound label now. Check your inbox, then refresh this page if it does not appear immediately.'}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {order.mailInLabelUrl ? (
              <a href={order.mailInLabelUrl} target="_blank" rel="noreferrer" className="btn-glitch">
                Download prepaid label →
              </a>
            ) : null}
            {order.mailInTrackingUrl ? (
              <a href={order.mailInTrackingUrl} target="_blank" rel="noreferrer" className="btn-outline">
                Track parcel
              </a>
            ) : null}
          </div>
        </Card>
      )}

      {session?.role === 'customer' ? <PhotoUploadSection orderId={order.id} /> : null}

      <div className="flex justify-center gap-3 flex-wrap mt-8">
        <Link href={`/book/confirmation/${order.id}`} className="btn-glitch">
          View order →
        </Link>
        {session?.role === 'customer' ? (
          <Link href="/customer" className="btn-outline">
            My dashboard
          </Link>
        ) : null}
      </div>
    </section>
  );
}
