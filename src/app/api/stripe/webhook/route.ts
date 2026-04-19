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
import { appendEvent } from '@/services/orders';
import type { Order } from '@/types';

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
        const orderId = session.metadata?.orderId;
        if (!orderId) {
          console.warn('Webhook received checkout.session.completed with no orderId');
          break;
        }
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
        console.log(`Order ${orderId} marked as paid`);
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
        await appendEvent(
          order.id,
          order.status,
          'system',
          undefined,
          `Refund issued for $${(charge.amount_refunded / 100).toFixed(2)}`,
        );
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
