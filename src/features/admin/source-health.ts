import { kicksDbProvider } from '@/features/intelligence/providers/kicksdb';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

type ProviderProbeStatus = 'healthy' | 'degraded' | 'unavailable';

function adminSafe() {
  try {
    return createAdminSupabaseClient();
  } catch {
    return null;
  }
}

function hasEnv(...keys: string[]) {
  return keys.some((key) => Boolean(process.env[key]?.trim()));
}

export interface AdminSourceHealthSummary {
  kicksdb: {
    status: ProviderProbeStatus;
    message: string;
    lastAttemptAt: string;
    liveKeyConfigured: boolean;
    proxyModeAvailable: boolean;
    sampleCount: number;
    cached: boolean;
  };
  cache: {
    status: 'ready' | 'empty' | 'unavailable';
    totalRows: number;
    expiredRows: number;
    latestFetchAt?: string | null;
    byProvider: Array<{ provider: string; total: number }>;
    message?: string;
  };
}

export async function buildAdminSourceHealthSummary(): Promise<AdminSourceHealthSummary> {
  const now = new Date();
  let kicksdb: AdminSourceHealthSummary['kicksdb'];

  try {
    const result = await kicksDbProvider.search({ query: 'Jordan', limit: 1 }, now);
    kicksdb = {
      status: result.items.length > 0 ? 'healthy' : 'degraded',
      message: result.health.message,
      lastAttemptAt: result.health.lastAttemptAt,
      liveKeyConfigured: hasEnv('KICKSDB_API_KEY', 'KICKS_API_KEY'),
      proxyModeAvailable: !hasEnv('KICKSDB_API_KEY', 'KICKS_API_KEY') && process.env.VERCEL !== '1',
      sampleCount: result.items.length,
      cached: Boolean(result.cached),
    };
  } catch (error) {
    kicksdb = {
      status: 'unavailable',
      message: error instanceof Error ? error.message : 'KicksDB probe failed.',
      lastAttemptAt: now.toISOString(),
      liveKeyConfigured: hasEnv('KICKSDB_API_KEY', 'KICKS_API_KEY'),
      proxyModeAvailable: !hasEnv('KICKSDB_API_KEY', 'KICKS_API_KEY') && process.env.VERCEL !== '1',
      sampleCount: 0,
      cached: false,
    };
  }

  const admin = adminSafe();
  if (!admin) {
    return {
      kicksdb,
      cache: {
        status: 'unavailable',
        totalRows: 0,
        expiredRows: 0,
        byProvider: [],
        message: 'Supabase admin credentials are not configured.',
      },
    };
  }

  const [{ data, error }, { count: totalRows }, { count: expiredRows }] = await Promise.all([
    admin
      .from('sneaker_provider_cache')
      .select('provider,fetched_at,expires_at')
      .order('fetched_at', { ascending: false })
      .limit(500),
    admin
      .from('sneaker_provider_cache')
      .select('cache_key', { count: 'exact', head: true }),
    admin
      .from('sneaker_provider_cache')
      .select('cache_key', { count: 'exact', head: true })
      .lt('expires_at', now.toISOString()),
  ]);

  if (error) {
    return {
      kicksdb,
      cache: {
        status: 'unavailable',
        totalRows: 0,
        expiredRows: 0,
        byProvider: [],
        message: error.message,
      },
    };
  }

  const providerCounts = new Map<string, number>();
  for (const row of data ?? []) {
    const provider = String(row.provider ?? 'unknown');
    providerCounts.set(provider, (providerCounts.get(provider) ?? 0) + 1);
  }

  return {
    kicksdb,
    cache: {
      status: (totalRows ?? 0) > 0 ? 'ready' : 'empty',
      totalRows: totalRows ?? 0,
      expiredRows: expiredRows ?? 0,
      latestFetchAt: data?.[0]?.fetched_at ?? null,
      byProvider: Array.from(providerCounts.entries()).map(([provider, total]) => ({ provider, total })),
    },
  };
}
