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
    return NextResponse.json({ error: `Handler error: ${err.message}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
