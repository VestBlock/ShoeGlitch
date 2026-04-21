// ==========================================================================
// ORDER SERVICE — async, backed by Supabase db layer
// ==========================================================================

import { db } from '@/lib/db';
import { quote, type QuoteInput } from '@/lib/pricing';
import { flowFor, nextAllowedStatuses } from '@/lib/status';
import { shortId, orderCode } from '@/lib/utils';
import type {
  Order,
  OrderEvent,
  OrderStatus,
  Role,
  Session,
  Address,
  FulfillmentMethod,
  ShoeCategory,
} from '@/types';
import { AuthError, canAccessCity } from '@/lib/rbac';

export interface CreateOrderInput extends QuoteInput {
  customerId: string;
  serviceAreaId?: string;
  customShoeType?: string;
  notes?: string;
  conditionIssues?: string;
  pickupAddress?: Address;
  returnAddress?: Address;
  beforeImages?: string[];
  scheduledPickupAt?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const q = await quote(input);
  if (q.errors.length > 0) throw new Error(q.errors.join(' '));

  const initialStatus: OrderStatus = 'order_confirmed';
  const order: Order = {
    id: shortId('ord'),
    code: orderCode(),
    customerId: input.customerId,
    cityId: input.cityId,
    serviceAreaId: input.serviceAreaId,
    fulfillmentMethod: input.fulfillmentMethod,
    shoeCategory: input.shoeCategory,
    customShoeType: input.customShoeType,
    pairCount: Math.max(1, input.pairCount || 1),
    items: q.items,
    status: initialStatus,
    paymentStatus: 'unpaid',
    notes: input.notes,
    conditionIssues: input.conditionIssues,
    beforeImages: input.beforeImages ?? [],
    afterImages: [],
    pickupAddress: input.pickupAddress,
    returnAddress: input.returnAddress,
    subtotal: q.subtotal,
    pickupFee: q.pickupFee,
    rushFee: q.rushFee,
    returnShippingFee: q.returnShippingFee,
    discount: q.discount,
    total: q.total,
    isRush: input.isRush,
    couponCode: input.couponCode,
    scheduledPickupAt: input.scheduledPickupAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.orders.upsert(order);
  await appendEvent(order.id, initialStatus, 'customer', input.customerId, 'Order created');

  const flow = flowFor(input.fulfillmentMethod);
  const nextWaiting = flow[1];
  if (nextWaiting) {
    await updateOrderStatus({
      orderId: order.id,
      status: nextWaiting,
      actorRole: 'system',
    });
  }

  return (await db.orders.byId(order.id))!;
}

export async function appendEvent(
  orderId: string,
  status: OrderStatus,
  actorRole: Role | 'system',
  actorId?: string,
  note?: string,
): Promise<OrderEvent> {
  const ev: OrderEvent = {
    id: shortId('ev'),
    orderId,
    status,
    actorRole,
    actorId,
    note,
    createdAt: new Date().toISOString(),
  };
  await db.orderEvents.append(ev);
  return ev;
}

export async function updateOrderStatus(args: {
  orderId: string;
  status: OrderStatus;
  actorRole: Role | 'system';
  actorId?: string;
  note?: string;
  skipValidation?: boolean;
}): Promise<Order> {
  const o = await db.orders.byId(args.orderId);
  if (!o) throw new Error('Order not found.');

  if (!args.skipValidation && args.actorRole !== 'system') {
    const allowed = nextAllowedStatuses(o.fulfillmentMethod, o.status);
    if (!allowed.includes(args.status)) {
      throw new Error(`Cannot transition order from "${o.status}" to "${args.status}".`);
    }
  }

  const updated: Order = {
    ...o,
    status: args.status,
    completedAt: args.status === 'completed' ? new Date().toISOString() : o.completedAt,
    updatedAt: new Date().toISOString(),
  };
  await db.orders.upsert(updated);
  await appendEvent(o.id, args.status, args.actorRole, args.actorId, args.note);
  return updated;
}

export async function assignCleaner(args: {
  orderId: string;
  cleanerId: string;
  session: Session;
}): Promise<Order> {
  const o = await db.orders.byId(args.orderId);
  if (!o) throw new Error('Order not found.');
  const cleaner = await db.cleaners.byId(args.cleanerId);
  if (!cleaner) throw new Error('Cleaner not found.');
  if (cleaner.cityId !== o.cityId) {
    throw new Error('Cleaner is not in the same city as this order.');
  }
  if (!canAccessCity(args.session, o.cityId)) {
    throw new AuthError('You cannot modify orders in that city.');
  }

  const updated: Order = { ...o, cleanerId: cleaner.id, updatedAt: new Date().toISOString() };
  await db.orders.upsert(updated);
  await appendEvent(
    o.id,
    o.status,
    args.session.role,
    args.session.userId,
    `Assigned to ${cleaner.name}`,
  );

  if (o.fulfillmentMethod === 'pickup' && o.status === 'awaiting_pickup') {
    return updateOrderStatus({
      orderId: o.id,
      status: 'pickup_assigned',
      actorRole: args.session.role,
      actorId: args.session.userId,
      note: `Auto-advanced after assigning ${cleaner.name}`,
    });
  }
  return updated;
}

export async function addAfterImage(
  orderId: string,
  url: string,
  session: Session,
): Promise<Order> {
  const o = await db.orders.byId(orderId);
  if (!o) throw new Error('Order not found.');
  if (!canAccessCity(session, o.cityId) && session.userId !== o.customerId) {
    throw new AuthError('Not allowed.');
  }
  const updated: Order = {
    ...o,
    afterImages: [...o.afterImages, url],
    updatedAt: new Date().toISOString(),
  };
  await db.orders.upsert(updated);
  return updated;
}

// --- integration stubs ---
export async function chargeOrder(_orderId: string): Promise<{ success: true }> {
  // TODO: PayPal capture
  return { success: true };
}

export async function createReturnLabel(
  _orderId: string,
): Promise<{ labelUrl: string; trackingNumber: string }> {
  return {
    labelUrl: 'https://example.com/label.pdf',
    trackingNumber: 'SG' + Date.now(),
  };
}
