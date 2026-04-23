import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, StatusDot } from '@/components/ui';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { createCityAction, toggleCityActiveAction, updateCityFeesAction } from '../actions';
import { formatDateOnly } from '@/lib/utils';

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === 'string' ? value : null;
}

export default async function AdminCities({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const params = (await searchParams) ?? {};
  const notice = getParam(params, 'notice');
  const error = getParam(params, 'error');
  const cities = await db.cities.all();

  // Preload per-city stats in parallel
  const stats = await Promise.all(
    cities.map(async (c) => {
      const [areas, cleaners, orders] = await Promise.all([
        db.serviceAreas.byCity(c.id),
        db.cleaners.byCity(c.id),
        db.orders.byCity(c.id),
      ]);
      return { cityId: c.id, areas, cleaners, orders };
    }),
  );
  const statMap = new Map(stats.map((s) => [s.cityId, s]));

  return (
    <DashboardShell currentPath="/admin/cities" pageTitle="Cities">
      <p className="text-ink/60 mb-8 max-w-xl">
        Every row is a market. Add new cities, launch or pause coverage, and tune local fees.
      </p>

      {notice ? (
        <Card className="mb-6 border-emerald-400/40 bg-emerald-50/80">
          <div className="flex items-start gap-3 text-sm leading-6 text-emerald-950">
            <StatusDot tone="ok" />
            <div>{notice}</div>
          </div>
        </Card>
      ) : null}

      {error ? (
        <Card className="mb-6 border-red-400/40 bg-red-50/80">
          <div className="flex items-start gap-3 text-sm leading-6 text-red-950">
            <StatusDot tone="error" />
            <div>{error}</div>
          </div>
        </Card>
      ) : null}

      <Card className="p-6 mb-6">
        <div className="flex flex-col gap-2 mb-5">
          <div className="text-xs uppercase tracking-widest text-glitch">Add a city</div>
          <h2 className="h-display text-3xl">Open the next ShoeGlitch market.</h2>
          <p className="text-sm text-ink/60 max-w-2xl">
            Add the city here first, then attach service areas and operators as the market gets ready.
            SEO pages and public coverage automatically use active cities.
          </p>
        </div>
        <form action={createCityAction} className="grid gap-4 lg:grid-cols-4">
          <div>
            <label className="label">City name</label>
            <input name="name" required placeholder="Chicago" className="input" />
          </div>
          <div>
            <label className="label">State</label>
            <input name="state" required maxLength={2} placeholder="IL" className="input uppercase" />
          </div>
          <div>
            <label className="label">Slug</label>
            <input name="slug" placeholder="chicago" className="input" />
          </div>
          <div>
            <label className="label">Timezone</label>
            <select name="timezone" defaultValue="America/Chicago" className="input">
              <option value="America/Chicago">Central</option>
              <option value="America/New_York">Eastern</option>
              <option value="America/Denver">Mountain</option>
              <option value="America/Los_Angeles">Pacific</option>
            </select>
          </div>
          <div>
            <label className="label">Launch date</label>
            <input name="launchDate" required type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="input" />
          </div>
          <div>
            <label className="label">Pickup fee</label>
            <input name="pickup" type="number" min={0} defaultValue={10} className="input" />
          </div>
          <div>
            <label className="label">Rush fee</label>
            <input name="rush" type="number" min={0} defaultValue={25} className="input" />
          </div>
          <div>
            <label className="label">Mail-in return</label>
            <input name="mailin" type="number" min={0} defaultValue={12} className="input" />
          </div>
          <div className="lg:col-span-3">
            <label className="label">Hub address</label>
            <input name="hubAddress" placeholder="Optional until the market is ready" className="input" />
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 text-sm font-semibold">
            <input name="active" type="checkbox" className="h-4 w-4 accent-[var(--glitch)]" />
            Launch immediately
          </label>
          <button className="btn-primary lg:col-span-4">Add city</button>
        </form>
      </Card>

      <div className="space-y-5">
        {cities.map((c) => {
          const s = statMap.get(c.id);
          const areas = s?.areas ?? [];
          const cleaners = s?.cleaners ?? [];
          const orders = s?.orders ?? [];
          return (
            <Card key={c.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="lg:w-1/3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-ink/40">{c.state}</span>
                    {c.active ? <Badge tone="acid"><StatusDot tone="ok" /> LIVE</Badge> : <Badge>PAUSED</Badge>}
                  </div>
                  <div className="h-display text-4xl mb-2">{c.name}</div>
                  <div className="text-xs text-ink/50 space-y-1">
                    <div>Launched {formatDateOnly(c.launchDate)}</div>
                    <div>{c.timezone}</div>
                    {c.hubAddress && <div>Hub: {c.hubAddress}</div>}
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <div className="px-3 py-1.5 rounded-full bg-bone-soft text-xs">{areas.length} zones</div>
                    <div className="px-3 py-1.5 rounded-full bg-bone-soft text-xs">{cleaners.length} cleaners</div>
                    <div className="px-3 py-1.5 rounded-full bg-bone-soft text-xs">{orders.length} orders</div>
                  </div>
                  <form action={toggleCityActiveAction} className="mt-4">
                    <input type="hidden" name="cityId" value={c.id} />
                    <button className={c.active ? 'btn-outline' : 'btn-glitch'}>
                      {c.active ? 'Pause city' : 'Launch city'}
                    </button>
                  </form>
                </div>

                <div className="flex-1">
                  <h4 className="text-xs uppercase tracking-widest text-ink/50 mb-3">Fees</h4>
                  <form action={updateCityFeesAction} className="grid grid-cols-3 gap-3 mb-4">
                    <input type="hidden" name="cityId" value={c.id} />
                    <div>
                      <label className="label">Pickup</label>
                      <input name="pickup" type="number" defaultValue={c.defaultPickupFee} className="input" />
                    </div>
                    <div>
                      <label className="label">Rush</label>
                      <input name="rush" type="number" defaultValue={c.defaultRushFee} className="input" />
                    </div>
                    <div>
                      <label className="label">Mail-in return</label>
                      <input name="mailin" type="number" defaultValue={c.defaultMailInReturnFee} className="input" />
                    </div>
                    <button className="btn-primary col-span-3">Save fees</button>
                  </form>

                  <h4 className="text-xs uppercase tracking-widest text-ink/50 mt-6 mb-3">Service areas</h4>
                  <div className="space-y-2">
                    {areas.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-bone-soft rounded-lg">
                        <div>
                          <div className="font-semibold text-sm">{a.name}</div>
                          <div className="font-mono text-xs text-ink/50">{a.zips.join(' · ')}</div>
                        </div>
                        {a.active ? <Badge tone="acid">ON</Badge> : <Badge>OFF</Badge>}
                      </div>
                    ))}
                    {areas.length === 0 && (
                      <p className="text-sm text-ink/50 italic">No service areas yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
