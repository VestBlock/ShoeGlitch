'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { updateOrderStatus, addAfterImage, appendEvent } from '@/services/orders';
import { requireRole } from '@/lib/rbac';
import { sendStatusUpdate, sendOrderCompleted } from '@/lib/email';
import type { OrderStatus } from '@/types';

const StatusUpdateSchema = z.object({
  orderId: z.string(),
  status: z.string(),
  note: z.string().optional(),
});

export async function updateStatusAction(formData: FormData) {
  const session = await getSession();
  requireRole(session, 'cleaner', 'city_manager', 'super_admin');

  const parsed = StatusUpdateSchema.parse({
    orderId: formData.get('orderId'),
    status: formData.get('status'),
    note: formData.get('note') || undefined,
  });

  const order = await db.orders.byId(parsed.orderId);
  if (!order) throw new Error('Order not found');

  if (session!.role === 'cleaner') {
    const cleaner = await db.cleaners.byUserId(session!.userId);
    if (!cleaner || order.cleanerId !== cleaner.id) {
      throw new Error('You can only update your own assigned orders.');
    }
  }

  await updateOrderStatus({
    orderId: parsed.orderId,
    status: parsed.status as OrderStatus,
    actorRole: session!.role,
    actorId: session!.userId,
    note: parsed.note,
  });

  // Fire the right status-update email (non-blocking — failures don't break the UX).
  try {
    const fresh = await db.orders.byId(parsed.orderId);
    if (fresh) {
      const customer = await db.customers.byId(fresh.customerId);
      if (customer) {
        if (fresh.status === 'completed') {
          await sendOrderCompleted({ order: fresh, customer });
        } else {
          await sendStatusUpdate({ order: fresh, customer });
        }
      }
    }
  } catch (emailErr: any) {
    console.error('[email] status-update email failed:', emailErr?.message ?? emailErr);
  }

  revalidatePath(`/cleaner/orders/${parsed.orderId}`);
  revalidatePath('/cleaner');
  revalidatePath(`/customer/orders/${parsed.orderId}`);
  revalidatePath(`/city-manager`);
  revalidatePath('/admin/orders');
}

export async function addAfterPhotoAction(formData: FormData) {
  const session = await getSession();
  requireRole(session, 'cleaner', 'city_manager', 'super_admin');
  const orderId = String(formData.get('orderId'));
  const url = String(formData.get('url')) ||
    `https://images.unsplash.com/photo-${1519744792095 + Math.floor(Math.random() * 1000)}-2f2205e87b6f?auto=format&fit=crop&w=800&q=80`;

  await addAfterImage(orderId, url, session!);
  const order = await db.orders.byId(orderId);
  if (order) {
    await appendEvent(orderId, order.status, session!.role, session!.userId, 'Added after-photo');
  }
  revalidatePath(`/cleaner/orders/${orderId}`);
  revalidatePath(`/customer/orders/${orderId}`);
}

export async function flagIssueAction(formData: FormData) {
  const session = await getSession();
  requireRole(session, 'cleaner', 'city_manager', 'super_admin');
  const orderId = String(formData.get('orderId'));
  const note = String(formData.get('note') || 'Issue flagged by operator');

  await updateOrderStatus({
    orderId,
    status: 'issue_flagged',
    actorRole: session!.role,
    actorId: session!.userId,
    note,
  });
  revalidatePath(`/cleaner/orders/${orderId}`);
  revalidatePath('/admin/orders');
}
