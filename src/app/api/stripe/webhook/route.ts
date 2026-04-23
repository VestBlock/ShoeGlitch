// ==========================================================================
// Stripe webhook — listens for payment events and updates order status.
// Configure in Stripe Dashboard → Developers → Webhooks → Add Endpoint
// URL: https://shoeglitch.com/api/stripe/webhook
// Events: checkout.session.completed, checkout.session.expired,
//         payment_intent.payment_failed, charge.refunded
// ==========================================================================

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import {
  sendAbandonedBookingFollowUp,
  sendAdminSystemAlert,
  sendOperatorBookingAlert,
  sendOperatorKitPaymentConfirmation,
  sendOrderConfirmation,
  sendRefundConfirmation,
} from '@/lib/email';
import { recordGrowthEvent } from '@/lib/growth/persistence';
import { appendEvent } from '@/services/orders';
import type { Order } from '@/types';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Check if order payment or kit payment
        const orderId = session.metadata?.orderId;
        const applicationId = session.metadata?.applicationId;
        
        if (orderId) {
          // Order payment flow
          const order = await db.orders.byId(orderId);
          if (!order) {
            console.warn('Webhook: order not found:', orderId);
            break;
          }
          const updated: Order = {
            ...order,
            paymentStatus: 'paid',
            updatedAt: new Date().toISOString(),
          };
          await db.orders.upsert(updated);
          await appendEvent(
            order.id,
            order.status,
            'system',
            undefined,
            `Payment received — Stripe session ${session.id}`,
          );
          await recordGrowthEvent({
            routePath: '/book',
            eventName: 'booking_complete',
            metadata: {
              orderId: order.id,
              cityId: order.cityId,
              total: updated.total,
              fulfillmentMethod: updated.fulfillmentMethod,
            },
          });
          console.log(`Order ${orderId} marked as paid`);

          // Fire order confirmation email
          try {
            const [customer, cities, cleaners] = await Promise.all([
              db.customers.byId(order.customerId),
              db.cities.all(),
              db.cleaners.byCity(order.cityId),
            ]);
            const city = cities.find((c) => c.id === order.cityId) ?? null;
            if (customer) {
              await sendOrderConfirmation({ order: updated, customer, city });
            } else {
              console.warn(`[email] customer ${order.customerId} not found for order ${order.code}`);
            }
            await sendOperatorBookingAlert({ order: updated, city, cleaners });
          } catch (emailErr: any) {
            console.error('[email] order confirmation failed:', emailErr?.message ?? emailErr);
          }
        } else if (applicationId) {
          // Kit payment flow
          const admin = createAdminSupabaseClient();
          const { error } = await admin
            .from('operator_applications')
            .update({
              kitPaymentStatus: 'paid',
              kitPaidAt: new Date().toISOString(),
            })
            .eq('id', applicationId);
          
          if (error) {
            console.error('Failed to update kit payment:', error);
          } else {
            console.log(`Application ${applicationId} kit payment confirmed`);
            try {
              const { data: app } = await admin
                .from('operator_applications')
                .select('id, name, email, cityId, tier')
                .eq('id', applicationId)
                .maybeSingle();

              if (app?.email) {
                const { data: city } = await admin
                  .from('cities')
                  .select('name')
                  .eq('id', app.cityId)
                  .maybeSingle();

                const amountByTier = {
                  starter: 349,
                  pro: 599,
                  luxury: 899,
                } as const;

                await sendOperatorKitPaymentConfirmation({
                  applicationId: app.id,
                  toEmail: app.email,
                  name: app.name,
                  cityName: city?.name ?? 'your city',
                  tier: app.tier,
                  amount: amountByTier[app.tier as keyof typeof amountByTier] ?? 0,
                });
              }
            } catch (emailErr: any) {
              console.error('[email] operator kit payment confirmation failed:', emailErr?.message ?? emailErr);
            }
          }
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const applicationId = session.metadata?.applicationId;
        if (!orderId && applicationId) {
          const admin = createAdminSupabaseClient();
          await admin
            .from('operator_applications')
            .update({ kitPaymentStatus: 'expired' })
            .eq('id', applicationId);
          await sendAdminSystemAlert({
            subject: 'Operator kit checkout expired',
            badge: 'Stripe notice',
            heading: 'An operator kit checkout expired.',
            body: `<p style="font-size:15px;color:#4B5563;margin:0;">Application <strong>${applicationId}</strong> started kit checkout but did not complete payment.</p>`,
            cta: { href: 'https://shoeglitch.com/admin/operators', label: 'Review application →' },
          });
          break;
        }
        if (!orderId) break;
        const order = await db.orders.byId(orderId);
        if (!order || order.paymentStatus === 'paid') break;
        const updated: Order = {
          ...order,
          paymentStatus: 'failed',
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        };
        await db.orders.upsert(updated);
        await appendEvent(order.id, 'cancelled', 'system', undefined, 'Checkout session expired');
        try {
          const customer = await db.customers.byId(order.customerId);
          const serviceName = order.items.find((item) => !item.isAddOn)?.serviceName ?? null;
          if (customer?.email) {
            await sendAbandonedBookingFollowUp({
              toEmail: customer.email,
              name: customer.name,
              orderCode: order.code,
              orderId: order.id,
              serviceName,
            });
          }
        } catch (emailErr: any) {
          console.error('[email] abandoned booking follow-up failed:', emailErr?.message ?? emailErr);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        const applicationId = paymentIntent.metadata?.applicationId;
        await sendAdminSystemAlert({
          subject: 'Stripe payment failed',
          badge: 'Stripe alert',
          heading: 'A Stripe payment failed.',
          body: `
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Payment intent</td><td style="padding:8px 0;text-align:right;font-family:'SF Mono',Menlo,monospace;font-weight:600;">${paymentIntent.id}</td></tr>
              ${orderId ? `<tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Order</td><td style="padding:8px 0;text-align:right;font-family:'SF Mono',Menlo,monospace;font-weight:600;">${orderId}</td></tr>` : ''}
              ${applicationId ? `<tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Application</td><td style="padding:8px 0;text-align:right;font-family:'SF Mono',Menlo,monospace;font-weight:600;">${applicationId}</td></tr>` : ''}
            </table>
          `,
          cta: { href: 'https://dashboard.stripe.com/payments', label: 'Open Stripe →' },
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const orderId = charge.metadata?.orderId;
        if (!orderId) break;
        const order = await db.orders.byId(orderId);
        if (!order) break;
        const updated: Order = {
          ...order,
          paymentStatus: 'refunded',
          updatedAt: new Date().toISOString(),
        };
        await db.orders.upsert(updated);
        const refundAmount = Number((charge.amount_refunded / 100).toFixed(2));
        await appendEvent(
          order.id,
          order.status,
          'system',
          undefined,
          `Refund issued for $${refundAmount.toFixed(2)}`,
        );

        // Fire refund confirmation email (non-blocking).
        try {
          const customer = await db.customers.byId(order.customerId);
          if (customer) {
            await sendRefundConfirmation({ order: updated, customer, refundAmount });
          }
        } catch (emailErr: any) {
          console.error('[email] refund confirmation failed:', emailErr?.message ?? emailErr);
        }

        break;
      }

      default:
        // ignore other events
        break;
    }
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    await sendAdminSystemAlert({
      subject: 'Stripe webhook processing failed',
      badge: 'Webhook error',
      heading: 'A Stripe webhook failed inside Shoe Glitch.',
      body: `<p style="font-size:15px;color:#4B5563;margin:0;">${err?.message ?? 'Unknown webhook handler error'}</p>`,
      cta: { href: 'https://dashboard.stripe.com/webhooks', label: 'Open Stripe webhooks →' },
    });
    return NextResponse.json({ error: `Handler error: ${err.message}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
