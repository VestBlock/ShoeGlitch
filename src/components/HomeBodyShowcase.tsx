'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

type ServiceCard = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  basePrice: number;
  priceMin: number | null;
  category: string;
};

type CityCard = {
  id: string;
  name: string;
  state: string;
  active: boolean;
  defaultPickupFee: number;
  defaultRushFee: number;
};

const tierDetails: Record<string, string[]> = {
  basic: ['Steam Clean baseline', 'Sole + lace refresh', 'Fastest entry route'],
  pro: ['De-crease method', 'Detail correction', 'Light touch-up support'],
  elite: ['Ice method access', 'Luxury restoration path', 'Highest-detail finish'],
};

const journeySteps = [
  {
    eyebrow: '01',
    title: 'Find the pair',
    detail: 'Start from your own closet, a release watch, or a pair that needs a comeback.',
  },
  {
    eyebrow: '02',
    title: 'Choose the route',
    detail: 'Pickup, drop-off, or nationwide mail-in depending on where you are.',
  },
  {
    eyebrow: '03',
    title: 'Track the clean',
    detail: 'Intake notes, photos, and service status stay visible from start to finish.',
  },
  {
    eyebrow: '04',
    title: 'Bring it back out',
    detail: 'A cleaner rotation is the outcome, not just another closed order.',
  },
] as const;

export default function HomeBodyShowcase({
  services,
  cities,
  activeCityCount,
}: {
  services: ServiceCard[];
  cities: CityCard[];
  activeCityCount: number;
}) {
  return (
    <section className="container-x space-y-16 py-16 md:space-y-20 md:py-20">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="section-shell p-7 md:p-8 lg:sticky lg:top-28 lg:h-fit"
        >
          <div className="section-kicker">Choose your care level</div>
          <h2 className="h-display mt-5 text-[clamp(2.9rem,5vw,5.2rem)] leading-[0.88] text-ink">
            A cleaner route
            <br />
            from <em className="h-italic text-glitch">yes</em> to checkout.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-ink/65 md:text-base">
            Choose the right level of care quickly, understand what each tier is for, and move into booking without digging through a long list of add-ons first.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              ['Three clear options', 'Basic, Pro, and Elite make it easier to choose the right level of care.'],
              ['Real before-and-after proof', 'Actual results sit next to the offer so the work is easy to trust.'],
              ['Local and nationwide', 'Use pickup or drop-off where available, or ship pairs in from anywhere.'],
            ].map(([title, detail]) => (
              <div
                key={title}
                className="rounded-[1.2rem] border border-ink/10 bg-bone-soft/72 px-4 py-4 shadow-[0_14px_34px_rgba(10,15,31,0.05)]"
              >
                <div className="text-sm font-semibold text-ink">{title}</div>
                <div className="mt-1 text-sm leading-6 text-ink/60">{detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn-glitch">
              Start booking →
            </Link>
            <Link href="/services" className="btn-outline">
              Compare tiers →
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-5">
          {services.map((service, index) => {
            const items = tierDetails[service.slug] ?? [
              'Service-specific care',
              'Tracked intake flow',
              'Built into the main booking path',
            ];

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: Math.min(index * 0.08, 0.2),
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -8, rotateX: -1.5, rotateY: 2.5 }}
                className="group"
              >
                <Link
                  href={`/book?service=${service.slug}`}
                  className="relative grid overflow-hidden rounded-[2rem] border border-ink/10 bg-white/86 p-6 shadow-[0_24px_70px_rgba(10,15,31,0.08)] transition duration-300 hover:border-glitch/20 hover:shadow-[0_32px_90px_rgba(10,15,31,0.14)] [perspective:1800px] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-end md:p-7"
                >
                  <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_26%,rgba(0,229,255,0.12),transparent_24%),radial-gradient(circle_at_20%_78%,rgba(255,77,109,0.10),transparent_28%)] opacity-90" />
                  <div className="relative">
                    <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-glitch/82">
                      0{index + 1} · {service.category}
                    </div>
                    <h3 className="h-display mt-4 text-[clamp(2.4rem,4vw,4rem)] leading-[0.9] text-ink transition group-hover:text-glitch">
                      {service.name}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-7 text-ink/62 md:text-base">
                      {service.tagline}
                    </p>
                  </div>

                  <div className="relative mt-6 grid gap-4 md:mt-0 md:justify-items-end">
                    <div className="w-full max-w-[24rem] rounded-[1.4rem] border border-ink/10 bg-bone-soft/78 p-4 shadow-[0_14px_34px_rgba(10,15,31,0.05)]">
                      <div className="text-[11px] uppercase tracking-[0.28em] text-ink/48">What it includes</div>
                      <div className="mt-4 grid gap-2">
                        {items.map((item) => (
                          <div
                            key={item}
                            className="rounded-full border border-ink/10 bg-white/84 px-4 py-2 text-sm text-ink/70"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex w-full max-w-[24rem] items-end justify-between rounded-[1.4rem] border border-ink/10 bg-ink px-5 py-4 text-bone shadow-[0_22px_60px_rgba(10,15,31,0.18)]">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.28em] text-bone/48">Starts at</div>
                        <div className="h-display mt-2 text-4xl">${service.priceMin ?? service.basePrice}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-[0.28em] text-cyan/84">Next</div>
                        <div className="mt-2 text-lg font-semibold text-cyan">Book this tier →</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="section-shell-dark overflow-hidden p-7 md:p-8"
        >
          <div className="relative z-10">
            <div className="section-kicker border-white/12 bg-white/8 text-cyan">Pickup, drop-off, and mail-in</div>
            <h2 className="h-display mt-5 text-[clamp(2.6rem,4.8vw,4.8rem)] leading-[0.9] text-bone">
              Local handoff
              <br />
              <em className="h-italic text-cyan">meets</em> nationwide mail-in.
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['Active cities', String(activeCityCount), 'Local pickup + drop-off'],
                ['Mail-in', 'Nationwide', 'Prepaid label flow'],
                ['Home hub', 'Brookfield', 'Inbound route anchor'],
              ].map(([label, value, detail]) => (
                <div key={label} className="rounded-[1.3rem] border border-white/10 bg-white/6 p-4">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-bone/52">{label}</div>
                  <div className="mt-3 h-display text-4xl text-bone">{value}</div>
                  <div className="mt-2 text-sm leading-6 text-bone/62">{detail}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/6 p-4 md:p-5">
              <div className="text-[11px] uppercase tracking-[0.3em] text-cyan/84">How it works</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {journeySteps.map((step) => (
                  <div key={step.title} className="rounded-[1.2rem] border border-white/10 bg-ink/36 p-4">
                    <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/44">{step.eyebrow}</div>
                    <div className="mt-2 text-lg font-semibold text-bone">{step.title}</div>
                    <div className="mt-2 text-sm leading-6 text-bone/60">{step.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-4"
        >
          <div className="section-shell p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-glitch/80">Where we serve</div>
                <h3 className="h-display mt-3 text-4xl leading-[0.92] text-ink">Cities open for local handoff.</h3>
              </div>
              <Link href="/locations" className="btn-outline">
                All locations →
              </Link>
            </div>

            <div className="mt-6 grid gap-3">
              {cities.slice(0, 4).map((city, index) => (
                <div
                  key={city.id}
                  className={`grid items-center gap-4 rounded-[1.3rem] border px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto_auto] ${
                    city.active
                      ? 'border-glitch/18 bg-white shadow-[0_14px_34px_rgba(10,15,31,0.05)]'
                      : 'border-ink/10 bg-bone-soft/76'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-ink text-sm font-semibold text-bone">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-ink">
                        {city.name}, {city.state}
                      </div>
                      <div className="text-sm text-ink/56">
                        {city.active ? 'Pickup and drop-off live' : 'Coverage building'}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-ink/62">
                    <div>Pickup ${city.defaultPickupFee}</div>
                    <div>Rush ${city.defaultRushFee}</div>
                  </div>

                  <div
                    className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${
                      city.active
                        ? 'bg-glitch text-white shadow-[0_12px_30px_rgba(255,77,109,0.18)]'
                        : 'border border-ink/10 bg-white text-ink/48'
                    }`}
                  >
                    {city.active ? 'Live' : 'Soon'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="section-shell p-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-glitch/80">Operators</div>
              <h3 className="h-display mt-3 text-3xl leading-[0.92] text-ink">Build with ShoeGlitch.</h3>
              <p className="mt-3 text-sm leading-6 text-ink/62">
                Join a cleaner, more organized operator flow instead of chasing random one-off jobs.
              </p>
              <Link href="/operator" className="btn-glitch mt-6">
                Apply now →
              </Link>
            </div>

            <div className="section-shell p-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-glitch/80">Release alerts</div>
              <h3 className="h-display mt-3 text-3xl leading-[0.92] text-ink">Track pairs before they sell through.</h3>
              <p className="mt-3 text-sm leading-6 text-ink/62">
                Save upcoming pairs, follow restocks, and come back when it is time to buy, clean, or restore.
              </p>
              <Link href="/intelligence" className="btn-outline mt-6">
                Open intelligence →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
