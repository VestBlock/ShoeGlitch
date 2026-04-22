import { Badge } from '@/components/ui';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import {
  compareSneaksProduct,
  compareSneaksSearch,
  getSneakerProduct,
  searchSneakers,
} from '@/features/intelligence/provider-service';
import { runWatchlistScanAction } from '@/app/admin/intelligence/actions';

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
  const sneaksSearchResult =
    query || sku ? await compareSneaksSearch({ query: query || undefined, sku: sku || undefined, limit: 5 }) : null;
  const sneaksDetailResult = id ? await compareSneaksProduct(id) : null;

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
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Sneaks-API search comparison</div>
          <pre className="mt-4 overflow-x-auto rounded-[1rem] bg-bone-soft p-4 text-xs leading-6 text-ink/78">
            {JSON.stringify(sneaksSearchResult, null, 2)}
          </pre>
        </div>
        <div className="rounded-[1.6rem] border border-ink/10 bg-white/82 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Sneaks-API product comparison</div>
          <pre className="mt-4 overflow-x-auto rounded-[1rem] bg-bone-soft p-4 text-xs leading-6 text-ink/78">
            {JSON.stringify(sneaksDetailResult, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}
