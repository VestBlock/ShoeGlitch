import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export type RequiredTableStatus = {
  table: string;
  purpose: string;
  migration: string;
  ok: boolean;
  error?: string;
};

export const REQUIRED_OPERATIONAL_TABLES: Array<Omit<RequiredTableStatus, 'ok' | 'error'>> = [
  {
    table: 'growth_events',
    purpose: 'analytics events and automation run logs',
    migration: 'supabase/migrations/20260421_growth_engine.sql',
  },
  {
    table: 'growth_leads',
    purpose: 'SEO and growth lead capture',
    migration: 'supabase/migrations/20260421_growth_engine.sql',
  },
  {
    table: 'growth_generated_pages',
    purpose: 'persisted generated growth pages',
    migration: 'supabase/migrations/20260421_growth_engine.sql',
  },
  {
    table: 'sneaker_provider_cache',
    purpose: 'KicksDB/provider response caching',
    migration: 'supabase/migrations/20260421_sneaker_provider_cache.sql',
  },
  {
    table: 'watchlist_items',
    purpose: 'customer sneaker watchlists',
    migration: 'supabase/migrations/20260422_watchlist_alerts.sql',
  },
  {
    table: 'sneaker_events',
    purpose: 'release/restock/price-drop events',
    migration: 'supabase/migrations/20260422_watchlist_alerts.sql',
  },
  {
    table: 'alert_deliveries',
    purpose: 'email alert dedupe and history',
    migration: 'supabase/migrations/20260422_watchlist_alerts.sql',
  },
  {
    table: 'source_match_records',
    purpose: 'watchlist event match audit trail',
    migration: 'supabase/migrations/20260422_watchlist_alerts.sql',
  },
  {
    table: 'social_post_queue',
    purpose: 'review-first social post queue',
    migration: 'supabase/migrations/20260422_social_automation.sql',
  },
];

export async function checkRequiredOperationalTables(): Promise<{
  status: 'ready' | 'missing' | 'unavailable';
  tables: RequiredTableStatus[];
}> {
  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch (error) {
    return {
      status: 'unavailable',
      tables: REQUIRED_OPERATIONAL_TABLES.map((table) => ({
        ...table,
        ok: false,
        error: error instanceof Error ? error.message : 'Supabase admin client unavailable.',
      })),
    };
  }

  const tables = await Promise.all(
    REQUIRED_OPERATIONAL_TABLES.map(async (table) => {
      const { error } = await admin.from(table.table).select('*').limit(1);
      return {
        ...table,
        ok: !error,
        error: error?.message,
      };
    }),
  );

  return {
    status: tables.every((table) => table.ok) ? 'ready' : 'missing',
    tables,
  };
}
