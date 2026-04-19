// ==========================================================================
// PRICING ENGINE — all db reads are async now.
// Returns a deterministic quote.
// ==========================================================================

import { db } from '@/lib/db';
import type { FulfillmentMethod, ShoeCategory } from '@/types';

export interface QuoteInput {
  cityId: string;
  primaryServiceId: string;
  addOnServiceIds: string[];
  fulfillmentMethod: FulfillmentMethod;
  shoeCategory: ShoeCategory;
  pairCount: number;
  isRush: boolean;
  couponCode?: string;
}

export interface QuoteLine {
  label: string;
  amount: number;
  kind: 'service' | 'addon' | 'fee' | 'discount';
}

export interface Quote {
  cityId: string;
  lines: QuoteLine[];
  subtotal: number;
  pickupFee: number;
  rushFee: number;
  returnShippingFee: number;
  discount: number;
  total: number;
  items: Array<{
    serviceId: string;
    serviceName: string;
    unitPrice: number;
    isAddOn: boolean;
  }>;
  errors: string[];
}

/** Resolve the price a city charges for a service (override or base). */
export async function resolveServicePrice(cityId: string, serviceId: string): Promise<number> {
  const svc = await db.services.byId(serviceId);
  if (!svc) return 0;
  const override = await db.cityPricing.find(cityId, serviceId);
  return override?.overridePrice ?? svc.basePrice;
}

export async function isRushEligible(cityId: string, serviceId: string): Promise<boolean> {
  const svc = await db.services.byId(serviceId);
  if (!svc) return false;
  const override = await db.cityPricing.find(cityId, serviceId);
  return override ? override.rushEligible : svc.rushEligible;
}

export async function quote(input: QuoteInput): Promise<Quote> {
  const errors: string[] = [];
  const city = await db.cities.byId(input.cityId);
  if (!city || !city.active) errors.push('Shoe Glitch is not live in this city yet.');

  const pairs = Math.max(1, input.pairCount || 1);
  const lines: QuoteLine[] = [];
  const items: Quote['items'] = [];

  const primary = await db.services.byId(input.primaryServiceId);
  if (!primary) errors.push('Service not found.');

  const primaryPrice = primary ? await resolveServicePrice(input.cityId, primary.id) : 0;
  if (primary) {
    const sub = primaryPrice * pairs;
    lines.push({
      label: `${primary.name}${pairs > 1 ? ` × ${pairs}` : ''}`,
      amount: sub,
      kind: 'service',
    });
    items.push({
      serviceId: primary.id,
      serviceName: primary.name,
      unitPrice: primaryPrice,
      isAddOn: false,
    });
  }

  // Fetch add-ons in parallel
  const addOns = await Promise.all(
    input.addOnServiceIds.map(async (id) => {
      const svc = await db.services.byId(id);
      if (!svc || !svc.active) return null;
      const price = await resolveServicePrice(input.cityId, svc.id);
      return { svc, price };
    }),
  );

  let addOnTotal = 0;
  for (const a of addOns) {
    if (!a) continue;
    const sub = a.price * pairs;
    addOnTotal += sub;
    lines.push({
      label: `${a.svc.name}${pairs > 1 ? ` × ${pairs}` : ''}`,
      amount: sub,
      kind: 'addon',
    });
    items.push({
      serviceId: a.svc.id,
      serviceName: a.svc.name,
      unitPrice: a.price,
      isAddOn: true,
    });
  }

  const subtotal = (primary ? primaryPrice * pairs : 0) + addOnTotal;

  let pickupFee = 0;
  let returnShippingFee = 0;
  if (input.fulfillmentMethod === 'pickup' && city) {
    pickupFee = city.defaultPickupFee;
    lines.push({ label: 'Local pickup', amount: pickupFee, kind: 'fee' });
  }
  if (input.fulfillmentMethod === 'mailin' && city) {
    returnShippingFee = city.defaultMailInReturnFee;
    lines.push({ label: 'Return shipping', amount: returnShippingFee, kind: 'fee' });
  }

  let rushFee = 0;
  if (input.isRush && city) {
    const eligible = primary ? await isRushEligible(input.cityId, primary.id) : true;
    if (primary && !eligible) {
      errors.push(`${primary.name} is not eligible for rush service.`);
    } else {
      rushFee = city.defaultRushFee;
      lines.push({ label: 'Rush service', amount: rushFee, kind: 'fee' });
    }
  }

  let discount = 0;
  if (input.couponCode) {
    const coupon = await db.coupons.byCode(input.couponCode);
    if (!coupon || !coupon.active) {
      errors.push('Invalid coupon code.');
    } else if (coupon.cityId && coupon.cityId !== input.cityId) {
      errors.push('This coupon is not valid in your city.');
    } else {
      if (coupon.percentOff) discount = Math.round(subtotal * (coupon.percentOff / 100));
      if (coupon.amountOff) discount = Math.max(discount, coupon.amountOff);
      if (discount > 0) {
        lines.push({ label: `Coupon ${coupon.code}`, amount: -discount, kind: 'discount' });
      }
    }
  }

  const total = Math.max(0, subtotal + pickupFee + rushFee + returnShippingFee - discount);

  return {
    cityId: input.cityId,
    lines,
    subtotal,
    pickupFee,
    rushFee,
    returnShippingFee,
    discount,
    total,
    items,
    errors,
  };
}

export function formatMoney(cents: number): string {
  return `$${cents.toFixed(0)}`;
}
