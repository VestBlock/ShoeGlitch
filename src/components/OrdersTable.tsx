import Link from 'next/link';
import type { Order, OrderStatus, City, Customer } from '@/types';
import { STATUS_LABELS } from '@/lib/status';
import { cn, formatDate } from '@/lib/utils';

const STATUS_TONE: Record<string, string> = {
  order_confirmed: 'bg-bone-soft text-ink',
  awaiting_pickup: 'bg-acid text-ink',
  pickup_assigned: 'bg-acid text-ink',
  picked_up: 'bg-neon/20 text-ink',
  awaiting_dropoff: 'bg-acid text-ink',
  awaiting_shipment: 'bg-acid text-ink',
  received_at_hub: 'bg-neon/20 text-ink',
  in_cleaning: 'bg-glitch text-white',
  in_restoration: 'bg-glitch text-white',
  quality_check: 'bg-ink text-bone',
  ready_for_return: 'bg-neon text-ink',
  ready_for_pickup: 'bg-neon text-ink',
  out_for_delivery: 'bg-neon text-ink',
  shipped_back: 'bg-neon text-ink',
  delivered: 'bg-neon text-ink',
  completed: 'bg-bone-dim text-ink/60',
  issue_flagged: 'bg-glitch text-white',
  awaiting_customer_response: 'bg-acid text-ink',
  cancelled: 'bg-ink/10 text-ink/50',
  quote_started: 'bg-bone-soft text-ink',
};

export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest',
        STATUS_TONE[status] ?? 'bg-bone-soft text-ink',
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export type LookupMaps = {
  cities: Map<string, City>;
  customers: Map<string, Customer>;
};

export function OrdersTable({
  orders,
  hrefBase = '/customer/orders',
  showCustomer,
  lookups,
  emptyLabel = 'No orders yet.',
}: {
  orders: Order[];
  hrefBase?: string;
  showCustomer?: boolean;
  lookups: LookupMaps;
  emptyLabel?: string;
}) {
  if (orders.length === 0) {
    return <div className="card p-8 text-center text-ink/50">{emptyLabel}</div>;
  }
  return (
    <div className="card p-6 overflow-x-auto">
      <table className="sg">
        <thead>
          <tr>
            <th>Order</th>
            {showCustomer && <th>Customer</th>}
            <th>Service</th>
            <th>City</th>
            <th>Mode</th>
            <th>Status</th>
            <th>Placed</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const city = lookups.cities.get(o.cityId);
            const customer = lookups.customers.get(o.customerId);
            const primary = o.items.find((i) => !i.isAddOn);
            return (
              <tr key={o.id} className="group">
                <td>
                  <Link
                    href={`${hrefBase}/${o.id}`}
                    className="font-mono text-sm font-semibold group-hover:text-glitch"
                  >
                    {o.code}
                  </Link>
                </td>
                {showCustomer && <td className="text-sm">{customer?.name ?? '—'}</td>}
                <td className="text-sm">
                  {primary?.serviceName ?? '—'}
                  {o.items.length > 1 && (
                    <span className="text-ink/40 text-xs"> +{o.items.length - 1}</span>
                  )}
                </td>
                <td className="text-sm">{city?.name ?? '—'}</td>
                <td className="text-sm uppercase tracking-wider text-xs">{o.fulfillmentMethod}</td>
                <td>
                  <StatusPill status={o.status} />
                </td>
                <td className="text-sm text-ink/60">{formatDate(o.createdAt)}</td>
                <td className="text-right font-mono">${o.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Helper: build lookup maps from lists */
export function buildLookups(cities: City[], customers: Customer[]): LookupMaps {
  return {
    cities: new Map(cities.map((c) => [c.id, c])),
    customers: new Map(customers.map((c) => [c.id, c])),
  };
}
