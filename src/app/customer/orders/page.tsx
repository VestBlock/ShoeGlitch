import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { OrdersTable, buildLookups } from '@/components/OrdersTable';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export default async function CustomerOrdersPage() {
  const session = await getSession();
  if (!session || session.role !== 'customer') redirect('/login');

  const customer = await db.customers.byUserId(session.userId);
  if (!customer) redirect('/login');

  const orders = await db.orders.byCustomer(customer.id);
  const cities = await db.cities.all();
  const lookups = buildLookups(cities, [customer]);

  return (
    <DashboardShell currentPath="/customer/orders" pageTitle="Your orders">
      <OrdersTable orders={orders} hrefBase="/customer/orders" lookups={lookups} emptyLabel="No orders yet." />
    </DashboardShell>
  );
}
