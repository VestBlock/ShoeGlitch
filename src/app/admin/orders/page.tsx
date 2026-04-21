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
}
