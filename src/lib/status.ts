// ==========================================================================
// ORDER STATUS MACHINE
// Legal transitions per fulfillment mode.
// ==========================================================================

import type { FulfillmentMethod, OrderStatus } from '@/types';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  quote_started: 'Quote Started',
  order_confirmed: 'Order Confirmed',
  awaiting_pickup: 'Awaiting Pickup',
  pickup_assigned: 'Pickup Assigned',
  picked_up: 'Picked Up',
  awaiting_dropoff: 'Awaiting Drop-Off',
  awaiting_shipment: 'Awaiting Shipment',
  received_at_hub: 'Received at Hub',
  in_cleaning: 'In Cleaning',
  in_restoration: 'In Restoration',
  quality_check: 'Quality Check',
  ready_for_return: 'Ready for Return',
  ready_for_pickup: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  shipped_back: 'Shipped Back',
  delivered: 'Delivered',
  completed: 'Completed',
  issue_flagged: 'Issue Flagged',
  awaiting_customer_response: 'Awaiting Customer Response',
  cancelled: 'Cancelled',
};

const PICKUP_FLOW: OrderStatus[] = [
  'order_confirmed',
  'awaiting_pickup',
  'pickup_assigned',
  'picked_up',
  'received_at_hub',
  'in_cleaning',
  'in_restoration',
  'quality_check',
  'ready_for_return',
  'out_for_delivery',
  'delivered',
  'completed',
];

const DROPOFF_FLOW: OrderStatus[] = [
  'order_confirmed',
  'awaiting_dropoff',
  'received_at_hub',
  'in_cleaning',
  'in_restoration',
  'quality_check',
  'ready_for_pickup',
  'completed',
];

const MAILIN_FLOW: OrderStatus[] = [
  'order_confirmed',
  'awaiting_shipment',
  'received_at_hub',
  'in_cleaning',
  'in_restoration',
  'quality_check',
  'ready_for_return',
  'shipped_back',
  'delivered',
  'completed',
];

export function flowFor(method: FulfillmentMethod): OrderStatus[] {
  if (method === 'pickup') return PICKUP_FLOW;
  if (method === 'dropoff') return DROPOFF_FLOW;
  return MAILIN_FLOW;
}

/**
 * Legal next statuses from `current`. Always allows cancel / flag.
 * Allows "skipping forward" (e.g. straight to in_cleaning from received_at_hub).
 */
export function nextAllowedStatuses(
  method: FulfillmentMethod,
  current: OrderStatus,
): OrderStatus[] {
  const flow = flowFor(method);
  const idx = flow.indexOf(current);
  const forward = idx === -1 ? flow : flow.slice(idx + 1);
  return Array.from(new Set([...forward, 'issue_flagged', 'awaiting_customer_response', 'cancelled']));
}

/** Percentage complete for progress bars. */
export function progressPercent(method: FulfillmentMethod, current: OrderStatus): number {
  const flow = flowFor(method);
  const idx = flow.indexOf(current);
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / flow.length) * 100);
}
