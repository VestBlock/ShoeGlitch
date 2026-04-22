import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge, Card } from '@/components/ui';
import HomeHeroMotion from '@/components/HomeHeroMotion';

export default async function HomePage() {
  const [cities, allServices] = await Promise.all([
    db.cities.all().catch(() => []),
    db.services.primary().catch(() => []),
  ]);
  const services = allServices.filter((service) => service.category !== 'luxury').slice(0, 6);
  const activeCityCount = cities.filter((city) => city.active).length;

  return (
    <>
      <section className="relative overflow-hidden bg-bone">
        <div className="absolute inset-0 matrix-strip opacity-30 pointer-events-none" />
        <div className="container-x relative pt-8 pb-16 md:pt-10 md:pb-24">
          <HomeHeroMotion activeCityCount={activeCityCount} />
        </div>

        <div className="border-y border-glitch/20 bg-ink text-bone overflow-hidden relative">
          <div className="absolute inset-0 matrix-strip opacity-40" />
          <div className="track py-5 relative">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-center gap-12 pr-12 whitespace-nowrap">
                {['FRESH START', 'FULL RESET', 'FABRIC RESCUE', 'REVIVAL', 'ICE RECOVERY', 'SOLE COLOR', 'RED BOTTOM', 'STREET SHIELD', 'LACE LAB'].map((item) => (
                  <span key={item} className="h-display text-4xl md:text-5xl flex items-center gap-12">
                    <span>{item}</span>
                    <span className="text-cyan">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-24">
        <div className="grid grid-cols-1 gap-8 items-center md:grid-cols-2">
          <div>
            <Badge className="mb-4">Live right now</Badge>
            <h2 className="h-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] mb-6">
              Real jobs. <em className="h-italic">Real tracking.</em>
            </h2>
            <p className="text-ink/70 max-w-md mb-6">
              Every order gets a unique code, photo-backed intake notes, a tracked status pipeline, and a dedicated cleaner.
            </p>
            <Link href="/book" className="btn-glitch">Start your order →</Link>
          </div>
          <div className="space-y-4">
            <Card className="card-glitch grain relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-dark border-white/20 text-white">Order SG-AV1029</span>
                  <Badge tone="glitch" className="bg-white text-glitch">In Cleaning</Badge>
                </div>
                <div className="h-display text-3xl mb-1">Travis Scott 1s</div>
                <div className="text-sm text-white/70">Milwaukee · Full Reset + Ice Recovery</div>
                <div className="mt-6">
                  <div className="h-1.5 rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-white w-[55%]" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="flex flex-col gap-6 mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-4">01 — The menu</Badge>
            <h2 className="h-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] max-w-2xl">
              Named. <em className="h-italic">Priced.</em> No guesswork.
            </h2>
          </div>
          <Link href="/services" className="btn-outline shrink-0">See everything →</Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Link key={service.id} href={`/book?service=${service.slug}`} className="card card-lift p-6 flex min-h-[260px] flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="font-mono text-xs text-ink/40">0{index + 1}</span>
                  <Badge tone={service.category === 'luxury' ? 'glitch' : 'default'}>{service.category}</Badge>
                </div>
                <h3 className="h-display text-3xl mb-2 group-hover:text-glitch transition">{service.name}</h3>
                <p className="text-sm text-ink/60">{service.tagline}</p>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-ink/40">from</div>
                  <div className="h-display text-3xl">${service.priceMin ?? service.basePrice}</div>
                </div>
                <span className="text-ink/40 text-2xl transition-all group-hover:text-glitch group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-ink text-bone py-24 relative overflow-hidden">
        <div className="absolute inset-0 matrix-strip opacity-20" />
        <div className="container-x relative">
          <div className="mb-12">
            <Badge tone="dark" className="border-cyan/30 text-cyan mb-4">02 — Where we live</Badge>
            <h2 className="h-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] max-w-2xl">
              Built in Milwaukee. <em className="h-italic text-cyan">Built for everywhere.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {cities.map((city, index) => (
              <div key={city.id} className={`rounded-card border p-6 hover:border-cyan transition ${index === 0 ? 'border-cyan bg-glitch/10' : 'border-bone/15'}`}>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-bone/40">{city.state}</span>
                  {city.active ? (
                    index === 0 ? <span className="badge-glitch bg-cyan text-ink">HQ · LIVE</span> : <span className="badge-glitch">Live</span>
                  ) : (
                    <span className="badge-dark border-bone/20 text-bone/60">Soon</span>
                  )}
                </div>
                <div className="h-display text-4xl mb-6">{city.name}</div>
                <div className="space-y-1.5 text-xs text-bone/60">
                  <div className="flex justify-between"><span>Pickup fee</span><span className="font-mono text-bone">${city.defaultPickupFee}</span></div>
                  <div className="flex justify-between"><span>Rush fee</span><span className="font-mono text-bone">${city.defaultRushFee}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-16">
        <Card className="p-12 border-2 border-glitch/30 bg-gradient-to-br from-glitch/5 to-cyan/10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <Badge tone="glitch" className="mb-4">For operators</Badge>
              <h3 className="h-display text-4xl md:text-5xl mb-3">
                Become a Shoe Glitch operator.
              </h3>
              <p className="text-ink/70 max-w-lg">
                Certified training. Branded equipment kit. Exclusive territory.
              </p>
            </div>
            <Link href="/operator" className="btn-glitch shrink-0">Apply now →</Link>
          </div>
        </Card>
      </section>
    </>
  );
}
