import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import WatchlistManager from '@/components/intelligence/WatchlistManager';
import { Card } from '@/components/ui';
import { getSession } from '@/lib/session';
import { getWatchlistDashboard } from '@/features/intelligence/watchlist/service';

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
  if (!session || session.role !== 'customer') redirect('/login');

  const params = await (searchParams ?? Promise.resolve({}));
  const dashboard = await getWatchlistDashboard(session.userId).catch((error) => {
    console.error('[watchlist] dashboard unavailable:', error instanceof Error ? error.message : error);
    return null;
  });

  if (!dashboard) {
    return (
      <DashboardShell currentPath="/customer/watchlist" pageTitle="Watchlist">
        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Watchlist setup needed</div>
          <h2 className="h-display mt-3 text-3xl">Sneaker alerts are almost ready.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/66">
            The watchlist interface is installed, but the Supabase watchlist tables still need to be applied before saved shoes and alert history can load.
          </p>
          <p className="mt-4 text-xs text-ink/50">
            Apply <span className="font-mono">supabase/migrations/20260422_watchlist_alerts.sql</span>.
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
