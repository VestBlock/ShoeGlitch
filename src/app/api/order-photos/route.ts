import { NextResponse } from 'next/server';
import { canAccessCity } from '@/lib/rbac';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { appendEvent } from '@/services/orders';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  appendOrderPhotoUrls,
  ORDER_PHOTO_BUCKET,
  type OrderPhotoPhase,
  uploadPhotoFiles,
} from '@/lib/order-photos';

function forbidden() {
  return NextResponse.json({ error: 'You do not have permission to upload photos for this order.' }, { status: 403 });
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 });
  }

  const orderId = formData.get('orderId');
  const phase = formData.get('phase') === 'after' ? 'after' : 'before';
  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);

  if (typeof orderId !== 'string' || !orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign in to upload photos.' }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();
  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id, cityId, customerId, cleanerId, status')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (session.role === 'customer') {
    const customer = await db.customers.byUserId(session.userId);
    if (!customer || customer.id !== order.customerId || phase !== 'before') {
      return forbidden();
    }
  }

  if (session.role === 'cleaner') {
    const cleaner = await db.cleaners.byUserId(session.userId);
    if (!cleaner || cleaner.id !== order.cleanerId || phase !== 'after') {
      return forbidden();
    }
  }

  if (session.role === 'city_manager' && !canAccessCity(session, order.cityId)) {
    return forbidden();
  }

  try {
    const folder = `orders/${orderId}/${phase}`;
    const uploaded = await uploadPhotoFiles(files, folder);

    try {
      await appendOrderPhotoUrls({
        orderId,
        phase: phase as OrderPhotoPhase,
        urls: uploaded.map((item) => item.url),
      });
      await appendEvent(
        orderId,
        order.status,
        session.role,
        session.userId,
        `Added ${uploaded.length} ${phase} photo${uploaded.length === 1 ? '' : 's'}.`,
      );
    } catch (error) {
      await admin.storage.from(ORDER_PHOTO_BUCKET).remove(uploaded.map((item) => item.storageKey));
      throw error;
    }

    return NextResponse.json({ uploaded });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
