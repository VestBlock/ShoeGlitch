'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const PROOF_STACK = [
  {
    src: '/media/editorial/actual-before-after-1.jpeg',
    alt: 'Actual before and after restoration result on a black and infrared sneaker',
    eyebrow: 'Real result',
    title: 'Side-by-side proof keeps the result easy to judge before checkout.',
  },
] as const;

function ProofCard({
  item,
}: {
  item: (typeof PROOF_STACK)[number];
}) {
  return (
    <motion.figure
      className="proof-card-shell"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <div className="proof-card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.src} alt={item.alt} className="proof-media" loading="lazy" />
      </div>
      <figcaption className="proof-card-copy">
        <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-glitch/85">{item.eyebrow}</div>
        <div className="mt-2 text-sm font-semibold leading-6 text-ink">{item.title}</div>
      </figcaption>
    </motion.figure>
  );
}

export default function EditorialSpotlight() {
  return (
    <section className="container-x py-16 md:py-24">
      <div className="editorial-shell overflow-hidden rounded-[2rem] border border-ink/10 px-5 py-8 shadow-[0_24px_70px_rgba(10,15,31,0.08)] md:px-8 md:py-10 lg:px-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="section-kicker">See the difference</div>
            <h2 className="h-display mt-4 text-5xl leading-none text-ink md:text-7xl">
              See the work
              <br />
              <em className="h-italic text-glitch">before you book.</em>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-ink/64 md:text-base">
              Real before-and-after proof and actual process footage make the result easier to trust before checkout.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/book" className="btn-glitch">
              Book your pair →
            </Link>
            <Link href="/services" className="btn-outline">
              Explore tiers →
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:items-stretch">
          <motion.div
            className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-[#07142c] shadow-[0_30px_80px_rgba(10,15,31,0.18)]"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-full min-h-[420px]">
              <video
                className="proof-video absolute inset-0 h-full w-full"
                src="/media/editorial/actual-process-a.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,44,0.02),rgba(7,20,44,0.0)_40%,rgba(7,20,44,0.32)_100%)]" />
              <div className="absolute left-4 top-4 md:left-5 md:top-5">
                <div className="badge-dark border-white/15">Actual process footage</div>
              </div>
              <div className="absolute inset-x-4 bottom-4 rounded-[1.1rem] border border-white/12 bg-ink/24 px-4 py-4 backdrop-blur-sm md:inset-x-5 md:bottom-5">
                <p className="text-sm leading-6 text-white/78">
                  Real cleaning and restoration footage so the work feels visible before checkout.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-5">
            <div className="grid gap-5">
              {PROOF_STACK.map((item) => (
                <ProofCard key={item.src} item={item} />
              ))}
            </div>
            <div className="rounded-[1.5rem] border border-ink/10 bg-bone-soft/78 px-5 py-5 shadow-[0_14px_34px_rgba(10,15,31,0.05)]">
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-glitch/82">Next step</div>
              <div className="mt-3 text-sm leading-6 text-ink/64">
                Start with Basic for a refresh. Move into Pro or Elite when the pair needs crease correction, icy sole work, or repaint touch-ups.
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-cyan/20 bg-cyan/[0.08] px-5 py-5 shadow-[0_14px_34px_rgba(10,15,31,0.04)]">
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan">Why it matters</div>
              <div className="mt-3 text-sm leading-6 text-ink/64">
                You can see the change clearly before you choose a tier, then book the level of work your pair actually needs.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
