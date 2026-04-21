import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { AdminOrdersClient } from './AdminOrdersClient';

export default async function AdminOrders() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const orders = await db.orders.all();
  const cities = await db.cities.all();
  const uniqueCustomerIds = Array.from(new Set(orders.map((o) => o.customerId)));
  const customers = (
    await Promise.all(uniqueCustomerIds.map((id) => db.customers.byId(id)))
  ).filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <DashboardShell currentPath="/admin/orders" pageTitle="All orders">
      <AdminOrdersClient 
        initialOrders={orders} 
        cities={cities} 
        customers={customers} 
      />
    </DashboardShell>
  );
}          All cities
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
