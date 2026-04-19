import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge, Card, ProgressBar, StatusDot } from '@/components/ui';

export default async function HomePage() {
  const cities = await db.cities.all();
  const allServices = await db.services.primary();
  const services = allServices.filter(s => s.category !== 'luxury').slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden bg-bone">
        <div className="absolute inset-0 matrix-strip opacity-30 pointer-events-none" />
        <div className="container-x relative pt-10 pb-24 md:pt-14 md:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <Badge tone="dark" className="mb-6">
                <StatusDot tone="live" /> Built in Milwaukee · Serving 3 cities
              </Badge>
              <h1 className="h-display text-[clamp(3rem,8.5vw,7.5rem)] leading-[0.88] tracking-tight">
                Your shoes, <em className="h-italic text-glitch">reborn.</em>
                <br />
                City by city.
              </h1>
              <p className="mt-8 text-lg text-ink/70 max-w-xl">
                Shoe Glitch is the premium cleaning, restoration, and sole-color marketplace.
                Book a local pickup, drop-off, or mail them in from anywhere.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/book" className="btn-glitch">Book a clean →</Link>
                <Link href="/coverage" className="btn-outline">Check your ZIP</Link>
                <Link href="/services" className="btn-ghost">See services</Link>
              </div>
            </div>

            <div className="md:col-span-5 relative flex justify-center">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-hero.png"
                  alt="Shoe Glitch"
                  className="w-full max-w-md drop-shadow-[0_20px_40px_rgba(30,144,255,0.4)]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-y border-glitch/20 bg-ink text-bone overflow-hidden relative">
          <div className="absolute inset-0 matrix-strip opacity-40" />
          <div className="track py-5 relative">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-12 pr-12 whitespace-nowrap">
                {['FRESH START', 'FULL RESET', 'FABRIC RESCUE', 'REVIVAL', 'ICE RECOVERY', 'SOLE COLOR', 'RED BOTTOM', 'STREET SHIELD', 'LACE LAB'].map((t) => (
                  <span key={t} className="h-display text-4xl md:text-5xl flex items-center gap-12">
                    <span>{t}</span>
                    <span className="text-cyan">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <Badge className="mb-4">Live right now</Badge>
            <h2 className="h-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] mb-6">
              Real jobs. <em className="h-italic">Real tracking.</em>
            </h2>
            <p className="text-ink/70 max-w-md mb-6">
              Every order gets a unique code, a tracked status pipeline, and a dedicated cleaner.
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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <Badge className="mb-4">01 — The menu</Badge>
            <h2 className="h-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] max-w-2xl">
              Named. <em className="h-italic">Priced.</em> No guesswork.
            </h2>
          </div>
          <Link href="/services" className="btn-outline shrink-0">See everything →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <Link key={s.id} href={`/book?service=${s.slug}`} className="card card-lift p-6 flex flex-col justify-between min-h-[260px] group">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="font-mono text-xs text-ink/40">0{i + 1}</span>
                  <Badge tone={s.category === 'luxury' ? 'glitch' : 'default'}>{s.category}</Badge>
                </div>
                <h3 className="h-display text-3xl mb-2 group-hover:text-glitch transition">{s.name}</h3>
                <p className="text-sm text-ink/60">{s.tagline}</p>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-ink/40">from</div>
                  <div className="h-display text-3xl">${s.priceMin ?? s.basePrice}</div>
                </div>
                <span className="text-ink/40 group-hover:text-glitch group-hover:translate-x-1 transition-all text-2xl">→</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {cities.map((c, i) => (
              <div key={c.id} className={`rounded-card border p-6 hover:border-cyan transition ${i === 0 ? 'border-cyan bg-glitch/10' : 'border-bone/15'}`}>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-bone/40">{c.state}</span>
                  {c.active ? (
                    i === 0 ? <span className="badge-glitch bg-cyan text-ink">HQ · LIVE</span> : <span className="badge-glitch">Live</span>
                  ) : (
                    <span className="badge-dark border-bone/20 text-bone/60">Soon</span>
                  )}
                </div>
                <div className="h-display text-4xl mb-6">{c.name}</div>
                <div className="space-y-1.5 text-xs text-bone/60">
                  <div className="flex justify-between"><span>Pickup fee</span><span className="font-mono text-bone">${c.defaultPickupFee}</span></div>
                  <div className="flex justify-between"><span>Rush fee</span><span className="font-mono text-bone">${c.defaultRushFee}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-16">
        <Card className="p-12 border-2 border-glitch/30 bg-gradient-to-br from-glitch/5 to-cyan/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
