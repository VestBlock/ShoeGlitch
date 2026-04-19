import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { OrdersTable, buildLookups } from '@/components/OrdersTable';
import { Badge, Card, StatusDot } from '@/components/ui';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { suggestCleaners, requiredSpecializations } from '@/lib/assignment';
import { assignCleanerAction } from './actions';

export default async function CityManagerDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'city_manager' && session.role !== 'super_admin') redirect('/login');

  const activeCities = await db.cities.active();
  const cityId = session.cityId ?? activeCities[0]?.id;
  if (!cityId) redirect('/');

  const [city, orders, cleaners] = await Promise.all([
    db.cities.byId(cityId),
    db.orders.byCity(cityId),
    db.cleaners.byCity(cityId),
  ]);
  if (!city) redirect('/');

  // Preload customers + service areas for lookups
  const uniqueCustomerIds = Array.from(new Set(orders.map((o) => o.customerId)));
  const customers = (
    await Promise.all(uniqueCustomerIds.map((id) => db.customers.byId(id)))
  ).filter((c): c is NonNullable<typeof c> => !!c);
  const serviceAreas = await db.serviceAreas.byCity(cityId);
  const areaMap = new Map(serviceAreas.map((a) => [a.id, a]));

  const lookups = buildLookups([city], customers);

  const unassigned = orders.filter((o) => !o.cleanerId && !['completed', 'cancelled'].includes(o.status));
  const active = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const revenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);

  // Pre-compute cleaner suggestions for each unassigned order
  const suggestionsByOrder = new Map<string, Awaited<ReturnType<typeof suggestCleaners>>>();
  for (const o of unassigned) {
    const specs = await requiredSpecializations(o);
    const suggs = await suggestCleaners({
      cityId: o.cityId,
      serviceAreaId: o.serviceAreaId,
      requiredSpecializations: specs,
    });
    suggestionsByOrder.set(o.id, suggs);
  }

  return (
    <DashboardShell currentPath="/city-manager" pageTitle={`${city.name} ops`}>
      <div className="flex items-center gap-3 mb-8">
        <Badge tone="dark"><StatusDot tone="live" /> {city.name}, {city.state}</Badge>
        <Badge tone="acid">{city.active ? 'LIVE' : 'PAUSED'}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <Stat label="Active orders" value={active.length} />
        <Stat label="Unassigned" value={unassigned.length} tone="glitch" />
        <Stat label="Cleaners" value={cleaners.length} />
        <Stat label="Revenue" value={`$${revenue}`} tone="ink" />
      </div>

      <section className="mb-10">
        <h2 className="h-display text-3xl mb-5">Needs assignment</h2>
        {unassigned.length === 0 ? (
          <Card className="p-8 text-center text-ink/50">Every order has a cleaner. Nicely done.</Card>
        ) : (
          <div className="space-y-4">
            {unassigned.map((o) => {
              const customer = lookups.customers.get(o.customerId);
              const primary = o.items.find((i) => !i.isAddOn);
              const suggestions = suggestionsByOrder.get(o.id) ?? [];
              return (
                <Card key={o.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-ink/40">{o.code}</span>
                        <Badge tone="glitch">{o.status.replace(/_/g, ' ')}</Badge>
                        <Badge>{o.fulfillmentMethod}</Badge>
                        {o.isRush && <Badge tone="acid">RUSH</Badge>}
                      </div>
                      <div className="h-display text-2xl">{primary?.serviceName}</div>
                      <div className="text-sm text-ink/60">{customer?.name} · {o.shoeCategory.replace('_', ' ')} × {o.pairCount}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-ink/40">Total</div>
                      <div className="h-display text-2xl">${o.total}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-ink/10">
                    <div className="text-xs uppercase tracking-widest text-ink/40 mb-3">Suggested cleaners</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {suggestions.map(({ cleaner, score, reasons }) => (
                        <form key={cleaner.id} action={assignCleanerAction} className="p-3 rounded-lg border border-ink/10 hover:border-glitch transition">
                          <input type="hidden" name="orderId" value={o.id} />
                          <input type="hidden" name="cleanerId" value={cleaner.id} />
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">{cleaner.name}</span>
                            <span className="font-mono text-xs text-glitch">{score}</span>
                          </div>
                          <div className="text-xs text-ink/50 mb-2">
                            ★ {cleaner.rating} · {cleaner.activeJobCount} active
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {reasons.map((r) => <span key={r} className="text-[10px] px-1.5 py-0.5 bg-bone-soft rounded">{r}</span>)}
                          </div>
                          <button type="submit" className="btn-primary w-full py-2 text-xs">Assign →</button>
                        </form>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="h-display text-3xl mb-5">Cleaners in {city.name}</h2>
        <div className="card p-6 overflow-x-auto">
          <table className="sg">
            <thead>
              <tr>
                <th>Name</th>
                <th>Territories</th>
                <th>Specializations</th>
                <th>Active jobs</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cleaners.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.name}</td>
                  <td className="text-xs font-mono text-ink/60">
                    {c.serviceAreaIds.map((id) => areaMap.get(id)?.name).filter(Boolean).join(', ')}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {c.specializations.map(s => <span key={s} className="badge text-[9px]">{s}</span>)}
                    </div>
                  </td>
                  <td className="font-mono">{c.activeJobCount}</td>
                  <td>★ {c.rating}</td>
                  <td>{c.active ? <Badge tone="acid">Active</Badge> : <Badge>Paused</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="h-display text-3xl mb-5">All orders in {city.name}</h2>
        <OrdersTable orders={orders} hrefBase="/admin/orders" showCustomer lookups={lookups} emptyLabel="No orders yet." />
      </section>
    </DashboardShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: 'glitch' | 'ink' }) {
  const toneClass = tone === 'glitch' ? 'text-glitch' : 'text-ink';
  return (
    <Card className={tone === 'ink' ? 'card-ink' : undefined}>
      <div className={`font-mono text-xs mb-1 ${tone === 'ink' ? 'text-bone/40' : 'text-ink/40'}`}>{label}</div>
      <div className={`h-display text-5xl ${tone === 'ink' ? 'text-bone' : toneClass}`}>{value}</div>
    </Card>
  );
}
