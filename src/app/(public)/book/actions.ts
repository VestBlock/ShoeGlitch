'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { quote } from '@/lib/pricing';
import { checkCoverage } from '@/lib/coverage';
import { createOrder } from '@/services/orders';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { resolveNationalMailInCityId } from '@/lib/mail-in';
import {
  PICKUP_WINDOW_VALUES,
  attachPickupWindowToNotes,
} from '@/lib/pickup-window';
import { attachShoeProfileToNotes } from '@/lib/shoe-profile';

const BookingSchema = z.object({
  cityId: z.string(),
  serviceAreaId: z.string().optional(),
  fulfillmentMethod: z.enum(['pickup', 'dropoff', 'mailin']),
  shoeCategory: z.enum(['sneakers', 'designer_sneakers', 'womens_heels', 'red_bottom_heels', 'boots', 'kids', 'other']),
  shoeBrand: z.string().optional(),
  customShoeBrand: z.string().optional(),
  shoeModelName: z.string().optional(),
  customShoeType: z.string().optional(),
  pairCount: z.coerce.number().min(1).max(10),
  primaryServiceId: z.string(),
  addOnServiceIds: z.array(z.string()).optional().default([]),
  isRush: z.coerce.boolean().optional().default(false),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  conditionIssues: z.string().optional(),
  pickupWindow: z.enum(PICKUP_WINDOW_VALUES).optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  scheduledPickupAt: z.string().optional(),
});

export async function quoteAction(data: z.input<typeof BookingSchema>) {
  const parsed = BookingSchema.parse(data);
  const cityId =
    parsed.fulfillmentMethod === 'mailin'
      ? await resolveNationalMailInCityId(parsed.cityId)
      : parsed.cityId;
  return quote({
    cityId,
    primaryServiceId: parsed.primaryServiceId,
    addOnServiceIds: parsed.addOnServiceIds ?? [],
    fulfillmentMethod: parsed.fulfillmentMethod,
    shoeCategory: parsed.shoeCategory,
    pairCount: parsed.pairCount,
    isRush: parsed.isRush ?? false,
    couponCode: parsed.couponCode,
  });
}

export async function submitBookingAction(data: z.input<typeof BookingSchema>) {
  const parsed = BookingSchema.parse(data);
  const cityId =
    parsed.fulfillmentMethod === 'mailin'
      ? await resolveNationalMailInCityId(parsed.cityId)
      : parsed.cityId;
  const resolvedBrand =
    parsed.shoeBrand?.toLowerCase() === 'other'
      ? parsed.customShoeBrand?.trim()
      : parsed.shoeBrand?.trim();
  const resolvedShoeTitle = parsed.shoeModelName?.trim() || parsed.customShoeType?.trim();

  const session = await getSession();
  let customerId: string;
  if (session?.role === 'customer') {
    const customer = await db.customers.byUserId(session.userId);
    customerId = customer?.id ?? 'cust_ava';
  } else {
    customerId = 'cust_ava';
  }

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

  const order = await createOrder({
    customerId,
    cityId,
    serviceAreaId: parsed.fulfillmentMethod === 'mailin' ? undefined : parsed.serviceAreaId,
    primaryServiceId: parsed.primaryServiceId,
    addOnServiceIds: parsed.addOnServiceIds ?? [],
    fulfillmentMethod: parsed.fulfillmentMethod,
    shoeCategory: parsed.shoeCategory,
    customShoeType: resolvedShoeTitle,
    pairCount: parsed.pairCount,
    isRush: parsed.isRush ?? false,
    couponCode: parsed.couponCode,
    notes: attachShoeProfileToNotes(
      attachPickupWindowToNotes(
        parsed.notes,
        parsed.fulfillmentMethod === 'pickup' ? parsed.pickupWindow : undefined,
      ),
      { brand: resolvedBrand, title: resolvedShoeTitle },
    ),
    conditionIssues: parsed.conditionIssues,
    pickupAddress,
    scheduledPickupAt: parsed.scheduledPickupAt,
  });

  redirect(`/book/confirmation/${order.id}`);
}

export async function zipLookupAction(zip: string) {
  return checkCoverage(zip);
}
