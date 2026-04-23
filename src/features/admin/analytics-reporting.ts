import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface GrowthEventRow {
  route_path: string;
  event_name: string;
  cta_label: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface GrowthLeadRow {
  route_path: string;
  offer: string;
  email: string;
  created_at: string;
}

export interface AdminAnalyticsSummary {
  status: 'live' | 'empty' | 'unavailable';
  message?: string;
  totals: {
    pageViews: number;
    ctaClicks: number;
    leads: number;
    trackedRoutes: number;
    bookingStarts: number;
    bookingCompletes: number;
    watchlistSaves: number;
    operatorInterests: number;
  };
  funnels: {
    ctaRate: number;
    leadRate: number;
    bookingCompletionRate: number;
    operatorLeadRate: number;
    watchlistSaveRate: number;
  };
  byFamily: Array<{
    family: string;
    pageViews: number;
    ctaClicks: number;
    leads: number;
  }>;
  topRoutes: Array<{
    routePath: string;
    family: string;
    pageViews: number;
    ctaClicks: number;
    leads: number;
    lastSeenAt?: string;
  }>;
  recentEvents: GrowthEventRow[];
  recentLeads: GrowthLeadRow[];
}

function classifyRouteFamily(routePath: string) {
  if (routePath.startsWith('/operator') || routePath === '/operators' || routePath === '/become-an-operator') {
    return 'operator-acquisition';
  }
  if (
    routePath.startsWith('/sneaker-cleaning') ||
    routePath.startsWith('/shoe-restoration') ||
    routePath.startsWith('/pickup-dropoff') ||
    routePath.startsWith('/locations')
  ) {
    return 'service-seo';
  }
  if (
    routePath.startsWith('/releases') ||
    routePath.startsWith('/worth-restoring') ||
    routePath.startsWith('/how-to-clean') ||
    routePath.startsWith('/release-alerts')
  ) {
    return 'release-content';
  }
  if (routePath.startsWith('/intelligence') || routePath.startsWith('/customer/watchlist')) {
    return 'intelligence';
  }
  if (routePath.startsWith('/book') || routePath.startsWith('/services') || routePath === '/') {
    return 'conversion-core';
  }
  if (
    routePath.startsWith('/coverage') ||
    routePath.startsWith('/mail-in') ||
    routePath.startsWith('/operator') ||
    routePath.startsWith('/privacy') ||
    routePath.startsWith('/terms') ||
    routePath.startsWith('/refund-policy')
  ) {
    return 'public-site';
  }
  return 'other';
}

export async function buildAdminAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return {
      status: 'unavailable',
      message: 'Supabase admin credentials are not configured for analytics reporting.',
      totals: { pageViews: 0, ctaClicks: 0, leads: 0, trackedRoutes: 0, bookingStarts: 0, bookingCompletes: 0, watchlistSaves: 0, operatorInterests: 0 },
      funnels: { ctaRate: 0, leadRate: 0, bookingCompletionRate: 0, operatorLeadRate: 0, watchlistSaveRate: 0 },
      byFamily: [],
      topRoutes: [],
      recentEvents: [],
      recentLeads: [],
    };
  }

  try {
    const [{ data: eventsData, error: eventsError }, { data: leadsData, error: leadsError }] = await Promise.all([
      admin
        .from('growth_events')
        .select('route_path,event_name,cta_label,metadata,created_at')
        .order('created_at', { ascending: false })
        .limit(2000),
      admin
        .from('growth_leads')
        .select('route_path,offer,email,created_at')
        .order('created_at', { ascending: false })
        .limit(500),
    ]);

    if (eventsError || leadsError) {
      return {
        status: 'unavailable',
        message: eventsError?.message ?? leadsError?.message ?? 'Unable to load analytics data.',
        totals: { pageViews: 0, ctaClicks: 0, leads: 0, trackedRoutes: 0, bookingStarts: 0, bookingCompletes: 0, watchlistSaves: 0, operatorInterests: 0 },
        funnels: { ctaRate: 0, leadRate: 0, bookingCompletionRate: 0, operatorLeadRate: 0, watchlistSaveRate: 0 },
        byFamily: [],
        topRoutes: [],
        recentEvents: [],
        recentLeads: [],
      };
    }

    const events = (eventsData ?? []) as GrowthEventRow[];
    const leads = (leadsData ?? []) as GrowthLeadRow[];

    if (events.length === 0 && leads.length === 0) {
      return {
        status: 'empty',
        message: 'Tracking is wired, but no growth events or leads have been recorded yet.',
        totals: { pageViews: 0, ctaClicks: 0, leads: 0, trackedRoutes: 0, bookingStarts: 0, bookingCompletes: 0, watchlistSaves: 0, operatorInterests: 0 },
        funnels: { ctaRate: 0, leadRate: 0, bookingCompletionRate: 0, operatorLeadRate: 0, watchlistSaveRate: 0 },
        byFamily: [],
        topRoutes: [],
        recentEvents: [],
        recentLeads: [],
      };
    }

    const routeMap = new Map<
      string,
      {
        family: string;
        pageViews: number;
        ctaClicks: number;
        leads: number;
        lastSeenAt?: string;
      }
    >();

    for (const event of events) {
      const entry = routeMap.get(event.route_path) ?? {
        family: classifyRouteFamily(event.route_path),
        pageViews: 0,
        ctaClicks: 0,
        leads: 0,
        lastSeenAt: event.created_at,
      };

      if (event.event_name === 'page_view') entry.pageViews += 1;
      if (event.event_name === 'cta_click') entry.ctaClicks += 1;
      if (!entry.lastSeenAt || new Date(event.created_at) > new Date(entry.lastSeenAt)) {
        entry.lastSeenAt = event.created_at;
      }

      routeMap.set(event.route_path, entry);
    }

    for (const lead of leads) {
      const entry = routeMap.get(lead.route_path) ?? {
        family: classifyRouteFamily(lead.route_path),
        pageViews: 0,
        ctaClicks: 0,
        leads: 0,
        lastSeenAt: lead.created_at,
      };
      entry.leads += 1;
      if (!entry.lastSeenAt || new Date(lead.created_at) > new Date(entry.lastSeenAt)) {
        entry.lastSeenAt = lead.created_at;
      }
      routeMap.set(lead.route_path, entry);
    }

    const topRoutes = Array.from(routeMap.entries())
      .map(([routePath, metrics]) => ({
        routePath,
        ...metrics,
      }))
      .sort((a, b) => b.pageViews + b.ctaClicks + b.leads - (a.pageViews + a.ctaClicks + a.leads))
      .slice(0, 12);

    const familyMap = new Map<
      string,
      { pageViews: number; ctaClicks: number; leads: number }
    >();

    for (const route of topRoutes.length > 0 ? Array.from(routeMap.values()) : []) {
      const family = route.family;
      const current = familyMap.get(family) ?? { pageViews: 0, ctaClicks: 0, leads: 0 };
      current.pageViews += route.pageViews;
      current.ctaClicks += route.ctaClicks;
      current.leads += route.leads;
      familyMap.set(family, current);
    }

    const pageViews = events.filter((event) => event.event_name === 'page_view').length;
    const ctaClicks = events.filter((event) => event.event_name === 'cta_click').length;
    const bookingStarts = events.filter((event) => event.event_name === 'booking_start').length;
    const bookingCompletes = events.filter((event) => event.event_name === 'booking_complete').length;
    const watchlistSaves = events.filter((event) => event.event_name === 'watchlist_save').length;
    const operatorInterests = events.filter((event) => event.event_name === 'operator_interest').length;
    const safeRate = (top: number, bottom: number) => (bottom > 0 ? Math.round((top / bottom) * 1000) / 10 : 0);

    return {
      status: 'live',
      totals: {
        pageViews,
        ctaClicks,
        leads: leads.length,
        trackedRoutes: routeMap.size,
        bookingStarts,
        bookingCompletes,
        watchlistSaves,
        operatorInterests,
      },
      funnels: {
        ctaRate: safeRate(ctaClicks, pageViews),
        leadRate: safeRate(leads.length, pageViews),
        bookingCompletionRate: safeRate(bookingCompletes, bookingStarts),
        operatorLeadRate: safeRate(operatorInterests, pageViews),
        watchlistSaveRate: safeRate(watchlistSaves, pageViews),
      },
      byFamily: Array.from(familyMap.entries())
        .map(([family, metrics]) => ({ family, ...metrics }))
        .sort((a, b) => b.pageViews + b.ctaClicks + b.leads - (a.pageViews + a.ctaClicks + a.leads)),
      topRoutes,
      recentEvents: events.slice(0, 12),
      recentLeads: leads.slice(0, 12),
    };
  } catch (error) {
    return {
      status: 'unavailable',
      message: error instanceof Error ? error.message : 'Unable to load analytics summary.',
      totals: { pageViews: 0, ctaClicks: 0, leads: 0, trackedRoutes: 0, bookingStarts: 0, bookingCompletes: 0, watchlistSaves: 0, operatorInterests: 0 },
      funnels: { ctaRate: 0, leadRate: 0, bookingCompletionRate: 0, operatorLeadRate: 0, watchlistSaveRate: 0 },
      byFamily: [],
      topRoutes: [],
      recentEvents: [],
      recentLeads: [],
    };
  }
}
