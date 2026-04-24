import { Badge } from '@/components/ui';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import {
  getSneakerProduct,
  getNikePublicProduct,
  searchNikePublicSneakers,
  searchSneakers,
} from '@/features/intelligence/provider-service';
import { retailMonitorStore } from '@/features/intelligence/monitors/store';
import { getRetailMonitorSnapshot } from '@/features/intelligence/monitors/service';
import { runRetailMonitorRefreshAction, runWatchlistScanAction } from '@/app/admin/intelligence/actions';

export default async function AdminIntelligencePage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; sku?: string; id?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const params = (await searchParams) ?? {};
  const query = params.q ?? '';
  const sku = params.sku ?? '';
  const id = params.id ?? '';

  const searchResult =
    query || sku ? await searchSneakers({ query: query || undefined, sku: sku || undefined, limit: 5 }) : null;
  const detailResult = id ? await getSneakerProduct(id) : null;
  const nikeSearchResult =
    query || sku ? await searchNikePublicSneakers({ query: query || undefined, sku: sku || undefined, limit: 5 }) : null;
  const nikeDetailResult = id ? await getNikePublicProduct(id) : null;
  const retailSnapshot = await getRetailMonitorSnapshot();
  const [monitorReady, recentMonitorDiffs] = await Promise.all([
    retailMonitorStore.isReady().catch(() => false),
    retailMonitorStore.listRecentDiffs(10).catch(() => []),
  ]);

  return (
    <section className="container-x py-10">
      <Badge className="mb-4">Admin intelligence inspector</Badge>
      <h1 className="h-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] text-ink">
        KicksDB raw vs normalized
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/66">
        Use this page to compare provider responses against Shoe Glitch&rsquo;s normalized sneaker model before wiring more scoring or alert logic.
      </p>

      <div className="mt-6 rounded-[1.4rem] border border-ink/10 bg-white/82 p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Watchlist processing</div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/66">
          Run the current event matcher against active watchlist items. This uses the live intelligence source set first, then falls back to mocked events if source coverage is thin.
        </p>
        <form action={runWatchlistScanAction} className="mt-4">
          <button className="btn-glitch">Run watchlist scan →</button>
        </form>
      </div>

      <div className="mt-6 rounded-[1.4rem] border border-ink/10 bg-white/82 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Retail source monitors</div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/66">
              This layer tracks official retailer release pages first. adidas and Foot Locker are parsed live right now, while harder sources still report health and blocking status so we know where anti-bot friction is happening.
            </p>
          </div>
          <form action={runRetailMonitorRefreshAction}>
            <button className="btn-outline">Refresh retailer monitors</button>
          </form>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {retailSnapshot.health.map((source) => (
            <div key={source.key} className="rounded-[1.2rem] border border-ink/10 bg-bone-soft p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-ink">{source.label}</div>
                <span
                  className={
                    source.status === 'healthy'
                      ? 'badge-glitch !bg-cyan !text-ink'
                      : source.status === 'degraded'
                        ? 'badge-dark !bg-ink !text-bone'
                        : 'badge'
                  }
                >
                  {source.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/66">{source.message}</p>
              <a href={source.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-glitch">
                Open source →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.2rem] border border-ink/10 bg-white p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Current retailer candidates</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {retailSnapshot.entries.slice(0, 12).map((entry) => (
              <a
                key={entry.id}
                href={entry.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-[1.1rem] border border-ink/10 bg-bone-soft p-4 transition hover:-translate-y-0.5 hover:border-glitch/30"
              >
                <div className="text-[11px] uppercase tracking-[0.24em] text-glitch/80">{entry.sourceLabel}</div>
                <div className="mt-2 text-lg font-semibold text-ink">{entry.name}</div>
                <div className="mt-1 text-sm text-ink/62">
                  {[entry.brand, entry.sku].filter(Boolean).join(' · ')}
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[1.2rem] border border-ink/10 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Monitor history</div>
            <span className={monitorReady ? 'badge-glitch !bg-cyan !text-ink' : 'badge'}>{monitorReady ? 'Persistence ready' : 'Needs SQL migration'}</span>
          </div>
          {recentMonitorDiffs.length > 0 ? (
            <div className="mt-4 space-y-3">
              {recentMonitorDiffs.map((diff) => (
                <div key={diff.id} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink">{diff.sourceLabel}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.22em] text-ink/45">{diff.diffKind}</div>
                    </div>
                    <div className="text-sm text-ink/62">{String(diff.payload.name ?? diff.payload.sku ?? 'Snapshot change')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-ink/62">
              No persisted monitor diffs yet. Run the refresh action after the retail monitor history migration is installed.
            </p>
          )}
        </div>
      </div>

      <form className="mt-8 grid gap-3 rounded-[1.6rem] border border-ink/10 bg-white/82 p-5 md:grid-cols-3">
        <label className="block">
          <span className="label">Search name or brand</span>
          <input name="q" defaultValue={query} className="input" placeholder="Jordan 4" />
        </label>
        <label className="block">
          <span className="label">Search SKU</span>
          <input name="sku" defaultValue={sku} className="input" placeholder="FV5029-141" />
        </label>
        <label className="block">
          <span className="label">Product id or slug</span>
          <input name="id" defaultValue={id} className="input" placeholder="air-jordan-4-white-navy" />
        </label>
        <div className="md:col-span-3">
          <button type="submit" className="btn-glitch">
            Inspect provider →
          </button>
        </div>
      </form>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.6rem] border border-ink/10 bg-white/82 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">KicksDB search result</div>
          <pre className="mt-4 overflow-x-auto rounded-[1rem] bg-bone-soft p-4 text-xs leading-6 text-ink/78">
            {JSON.stringify(searchResult, null, 2)}
          </pre>
        </div>
        <div className="rounded-[1.6rem] border border-ink/10 bg-white/82 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">KicksDB product detail</div>
          <pre className="mt-4 overflow-x-auto rounded-[1rem] bg-bone-soft p-4 text-xs leading-6 text-ink/78">
            {JSON.stringify(detailResult, null, 2)}
          </pre>
        </div>
        <div className="rounded-[1.6rem] border border-ink/10 bg-white/82 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Nike public fallback search</div>
          <pre className="mt-4 overflow-x-auto rounded-[1rem] bg-bone-soft p-4 text-xs leading-6 text-ink/78">
            {JSON.stringify(nikeSearchResult, null, 2)}
          </pre>
        </div>
        <div className="rounded-[1.6rem] border border-ink/10 bg-white/82 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Nike public fallback product</div>
          <pre className="mt-4 overflow-x-auto rounded-[1rem] bg-bone-soft p-4 text-xs leading-6 text-ink/78">
            {JSON.stringify(nikeDetailResult, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}
