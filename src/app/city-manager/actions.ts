'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { requireRole, canAccessCity } from '@/lib/rbac';
import { db } from '@/lib/db';
import { assignCleaner } from '@/services/orders';

export async function assignCleanerAction(formData: FormData) {
  const session = await getSession();
  requireRole(session, 'city_manager', 'super_admin');

  const orderId = String(formData.get('orderId'));
  const cleanerId = String(formData.get('cleanerId'));
  const order = await db.orders.byId(orderId);
  if (!order) throw new Error('Order not found');

  if (!canAccessCity(session!, order.cityId)) {
    throw new Error('You cannot access orders in that city.');
  }

  await assignCleaner({ orderId, cleanerId, session: session! });

  revalidatePath('/city-manager');
  revalidatePath('/admin/orders');
  revalidatePath(`/customer/orders/${orderId}`);
}
