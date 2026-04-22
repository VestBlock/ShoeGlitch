import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const ORDER_PHOTO_BUCKET = 'order-photos';
export const MAX_ORDER_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ORDER_PHOTO_COUNT = 5;

export type OrderPhotoPhase = 'before' | 'after';

type UploadedPhoto = {
  url: string;
  storageKey: string;
};

function fileExt(name: string) {
  return name.split('.').pop()?.toLowerCase() || 'jpg';
}

export function validatePhotoFiles(files: File[], maxCount = MAX_ORDER_PHOTO_COUNT) {
  if (files.length === 0) {
    throw new Error('At least one photo is required.');
  }

  if (files.length > maxCount) {
    throw new Error(`Max ${maxCount} photos allowed.`);
  }

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image uploads are supported.');
    }

    if (file.size > MAX_ORDER_PHOTO_SIZE) {
      throw new Error('File too large (max 10MB).');
    }
  }
}

export async function uploadPhotoFiles(
  files: File[],
  folder: string,
): Promise<UploadedPhoto[]> {
  validatePhotoFiles(files);

  const admin = createAdminSupabaseClient();
  const uploaded: UploadedPhoto[] = [];

  for (const file of files) {
    const safeFolder = folder.replace(/^\/+|\/+$/g, '');
    const key = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await admin.storage.from(ORDER_PHOTO_BUCKET).upload(key, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

    if (error) {
      if (uploaded.length > 0) {
        await admin.storage.from(ORDER_PHOTO_BUCKET).remove(uploaded.map((item) => item.storageKey));
      }
      throw error;
    }

    const { data: publicUrl } = admin.storage.from(ORDER_PHOTO_BUCKET).getPublicUrl(data.path);
    uploaded.push({
      url: publicUrl.publicUrl,
      storageKey: data.path,
    });
  }

  return uploaded;
}

export async function appendOrderPhotoUrls(args: {
  orderId: string;
  phase: OrderPhotoPhase;
  urls: string[];
}) {
  const admin = createAdminSupabaseClient();
  const imageColumn = args.phase === 'after' ? 'afterImages' : 'beforeImages';

  const { data: order, error: orderError } = await admin
    .from('orders')
    .select(`id, ${imageColumn}`)
    .eq('id', args.orderId)
    .maybeSingle();

  if (orderError) throw orderError;
  if (!order) throw new Error('Order not found.');

  const existing =
    args.phase === 'after'
      ? ((order as { afterImages?: string[] | null }).afterImages ?? [])
      : ((order as { beforeImages?: string[] | null }).beforeImages ?? []);
  const nextImages = [...existing, ...args.urls];

  const { error: updateError } = await admin
    .from('orders')
    .update({
      [imageColumn]: nextImages,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', args.orderId);

  if (updateError) {
    throw updateError;
  }
}
