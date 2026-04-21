// Storage helper for uploading images to Supabase
import { createBrowserSupabaseClient } from '@/lib/supabase-client';

const BUCKET = 'order-photos';
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadOrderPhoto(file: File, orderId: string): Promise<string> {
  if (file.size > MAX_SIZE) throw new Error('File too large (max 10MB)');
  
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `${orderId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.storage.from(BUCKET).upload(key, file);
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function deleteOrderPhoto(storageKey: string): Promise<void> {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET).remove([storageKey]);
  if (error) throw error;
}
