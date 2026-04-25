'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const primaryMp4Url = '/ShoeTest.mp4?v=6';
const fallbackMp4Url = '/ShoeTest-web.mp4?v=3';
const posterUrl = '/ShoeTest-poster.png?v=6';

export default function HomeHeroMotion({
  activeCityCount,
}: {
  activeCityCount: number;
}) {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end start'],
  });
  const shellY = useTransform(scrollYProgress, reduceMotion ? [0, 1] : [0, 1], reduceMotion ? [0, 0] : [0, 80]);
  const shellRotate = useTransform(scrollYProgress, reduceMotion ? [0, 1] : [0, 1], reduceMotion ? [0, 0] : [0, -4]);
  const copyY = useTransform(scrollYProgress, reduceMotion ? [0, 1] : [0, 1], reduceMotion ? [0, 0] : [0, 30]);
  const orbitY = useTransform(scrollYProgress, reduceMotion ? [0, 1] : [0, 1], reduceMotion ? [0, 0] : [0, -46]);
  const orbitRotate = useTransform(scrollYProgress, reduceMotion ? [0, 1] : [0, 1], reduceMotion ? [0, 0] : [0, 12]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let playbackCheck: number | undefined;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const tryPlay = () => {
      void video.play().catch(() => {
        setAutoplayBlocked(true);
      });
    };

    tryPlay();

    playbackCheck = window.setTimeout(() => {
      const current = videoRef.current;
      if (current && current.currentTime < 0.08) {
        setAutoplayBlocked(true);
      }
    }, 1400);

    const onVisibilityChange = () => {
      if (!document.hidden) {
        tryPlay();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (playbackCheck) {
        window.clearTimeout(playbackCheck);
      }
    };
  }, []);

  return (
    <div ref={stageRef} className="relative mx-auto max-w-[1180px]">
      <div className="absolute inset-x-[10%] top-[2%] h-[56%] rounded-[3rem] bg-glitch/8 blur-[120px]" />
      <div className="absolute left-[4%] top-[10%] h-24 w-24 rounded-full bg-cyan/10 blur-[90px]" />
      <div className="absolute right-[12%] top-[6%] h-24 w-24 rounded-full bg-glitch/10 blur-[96px]" />
      <motion.div
        className="float-orbit absolute right-[10%] top-[12%] hidden h-20 w-20 rounded-full border border-glitch/15 bg-white/45 lg:block"
        style={{ y: orbitY, rotate: orbitRotate }}
      />
      <motion.div
        className="absolute left-[4%] bottom-[18%] hidden h-28 w-28 rounded-full border border-cyan/18 bg-white/28 blur-[1px] lg:block"
        style={{ y: orbitY, rotate: shellRotate }}
      />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center">
        <motion.div
          className="relative order-2 flex flex-col lg:order-1"
          style={{ y: copyY }}
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-ink/10 bg-white/78 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-ink/70 shadow-[0_10px_30px_rgba(10,15,31,0.06)] md:text-[11px]">
            <span className="h-2 w-2 rounded-full bg-cyan" />
            Built in Milwaukee · Serving {activeCityCount} cities
          </div>

          <div className="mt-7 max-w-[31rem]">
            <div className="font-mono text-[11px] uppercase tracking-[0.34em] text-glitch/80">
              Premium sneaker care
            </div>
            <h1 className="h-display mt-4 text-[clamp(3.4rem,7vw,6.1rem)] leading-[0.88] tracking-tight text-ink">
              Cleaned.
              <br />
              Restored.
              <br />
              <em className="h-italic text-glitch">Tracked.</em>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-ink/66">
              Local pickup and drop-off where we operate, plus nationwide mail-in for everyone else. Choose Basic, Pro, or Elite and follow the pair from intake to return.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/book" className="btn-glitch">
              Book now →
            </Link>
            <Link href="/services" className="btn-outline">
              See tiers
            </Link>
            <Link
              href="/mail-in"
              className="inline-flex min-h-[3.2rem] items-center justify-center px-2 text-base font-semibold text-ink transition hover:text-glitch"
            >
              Mail-in nationwide
            </Link>
          </div>

          <div className="mt-8 grid max-w-[38rem] gap-3 sm:grid-cols-3">
            {[
              ['Basic', 'Routine refresh'],
              ['Pro', 'Correction + touch-up'],
              ['Elite', 'Restoration path'],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-[1.25rem] border border-ink/10 bg-white/72 p-4 shadow-[0_14px_28px_rgba(10,15,31,0.04)] backdrop-blur-xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/46">{title}</div>
                <div className="mt-2 text-sm font-semibold text-ink">{detail}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative order-1 will-change-transform lg:order-2"
          style={{ transformPerspective: 2200, y: shellY, rotateZ: shellRotate }}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -5, 0],
                  rotateX: [0, 1.2, 0],
                  rotateY: [0, -1.8, 0],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 12,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        >
          <div className="rounded-[2.2rem] border border-ink/10 bg-white/56 p-3 shadow-[0_28px_90px_rgba(10,15,31,0.12)] backdrop-blur-xl">
            <div className="relative h-[360px] overflow-hidden rounded-[1.8rem] border border-ink/12 bg-[#07142c] shadow-[0_42px_110px_rgba(10,15,31,0.22)] sm:h-[430px] lg:h-[100%] lg:min-h-[620px]">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={posterUrl}
                onLoadedData={() => setAutoplayBlocked(false)}
                onTimeUpdate={() => setAutoplayBlocked(false)}
                onPlaying={() => setAutoplayBlocked(false)}
                onCanPlay={() => {
                  const video = videoRef.current;
                  if (video && video.paused) {
                    void video.play().catch(() => {
                      setAutoplayBlocked(true);
                    });
                  }
                }}
                className="absolute inset-0 h-full w-full object-cover opacity-[0.98]"
              >
                <source src={primaryMp4Url} type="video/mp4" />
                <source src={fallbackMp4Url} type="video/mp4" />
              </video>

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,44,0.04),rgba(7,20,44,0.0)_42%,rgba(7,20,44,0.12)_72%,rgba(7,20,44,0.26)_100%)]" />
              <div className="pointer-events-none absolute inset-0 border-[1.5px] border-white/10" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07142c]/78 via-[#07142c]/18 to-transparent" />

              <div className="absolute left-4 top-4 z-10 md:left-6 md:top-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-ink/18 px-4 py-2 text-xs font-medium tracking-[0.16em] text-white shadow-[0_10px_30px_rgba(10,15,31,0.18)] backdrop-blur-sm md:text-sm">
                  <span className="h-2 w-2 rounded-full bg-cyan" />
                  Real client work
                </div>
              </div>

              <div className="absolute inset-x-4 bottom-4 z-10 md:inset-x-6 md:bottom-6">
                <div className="max-w-[36rem] rounded-[1.35rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,20,44,0.16),rgba(7,20,44,0.28))] px-5 py-4 shadow-[0_20px_50px_rgba(10,15,31,0.24)] backdrop-blur-sm">
                  <div
                    className="max-w-[26rem] text-[clamp(1.7rem,3vw,2.7rem)] font-semibold uppercase leading-[0.94] tracking-[0.1em] text-white [text-wrap:balance]"
                    style={{
                      fontVariationSettings: '"wght" 700',
                      textShadow:
                        '0 1px 0 rgba(255,255,255,0.16), 0 2px 0 rgba(255,255,255,0.09), 0 14px 22px rgba(0,0,0,0.36), 0 22px 46px rgba(0,0,0,0.28)',
                    }}
                  >
                    From worn out to{' '}
                    <span className="bg-[linear-gradient(90deg,#ffffff_0%,#bdf7ff_42%,#ffffff_100%)] bg-clip-text text-transparent">
                      box fresh again.
                    </span>
                  </div>
                </div>
              </div>

              {autoplayBlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    const video = videoRef.current;
                    if (!video) return;

                    video.muted = true;
                    void video.play().then(() => setAutoplayBlocked(false)).catch(() => {
                      setAutoplayBlocked(true);
                    });
                  }}
                  className="absolute inset-x-0 top-1/2 z-20 mx-auto flex w-fit -translate-y-1/2 items-center gap-3 rounded-full border border-white/18 bg-ink/66 px-5 py-3 text-sm font-semibold text-bone shadow-[0_18px_40px_rgba(10,15,31,0.34)] backdrop-blur-xl transition hover:border-cyan/40 hover:text-cyan"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan text-ink">▶</span>
                  Tap to play motion
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
