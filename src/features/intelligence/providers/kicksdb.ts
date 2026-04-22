import { buildProviderCacheKey, readProviderCache, writeProviderCache } from '@/features/intelligence/providers/cache';
import { normalizeKicksDbProduct, type KicksDbProductRecord } from '@/features/intelligence/providers/normalize';
import type {
  ProviderHealth,
  ProviderProductResult,
  ProviderSearchInput,
  ProviderSearchResult,
  SneakerProvider,
} from '@/features/intelligence/providers/types';

const KICKSDB_BASE_URL =
  process.env.KICKSDB_API_BASE_URL ??
  process.env.KICKS_API_BASE_URL ??
  'https://api.kicks.dev/v3';

interface KicksDbListResponse {
  data: KicksDbProductRecord[];
  meta?: unknown;
}

interface KicksDbSingleResponse {
  data: KicksDbProductRecord;
  meta?: unknown;
}

function buildHeaders() {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const apiKey = process.env.KICKSDB_API_KEY ?? process.env.KICKS_API_KEY;
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  return headers;
}

async function requestJson<T>(path: string, params: Record<string, string | number | undefined>) {
  const url = new URL(`${KICKSDB_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: buildHeaders(),
    next: { revalidate: 60 * 30 },
  });

  if (!response.ok) {
    throw new Error(`KicksDB request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function health(status: ProviderHealth['status'], message: string, now: Date): ProviderHealth {
  return {
    key: 'kicksdb',
    label: 'KicksDB provider',
    status,
    message,
    lastAttemptAt: now.toISOString(),
    lastSuccessAt: status === 'healthy' ? now.toISOString() : undefined,
  };
}

export const kicksDbProvider: SneakerProvider = {
  key: 'kicksdb',
  label: 'KicksDB provider',

  async search(input: ProviderSearchInput, now: Date): Promise<ProviderSearchResult> {
    const searchValue = input.sku?.trim() || input.query?.trim() || '';
    const cacheKey = buildProviderCacheKey('search', `${searchValue}:${input.limit ?? 8}`);
    const cached = await readProviderCache<KicksDbListResponse>(cacheKey);

    if (cached) {
      return {
        items: cached.payload.data.map(normalizeKicksDbProduct),
        raw: cached.payload,
        cached: true,
        health: health('healthy', 'Served KicksDB search from cache.', now),
      };
    }

    const payload = await requestJson<KicksDbListResponse>('/stockx/products', {
      query: input.sku ? undefined : searchValue,
      sku: input.sku ? searchValue : undefined,
      limit: input.limit ?? 8,
    });

    await writeProviderCache(cacheKey, 'kicksdb', 'search', searchValue, payload);

    return {
      items: payload.data.map(normalizeKicksDbProduct),
      raw: payload,
      cached: false,
      health: health('healthy', `${payload.data.length} product matches loaded from KicksDB.`, now),
    };
  },

  async getProduct(idOrSlug: string, now: Date): Promise<ProviderProductResult> {
    const cacheKey = buildProviderCacheKey('product', idOrSlug);
    const cached = await readProviderCache<KicksDbSingleResponse>(cacheKey);

    if (cached) {
      return {
        item: normalizeKicksDbProduct(cached.payload.data),
        raw: cached.payload,
        cached: true,
        health: health('healthy', 'Served KicksDB product detail from cache.', now),
      };
    }

    const payload = await requestJson<KicksDbSingleResponse>(`/stockx/products/${encodeURIComponent(idOrSlug)}`, {
      'display[variants]': 'true',
      'display[prices]': 'true',
    });

    await writeProviderCache(cacheKey, 'kicksdb', 'product', idOrSlug, payload);

    return {
      item: normalizeKicksDbProduct(payload.data),
      raw: payload,
      cached: false,
      health: health('healthy', 'Loaded product detail from KicksDB.', now),
    };
  },
};
