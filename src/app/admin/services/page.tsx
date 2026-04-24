import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card } from '@/components/ui';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { updateCityPricingAction, updateBasePriceAction } from '../actions';

export default async function AdminServices() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const [allServices, cities] = await Promise.all([db.services.all(), db.cities.active()]);
  const services = allServices.filter((service) => service.active);

  // Preload all pricing overrides in one fetch per service
  const overrides = await Promise.all(
    services.flatMap((s) =>
      cities.map(async (c) => {
        const o = await db.cityPricing.find(c.id, s.id);
        return { serviceId: s.id, cityId: c.id, override: o };
      }),
    ),
  );
  const overrideMap = new Map(
    overrides.map((o) => [`${o.serviceId}:${o.cityId}`, o.override]),
  );

  return (
    <DashboardShell currentPath="/admin/services" pageTitle="Services & pricing">
      <p className="text-ink/60 mb-8 max-w-xl">
        Edit the live Basic, Pro, Elite, and add-on prices once; override per city as markets demand.
      </p>

      <div className="space-y-5">
        {services.map((s) => (
          <Card key={s.id} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="lg:w-1/3">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge tone={s.category === 'luxury' ? 'glitch' : 'default'}>{s.category}</Badge>
                  {s.isAddOn && <Badge>Add-on</Badge>}
                  {s.rushEligible && <Badge tone="acid">Rush OK</Badge>}
                </div>
                <div className="h-display text-3xl mb-2">{s.name}</div>
                <p className="text-sm text-ink/60 italic mb-2">{s.tagline}</p>
                <p className="text-xs text-ink/50">{s.description}</p>

                <form action={updateBasePriceAction} className="mt-4 flex items-end gap-2">
                  <div>
                    <label className="label">Base price</label>
                    <input name="basePrice" type="number" defaultValue={s.basePrice} className="input w-24" />
                  </div>
                  <input type="hidden" name="serviceId" value={s.id} />
                  <button className="btn-primary py-2 text-xs">Save</button>
                </form>
              </div>

              <div className="flex-1">
                <h4 className="text-xs uppercase tracking-widest text-ink/50 mb-3">City overrides</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {cities.map((c) => {
                    const override = overrideMap.get(`${s.id}:${c.id}`);
                    return (
                      <form key={c.id} action={updateCityPricingAction} className="p-4 bg-bone-soft rounded-lg">
                        <input type="hidden" name="cityId" value={c.id} />
                        <input type="hidden" name="serviceId" value={s.id} />
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-sm">{c.name}</div>
                          <div className="text-xs text-ink/50">base ${s.basePrice}</div>
                        </div>
                        <div className="flex gap-2">
                          <input
                            name="override"
                            type="number"
                            defaultValue={override?.overridePrice ?? ''}
                            placeholder="—"
                            className="input text-sm py-2"
                          />
                          <button className="btn-primary py-2 px-3 text-xs">Set</button>
                        </div>
                      </form>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
