import { buildProviderCacheKey, readProviderCache, writeProviderCache } from '@/features/intelligence/providers/cache';
import { normalizeKicksDbProduct, type KicksDbProductRecord } from '@/features/intelligence/providers/normalize';
import type {
  ProviderHealth,
  ProviderProductResult,
  ProviderSearchInput,
  ProviderSearchResult,
  SneakerProvider,
} from '@/features/intelligence/providers/types';

function sanitizeEnvValue(value: string | undefined) {
  if (!value) return undefined;
  const trimmed = value.trim();
  const unquoted = trimmed.replace(/^['"]|['"]$/g, '').trim();
  if (!unquoted || unquoted === '""' || unquoted === "''") return undefined;
  return unquoted;
}

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = sanitizeEnvValue(process.env[key]);
    if (value) return value;
  }
  return undefined;
}

const KICKSDB_BASE_URL =
  readEnv('KICKSDB_API_BASE_URL', 'KICKSDB_BASE_URL', 'KICKS_API_BASE_URL') ??
  'https://api.kicks.dev/v3';

const KICKSDB_API_KEY = readEnv('KICKSDB_API_KEY', 'KICKS_API_KEY');

function remoteProxyBaseUrl() {
  const candidate = readEnv('KICKSDB_REMOTE_PROXY_URL', 'NEXT_PUBLIC_SITE_URL');
  if (candidate && !/localhost|127\.0\.0\.1/.test(candidate)) {
    return candidate.replace(/\/$/, '');
  }
  return 'https://www.shoeglitch.com';
}

function canUseRemoteProxy() {
  return !KICKSDB_API_KEY && process.env.VERCEL !== '1';
}

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

  if (KICKSDB_API_KEY) {
    headers.Authorization = `Bearer ${KICKSDB_API_KEY}`;
  }

  return headers;
}

async function requestRemoteProxy<T>(path: '/api/intelligence/search' | '/api/intelligence/product', params: Record<string, string | number | undefined>) {
  const url = new URL(`${remoteProxyBaseUrl()}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 * 15 },
  });

  if (!response.ok) {
    throw new Error(`Remote KicksDB proxy failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
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

    if (canUseRemoteProxy()) {
      const remote = await requestRemoteProxy<ProviderSearchResult>('/api/intelligence/search', {
        q: input.query,
        sku: input.sku,
        limit: input.limit ?? 8,
      });

      return {
        ...remote,
        health: health('healthy', 'Loaded KicksDB search through the live ShoeGlitch proxy.', now),
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

    if (canUseRemoteProxy()) {
      const remote = await requestRemoteProxy<ProviderProductResult>('/api/intelligence/product', {
        id: idOrSlug,
      });

      return {
        ...remote,
        health: health('healthy', 'Loaded KicksDB product through the live ShoeGlitch proxy.', now),
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
