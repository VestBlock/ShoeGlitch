import { createBrowserSupabaseClient } from '@/lib/supabase-client';

const BUCKET = 'order-photos';
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export type UploadOrderPhotoPhase = 'before' | 'after';

export async function uploadOrderPhoto(file: File, orderId: string): Promise<string> {
  const [url] = await uploadOrderPhotos([file], orderId);
  return url;
}

export async function uploadOrderPhotos(
  files: File[],
  orderId: string,
  phase: UploadOrderPhotoPhase = 'before',
): Promise<string[]> {
  if (files.length === 0) return [];

  for (const file of files) {
    if (file.size > MAX_SIZE) throw new Error('File too large (max 10MB)');
  }

  const formData = new FormData();
  formData.set('orderId', orderId);
  formData.set('phase', phase);
  files.forEach((file) => formData.append('files', file));

  const response = await fetch('/api/order-photos', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Upload failed');
  }

  return Array.isArray(payload.uploaded) ? payload.uploaded.map((item: { url: string }) => item.url) : [];
}

export async function uploadPreOrderPhotos(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  for (const file of files) {
    if (file.size > MAX_SIZE) throw new Error('File too large (max 10MB)');
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await fetch('/api/order-photo-intake', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Upload failed');
  }

  return Array.isArray(payload.uploaded) ? payload.uploaded.map((item: { url: string }) => item.url) : [];
}

export async function deleteOrderPhoto(storageKey: string): Promise<void> {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET).remove([storageKey]);
  if (error) throw error;
}
