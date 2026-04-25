'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const PROOF_STACK = [
  {
    src: '/media/editorial/actual-before-after-1.jpeg',
    alt: 'Actual before and after restoration result on a black and infrared sneaker',
    eyebrow: 'Real result',
    title: 'Your actual finished work should be readable in one glance.',
  },
  {
    src: '/media/editorial/actual-before-after-2.jpeg',
    alt: 'Real close-up before and after sneaker restoration collage',
    eyebrow: 'Close-up proof',
    title: 'Edge cleanup, suede recovery, and detail work need room to breathe.',
  },
  {
    src: '/media/editorial/redbottom-after.png',
    alt: 'Red-bottom luxury restoration after result',
    eyebrow: 'Luxury repaint',
    title: 'Premium restoration should feel separate from the standard clean tiers.',
  },
] as const;

function ProofCard({
  item,
  className = '',
}: {
  item: (typeof PROOF_STACK)[number];
  className?: string;
}) {
  return (
    <motion.figure
      className={`proof-card-shell ${className}`}
      whileHover={{ rotateX: -4, rotateY: 5, y: -6 }}
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const stageRotateX = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? [0, 0, 0] : [11, 0, -10]);
  const stageRotateY = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? [0, 0, 0] : [-7, 0, 7]);
  const stageY = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? [0, 0, 0] : [48, 0, -48]);
  const orbitY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [22, -26]);
  const orbitX = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-12, 18]);
  const orbitRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-8, 10]);

  return (
    <section ref={sectionRef} className="container-x py-16 md:py-24">
      <div className="section-shell editorial-shell p-6 md:p-8 lg:p-10">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="section-kicker">See the difference</div>
            <h2 className="h-display mt-4 text-[clamp(2.8rem,5.4vw,5.4rem)] leading-[0.88] text-ink">
              Real work should feel
              <br />
              <em className="h-italic text-glitch">cinematic, not cropped.</em>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-ink/64 md:text-base">
              Real before-and-after work and process footage so customers can see the quality before they book.
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

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] lg:items-center">
          <motion.div
            className="editorial-stage"
            style={{
              rotateX: stageRotateX,
              rotateY: stageRotateY,
              y: stageY,
              transformPerspective: 2200,
            }}
          >
            <div className="device-stage-shell">
              <div className="device-stage-grid">
                <div className="device-frame device-frame-primary">
                  <div className="device-chrome">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="device-media-screen">
                    <video
                      className="proof-video"
                      src="/media/editorial/actual-process-a.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                  </div>
                  <div className="device-copy">
                    <div className="badge-dark border-white/15">Work in progress</div>
                    <p className="mt-3 text-sm leading-6 text-white/72">
                      Full portrait framing keeps the work visible instead of cutting off the result.
                    </p>
                  </div>
                </div>

                <motion.div
                  className="device-frame device-frame-secondary"
                  style={{
                    y: orbitY,
                    x: orbitX,
                    rotate: orbitRotate,
                    transformPerspective: 1800,
                  }}
                >
                  <div className="device-copy h-full flex flex-col justify-between">
                    <div>
                      <div className="badge-dark border-white/15">What matters most</div>
                      <h3 className="mt-4 h-display text-3xl leading-[0.94] text-bone">
                        One strong motion focal point.
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-white/72">
                        The moving process clip should carry the story. The rest of the proof should support the booking decision, not compete with it.
                      </p>
                    </div>
                    <div className="mt-5 space-y-2 text-sm leading-6 text-white/68">
                      <p>Readable before-and-after proof</p>
                      <p>Actual process footage</p>
                      <p>Luxury repaint results near Elite</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
            <div className="proof-stack-grid">
              <ProofCard item={PROOF_STACK[0]} />
              <ProofCard item={PROOF_STACK[1]} className="lg:translate-x-10" />
            </div>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
              <ProofCard item={PROOF_STACK[2]} />
              <div className="section-outline-dark relative overflow-hidden p-5 md:p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(0,229,255,0.18),transparent_22%),radial-gradient(circle_at_10%_100%,rgba(255,77,109,0.18),transparent_28%)]" />
                <div className="relative z-10">
                  <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan/80">Why people trust it</div>
                  <h3 className="h-display mt-4 text-3xl leading-[0.94] text-bone">
                    More depth.
                    <br />
                    Less reading.
                  </h3>
                  <div className="mt-5 space-y-3 text-sm leading-6 text-bone/68">
                    <p>Real before-and-after proof</p>
                    <p>Luxury repaint results</p>
                    <p>Visible process footage</p>
                    <p>Cleaner booking flow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
