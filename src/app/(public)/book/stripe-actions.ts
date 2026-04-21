'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { quote } from '@/lib/pricing';
import { createOrder } from '@/services/orders';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import type { Order } from '@/types';

const BookingSchema = z.object({
  cityId: z.string(),
  serviceAreaId: z.string().optional(),
  fulfillmentMethod: z.enum(['pickup', 'dropoff', 'mailin']),
  shoeCategory: z.enum([
    'sneakers', 'designer_sneakers', 'womens_heels',
    'red_bottom_heels', 'boots', 'kids', 'other',
  ]),
  customShoeType: z.string().optional(),
  pairCount: z.coerce.number().min(1).max(10),
  primaryServiceId: z.string(),
  addOnServiceIds: z.array(z.string()).optional().default([]),
  isRush: z.coerce.boolean().optional().default(false),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  conditionIssues: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  scheduledPickupAt: z.string().optional(),
});

/**
 * Creates an order in "unpaid" state, then creates a Stripe Checkout Session
 * and redirects the user to Stripe's hosted payment page.
 * After payment, Stripe redirects them to /book/success?order={orderId}.
 * The webhook /api/stripe/webhook confirms payment and marks the order paid.
 */
export async function startStripeCheckoutAction(data: z.input<typeof BookingSchema>) {
  const parsed = BookingSchema.parse(data);

  // Resolve customerId — must be a signed-in customer.
  // In production (no demo fallback): a customer row must exist for this user.
  const session = await getSession();
  if (!session) {
    redirect('/login?redirect=/book');
  }
  if (session.role !== 'customer') {
    throw new Error('Only customer accounts can book. Sign in with a customer account.');
  }
  const customer = await db.customers.byUserId(session.userId);
  if (!customer) {
    throw new Error('Customer profile not found. Please contact support at shoeglitch@gmail.com.');
  }
  const customerId = customer.id;

  const pickupAddress =
    parsed.fulfillmentMethod === 'pickup' && parsed.addressLine1
      ? {
          line1: parsed.addressLine1,
          line2: parsed.addressLine2,
          city: parsed.addressCity ?? '',
          state: parsed.addressState ?? '',
          zip: parsed.addressZip ?? '',
        }
      : undefined;

  // 1. Create the order in "unpaid" state
  const order: Order = await createOrder({
    customerId,
    cityId: parsed.cityId,
    serviceAreaId: parsed.serviceAreaId,
    primaryServiceId: parsed.primaryServiceId,
    addOnServiceIds: parsed.addOnServiceIds ?? [],
    fulfillmentMethod: parsed.fulfillmentMethod,
    shoeCategory: parsed.shoeCategory,
    customShoeType: parsed.customShoeType,
    pairCount: parsed.pairCount,
    isRush: parsed.isRush ?? false,
    couponCode: parsed.couponCode,
    notes: parsed.notes,
    conditionIssues: parsed.conditionIssues,
    pickupAddress,
    scheduledPickupAt: parsed.scheduledPickupAt,
  });

  // 2. Build Stripe line items from the order
  const lineItems = order.items.map((it) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: it.serviceName + (it.isAddOn ? ' (add-on)' : ''),
      },
      unit_amount: Math.round(it.unitPrice * 100), // Stripe expects cents
    },
    quantity: order.pairCount,
  }));

  // Extra line items for fees (if any)
  if (order.pickupFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Local pickup fee' },
        unit_amount: Math.round(order.pickupFee * 100),
      },
      quantity: 1,
    });
  }
  if (order.rushFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Rush service' },
        unit_amount: Math.round(order.rushFee * 100),
      },
      quantity: 1,
    });
  }
  if (order.returnShippingFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Return shipping' },
        unit_amount: Math.round(order.returnShippingFee * 100),
      },
      quantity: 1,
    });
  }

  // 3. Create the Stripe Checkout Session
  // Derive origin from request headers, NOT env var — env var may be missing
  // or wrong in production, causing Stripe to fall back to the homepage.
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'shoeglitch.com';
  const proto = h.get('x-forwarded-proto') || 'https';
  const origin = `${proto}://${host}`;
  const stripe = getStripe();
  const stripeSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    // Apply discount as a negative line item is not allowed;
    // use Stripe Coupon or metadata instead. For MVP, discount is already
    // baked into the lineItems by reducing quantities/prices at quote time,
    // but we show it at order-level via metadata.
    metadata: {
      orderId: order.id,
      orderCode: order.code,
      customerId: order.customerId,
      cityId: order.cityId,
      couponCode: order.couponCode ?? '',
      discount: String(order.discount),
    },
    success_url: `${origin}/book/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/book/cancelled?order=${order.id}`,
    customer_email: undefined, // let Stripe collect email on its page
  });

  if (!stripeSession.url) {
    throw new Error('Stripe session creation failed');
  }

  // 4. Redirect to Stripe's hosted checkout page
  redirect(stripeSession.url);
}
