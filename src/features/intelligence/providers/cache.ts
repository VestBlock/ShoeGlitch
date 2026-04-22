import { createHash } from 'crypto';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

const CACHE_TTL_SECONDS = 60 * 45;

interface CachedRecord<T> {
  payload: T;
  fetchedAt: string;
}

function buildKey(parts: string[]) {
  return createHash('sha1').update(parts.join(':')).digest('hex');
}

export function buildProviderCacheKey(scope: string, value: string) {
  return buildKey(['intelligence', scope, value]);
}

export async function readProviderCache<T>(cacheKey: string): Promise<CachedRecord<T> | null> {
  try {
    const admin = createAdminSupabaseClient();
    const result = await admin
      .from('sneaker_provider_cache')
      .select('payload, fetched_at, expires_at')
      .eq('cache_key', cacheKey)
      .maybeSingle();

    if (result.error || !result.data) return null;
    if (new Date(result.data.expires_at).getTime() < Date.now()) return null;

    return {
      payload: result.data.payload as T,
      fetchedAt: result.data.fetched_at,
    };
  } catch {
    return null;
  }
}

export async function writeProviderCache<T>(
  cacheKey: string,
  provider: string,
  scope: string,
  queryValue: string,
  payload: T,
) {
  try {
    const admin = createAdminSupabaseClient();
    const fetchedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + CACHE_TTL_SECONDS * 1000).toISOString();

    const result = await admin.from('sneaker_provider_cache').upsert(
      {
        cache_key: cacheKey,
        provider,
        scope,
        query_value: queryValue,
        payload,
        fetched_at: fetchedAt,
        expires_at: expiresAt,
      },
      { onConflict: 'cache_key' },
    );

    if (result.error) throw result.error;
  } catch {
    return;
  }
}
