import { db } from '@/lib/db';
import { Badge, Card } from '@/components/ui';
import { CoverageChecker } from './CoverageChecker';

export default async function CoveragePage() {
  const cities = await db.cities.all();
  const areas = await db.serviceAreas.all();

  return (
    <>
      <section className="container-x pt-10 pb-16">
        <Badge className="mb-6">Coverage</Badge>
        <h1 className="h-display text-[clamp(3rem,8vw,7rem)] leading-[0.88] mb-6">
          In your ZIP, <em className="h-italic text-glitch">or on its way.</em>
        </h1>
        <p className="text-ink/70 max-w-2xl text-lg mb-12">
          Enter your ZIP to see if local pickup is live in your area. Every market supports mail-in.
        </p>
        <p className="max-w-2xl text-sm leading-7 text-ink/60">
          Once the route is confirmed, every package above Fresh Start can move into steam-assisted cleaning as part of the deeper service process.
        </p>
        <CoverageChecker />
      </section>

      <section className="container-x pb-24">
        <h2 className="h-display text-3xl mb-8">All active markets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cities.filter(c => c.active).map((city) => {
            const cityAreas = areas.filter((a) => a.cityId === city.id);
            return (
              <Card key={city.id} className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-mono text-xs text-ink/40">{city.state} · {city.timezone}</div>
                    <h3 className="h-display text-4xl">{city.name}</h3>
                  </div>
                  <Badge tone="acid">Live since {new Date(city.launchDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Badge>
                </div>
                <div className="space-y-3 mt-6">
                  {cityAreas.map((area) => (
                    <div key={area.id} className="flex items-center justify-between p-3 bg-bone-soft rounded-lg">
                      <div>
                        <div className="font-semibold text-sm">{area.name}</div>
                        <div className="font-mono text-xs text-ink/50">{area.zips.length} ZIP codes</div>
                      </div>
                      <div className="font-mono text-xs text-ink/70">{area.zips.slice(0, 3).join(' · ')}…</div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
