import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import WatchlistManager from '@/components/intelligence/WatchlistManager';
import { Card } from '@/components/ui';
import { getSession } from '@/lib/session';
import { getWatchlistDashboard } from '@/features/intelligence/watchlist/service';
import { buildLoginHref } from '@/lib/login-redirect';

function prefillFromParams(params: Record<string, string | undefined>) {
  const brand = params.brand?.trim();
  const model = params.model?.trim();
  if (!brand || !model) return null;

  return {
    brand,
    model,
    name: params.name?.trim() || null,
    colorway: params.colorway?.trim() || null,
    sku: params.sku?.trim() || null,
    alertType: 'any' as const,
    isActive: true,
  };
}

export default async function CustomerWatchlistPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  const params = await (searchParams ?? Promise.resolve({}));
  const filteredParams = Object.entries(params).filter(([, value]) => value) as [string, string][];
  const nextSearch = new URLSearchParams(filteredParams).toString();
  const nextPath = `/customer/watchlist${nextSearch ? `?${nextSearch}` : ''}`;
  if (!session || session.role !== 'customer') redirect(buildLoginHref(nextPath));

  const dashboard = await getWatchlistDashboard(session.userId).catch((error) => {
    console.error('[watchlist] dashboard unavailable:', error instanceof Error ? error.message : error);
    return null;
  });

  if (!dashboard) {
    return (
      <DashboardShell currentPath="/customer/watchlist" pageTitle="Watchlist">
        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Watchlist unavailable</div>
          <h2 className="h-display mt-3 text-3xl">Your alerts page is taking a quick reset.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/66">
            Saved pairs and alert history are temporarily unavailable right now. Try refreshing in a moment. If it keeps happening, contact us and we&rsquo;ll get it fixed.
          </p>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell currentPath="/customer/watchlist" pageTitle="Watchlist">
      <WatchlistManager initialItems={dashboard.items} initialHistory={dashboard.history} prefill={prefillFromParams(params)} />
    </DashboardShell>
  );
}
