import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import { OrdersTable, buildLookups } from '@/components/OrdersTable';
import { Card } from '@/components/ui';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';

const FILTERS = [
  { k: 'all', label: 'All' },
  { k: 'active', label: 'Active' },
  { k: 'flagged', label: 'Flagged' },
  { k: 'completed', label: 'Completed' },
] as const;

export default async function AdminOrders({ searchParams }: { searchParams: { filter?: string; city?: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const filter = (searchParams.filter ?? 'active') as typeof FILTERS[number]['k'];
  const cityFilter = searchParams.city;

  let orders = await db.orders.all();
  if (cityFilter) orders = orders.filter((o) => o.cityId === cityFilter);
  if (filter === 'active') orders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  if (filter === 'flagged') orders = orders.filter(o => o.status === 'issue_flagged');
  if (filter === 'completed') orders = orders.filter(o => o.status === 'completed');

  const cities = await db.cities.all();
  const uniqueCustomerIds = Array.from(new Set(orders.map((o) => o.customerId)));
  const customers = (
    await Promise.all(uniqueCustomerIds.map((id) => db.customers.byId(id)))
  ).filter((c): c is NonNullable<typeof c> => !!c);
  const lookups = buildLookups(cities, customers);

  return (
    <DashboardShell currentPath="/admin/orders" pageTitle="All orders">
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => {
          const href = `/admin/orders?filter=${f.k}${cityFilter ? `&city=${cityFilter}` : ''}`;
          return (
            <Link key={f.k} href={href} className={cn('chip', filter === f.k && 'chip-on')}>
              {f.label}
            </Link>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href={`/admin/orders?filter=${filter}`} className={cn('chip', !cityFilter && 'chip-on')}>
          All cities
        </Link>
        {cities.map((c) => (
          <Link key={c.id} href={`/admin/orders?filter=${filter}&city=${c.id}`}
            className={cn('chip', cityFilter === c.id && 'chip-on')}>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Showing" value={orders.length} />
        <Stat label="Revenue" value={`$${orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0)}`} />
        <Stat label="Avg ticket" value={`$${orders.length ? Math.round(orders.reduce((s, o) => s + o.total, 0) / orders.length) : 0}`} />
        <Stat label="Rush %" value={`${orders.length ? Math.round((orders.filter(o => o.isRush).length / orders.length) * 100) : 0}%`} />
      </div>

      <OrdersTable orders={orders} hrefBase="/admin/orders" showCustomer lookups={lookups} />
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <div className="font-mono text-xs text-ink/40 mb-1">{label}</div>
      <div className="h-display text-3xl">{value}</div>
    </Card>
  );
}
