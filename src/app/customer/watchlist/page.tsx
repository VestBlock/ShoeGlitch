import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import WatchlistManager from '@/components/intelligence/WatchlistManager';
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

  const [{ items, history }, params] = await Promise.all([
    getWatchlistDashboard(session.userId),
    searchParams ?? Promise.resolve({}),
  ]);

  return (
    <DashboardShell currentPath="/customer/watchlist" pageTitle="Watchlist">
      <WatchlistManager initialItems={items} initialHistory={history} prefill={prefillFromParams(params)} />
    </DashboardShell>
  );
}
