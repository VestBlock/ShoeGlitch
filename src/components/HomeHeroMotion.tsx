'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const primaryMp4Url = '/ShoeTest.mp4?v=6';
const fallbackMp4Url = '/ShoeTest-web.mp4?v=3';
const posterUrl = '/ShoeTest-poster.png?v=6';

const supportCards = [
  {
    title: 'Book pickup or drop-off',
    body: 'Schedule your pair on your time and lock in intake photos before checkout.',
    href: '/book',
    tone: 'primary',
  },
  {
    title: 'Check your service area',
    body: 'See if Shoe Glitch is already live in your city before you start.',
    href: '/coverage',
    tone: 'secondary',
  },
  {
    title: 'Mail-in from anywhere',
    body: 'No local route yet? Send your shoes in and track the clean from intake to finish.',
    href: '/mail-in',
    tone: 'secondary',
  },
] as const;

export default function HomeHeroMotion({
  activeCityCount,
}: {
  activeCityCount: number;
}) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

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
    <div className="relative mx-auto max-w-[1180px]">
      <div className="absolute inset-x-[10%] top-[8%] h-[46%] rounded-[3rem] bg-glitch/8 blur-[120px]" />
      <div className="absolute left-[4%] top-[16%] h-24 w-24 rounded-full bg-cyan/10 blur-[90px]" />
      <div className="absolute right-[12%] top-[10%] h-24 w-24 rounded-full bg-glitch/10 blur-[96px]" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-stretch">
        <div className="relative order-2 flex flex-col rounded-[2rem] border border-ink/10 bg-white/72 p-6 shadow-[0_26px_70px_rgba(10,15,31,0.10)] backdrop-blur-xl lg:order-1 lg:p-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-ink/10 bg-white/75 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-ink/70 shadow-[0_10px_30px_rgba(10,15,31,0.06)] md:text-[11px]">
            <span className="h-2 w-2 rounded-full bg-cyan" />
            Built in Milwaukee · Serving {activeCityCount} cities
          </div>

          <div className="mt-6 max-w-[34rem]">
            <div className="font-mono text-[11px] uppercase tracking-[0.34em] text-glitch/80">
              Premium sneaker care
            </div>
            <h1 className="h-display mt-4 text-[clamp(3.2rem,7vw,5.8rem)] leading-[0.9] tracking-tight text-ink">
              Luxury Care
              <br />
              for Your <em className="h-italic text-glitch">Sneakers.</em>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink/68">
              Pickup, drop-off, or mail-in. Start with intake photos, track every step, and bring your pair back with a cleaner finish and sharper detail.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/book" className="btn-glitch">
              Book a clean →
            </Link>
            <Link href="/coverage" className="btn-outline">
              Check your ZIP
            </Link>
            <Link
              href="/services"
              className="inline-flex min-h-[3.2rem] items-center justify-center px-2 text-base font-semibold text-ink transition hover:text-glitch"
            >
              See services
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {supportCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group rounded-[1.4rem] border p-4 transition ${
                  card.tone === 'primary'
                    ? 'border-glitch/25 bg-glitch/[0.08] shadow-[0_18px_36px_rgba(30,144,255,0.10)]'
                    : 'border-ink/10 bg-white/70 hover:border-glitch/20 hover:bg-white'
                }`}
              >
                <div className="text-sm font-semibold text-ink transition group-hover:text-glitch">
                  {card.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/62">{card.body}</p>
              </Link>
            ))}
          </div>
        </div>

        <motion.div
          className="relative order-1 will-change-transform lg:order-2"
          style={{ transformPerspective: 2200 }}
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
            <div className="relative h-[320px] overflow-hidden rounded-[1.8rem] border border-ink/12 bg-[#07142c] shadow-[0_42px_110px_rgba(10,15,31,0.22)] sm:h-[380px] lg:h-[100%] lg:min-h-[560px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${posterUrl})` }}
              />

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
                className="absolute inset-0 h-full w-full object-cover opacity-[0.96]"
                style={
                  reduceMotion
                    ? undefined
                    : {
                        transform: 'scale(0.98)',
                      }
                }
              >
                <source src={primaryMp4Url} type="video/mp4" />
                <source src={fallbackMp4Url} type="video/mp4" />
              </video>

              <motion.div
                className="pointer-events-none absolute inset-y-0 left-[-24%] w-[44%] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.14),rgba(255,255,255,0))] mix-blend-screen"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        x: ['0%', '165%'],
                      }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 9,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                }
              />

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(90,179,255,0.18),transparent_28%),linear-gradient(180deg,rgba(7,20,44,0.08),rgba(7,20,44,0.02)_34%,rgba(7,20,44,0.10)_70%,rgba(7,20,44,0.30)_100%),linear-gradient(90deg,rgba(7,20,44,0.16),rgba(7,20,44,0.02)_38%,rgba(7,20,44,0.12)_100%)]" />
              <div className="pointer-events-none absolute inset-0 border-[1.5px] border-white/10" />

              <div className="absolute left-4 top-4 z-10 md:left-6 md:top-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-ink/34 px-4 py-2 text-xs font-medium tracking-[0.12em] text-white shadow-[0_10px_30px_rgba(10,15,31,0.18)] backdrop-blur-md md:text-sm">
                  <span className="h-2 w-2 rounded-full bg-cyan" />
                  Luxury care in motion
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 p-4 md:p-5">
                <div className="max-w-[24rem] rounded-[1.35rem] border border-white/18 bg-ink/18 px-4 py-4 shadow-[0_18px_40px_rgba(10,15,31,0.18)] backdrop-blur-sm md:px-5">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/70">Ready to book</div>
                  <div className="mt-2 text-sm leading-6 text-white [text-shadow:0_2px_18px_rgba(7,20,44,0.55)]">
                    Start your order now, then upload intake photos and track the clean from first pickup to final return.
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/book" className="btn-glitch">
                      Book now →
                    </Link>
                    <Link
                      href="/coverage"
                      className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 text-sm font-semibold text-bone backdrop-blur-xl transition hover:border-cyan/40 hover:text-cyan"
                    >
                      Check your ZIP
                    </Link>
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
