import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, StatusDot } from '@/components/ui';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { toggleCityActiveAction, updateCityFeesAction } from '../actions';
import { formatDateOnly } from '@/lib/utils';

export default async function AdminCities() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

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
        Every row is a market. Launch, pause, and tune fees.
      </p>

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
