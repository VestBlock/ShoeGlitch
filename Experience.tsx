"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type Phase = "idle" | "water" | "foam" | "steam" | "clean";

const DROP_COUNT = 18;
const FOAM_COUNT = 16;
const STEAM_COUNT = 14;
const DUST_COUNT = 26;
const SPARK_COUNT = 10;


function SneakerArt({ clean }: { clean: boolean }) {
  return (
    <svg
      viewBox="0 0 900 520"
      className="h-auto w-full drop-shadow-[0_30px_100px_rgba(0,229,255,0.14)]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shoeBase" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={clean ? "#f8fbff" : "#6f7888"} />
          <stop offset="55%" stopColor={clean ? "#dce8f8" : "#485164"} />
          <stop offset="100%" stopColor={clean ? "#8dbdff" : "#1f2937"} />
        </linearGradient>

        <linearGradient id="soleBase" x1="0%" x2="100%">
          <stop offset="0%" stopColor={clean ? "#ffffff" : "#99a1b2"} />
          <stop offset="100%" stopColor={clean ? "#c9f7ff" : "#4b5563"} />
        </linearGradient>

        <radialGradient id="glowPulse" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(0,229,255,0.95)" />
          <stop offset="55%" stopColor="rgba(30,144,255,0.28)" />
          <stop offset="100%" stopColor="rgba(30,144,255,0)" />
        </radialGradient>

        <filter id="dirtyNoise" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            seed="8"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0.38
                    0 0 0 0 0.23
                    0 0 0 0 0.12
                    0 0 0 0.85 0"
          />
        </filter>

        <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>

        <clipPath id="shoeClip">
          <path d="M142 290c34-16 88-40 120-96 24-43 53-58 103-62 65-5 116 7 174 48 39 28 78 72 118 90 27 12 61 16 92 21 34 5 55 22 56 51 0 22-15 38-39 48-17 7-42 11-74 11H157c-61 0-103-23-103-58 0-22 19-41 52-53 12-4 25-8 36-12Z" />
        </clipPath>
      </defs>

      {clean && (
        <g opacity="0.9">
          <ellipse cx="475" cy="240" rx="280" ry="150" fill="url(#glowPulse)" />
        </g>
      )}

      <motion.g
        initial={false}
        animate={{
          scale: clean ? 1.01 : 1,
          rotate: clean ? -1 : 0,
          y: clean ? -4 : 0,
        }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <ellipse cx="460" cy="408" rx="300" ry="28" fill="rgba(9,15,31,0.7)" />
        <ellipse
          cx="460"
          cy="416"
          rx="248"
          ry="14"
          fill="rgba(0,229,255,0.10)"
          filter="url(#softBlur)"
        />

        <g>
          <path
            d="M142 290c34-16 88-40 120-96 24-43 53-58 103-62 65-5 116 7 174 48 39 28 78 72 118 90 27 12 61 16 92 21 34 5 55 22 56 51 0 22-15 38-39 48-17 7-42 11-74 11H157c-61 0-103-23-103-58 0-22 19-41 52-53 12-4 25-8 36-12Z"
            fill="url(#shoeBase)"
            stroke={clean ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.08)"}
            strokeWidth="3"
          />
          <path
            d="M203 313c34-11 65-36 89-67 26-34 55-49 95-53 56-5 96 5 144 39 36 25 67 61 100 77 22 10 49 15 73 19 24 4 39 11 46 22 5 9-3 18-24 25-18 6-47 9-86 9H255c-58 0-87-17-52-36Z"
            fill={clean ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.05)"}
          />
          <path
            d="M96 332c18 23 50 38 93 38h525c28 0 55-4 73-11 12-5 20-11 24-18l13 15c6 8 9 17 9 27 0 31-39 47-116 47H167c-75 0-123-15-132-39-5-14-1-28 12-42l49-17Z"
            fill="url(#soleBase)"
          />
          <path
            d="M125 345h635"
            stroke={clean ? "rgba(30,144,255,0.45)" : "rgba(255,255,255,0.12)"}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M651 198c34 30 60 62 94 80"
            stroke={clean ? "rgba(0,229,255,0.65)" : "rgba(255,255,255,0.10)"}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M286 264c32-8 73-7 113 2 39 9 79 10 115 4"
            stroke={clean ? "rgba(255,255,255,0.48)" : "rgba(255,255,255,0.10)"}
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M333 226c19 6 38 7 58 4M377 212c21 7 42 8 64 4M425 203c21 7 44 8 67 3"
            stroke={clean ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.18)"}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M263 246c15-13 31-20 52-24"
            stroke={clean ? "rgba(0,229,255,0.65)" : "rgba(255,255,255,0.08)"}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="694" cy="164" r="13" fill={clean ? "#00E5FF" : "#465061"} />
          <path
            d="M668 167h55"
            stroke={clean ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.10)"}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M716 166h40"
            stroke={clean ? "rgba(0,229,255,0.85)" : "rgba(255,255,255,0.10)"}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        {!clean && (
          <g clipPath="url(#shoeClip)">
            <rect
              x="120"
              y="120"
              width="660"
              height="280"
              filter="url(#dirtyNoise)"
              opacity="0.65"
            />
            <ellipse cx="314" cy="331" rx="150" ry="50" fill="rgba(91,52,22,0.28)" />
            <ellipse cx="570" cy="286" rx="138" ry="46" fill="rgba(79,43,17,0.22)" />
          </g>
        )}
      </motion.g>
    </svg>
  );
}

function StatusPill({ phase }: { phase: Phase }) {
  const label =
    phase === "idle"
      ? "Ready for the wash cycle"
      : phase === "water"
        ? "Flooding the grime"
        : phase === "foam"
          ? "Breaking down the dirt"
          : phase === "steam"
            ? "Heat-finishing the detail"
            : "Factory-fresh finish";

  return (
    <motion.div
      key={label}
      initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
      transition={{ duration: 0.45 }}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-bone-200 backdrop-blur-md"
    >
      <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(0,229,255,0.8)]" />
      {label}
    </motion.div>
  );
}

export default function Experience() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const startSequence = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setPhase("water");
    setCycle((value) => value + 1);

    const schedule = (delay: number, next: Phase) => {
      const id = window.setTimeout(() => setPhase(next), delay);
      timeouts.current.push(id);
    };

    schedule(1000, "foam");
    schedule(2350, "steam");
    schedule(3800, "clean");

    const resetId = window.setTimeout(() => {
      setIsRunning(false);
    }, 4600);
    timeouts.current.push(resetId);
  };

  const resetScene = () => {
    timeouts.current.forEach((id) => window.clearTimeout(id));
    timeouts.current = [];
    setPhase("idle");
    setIsRunning(false);
    setCycle((value) => value + 1);
  };

  const droplets = useMemo(
    () =>
      Array.from({ length: DROP_COUNT }, (_, i) => ({
        id: i,
        left: 8 + i * 4.8,
        duration: 0.85 + (i % 5) * 0.12,
        delay: (i % 6) * 0.08,
        height: 28 + (i % 4) * 8,
      })),
    [],
  );

  const foam = useMemo(
    () =>
      Array.from({ length: FOAM_COUNT }, (_, i) => ({
        id: i,
        size: 22 + (i % 5) * 10,
        left: 12 + i * 4.7,
        bottom: 10 + (i % 4) * 5,
        delay: (i % 5) * 0.09,
      })),
    [],
  );

  const steam = useMemo(
    () =>
      Array.from({ length: STEAM_COUNT }, (_, i) => ({
        id: i,
        left: 16 + i * 4.5,
        width: 60 + (i % 4) * 18,
        delay: (i % 6) * 0.18,
      })),
    [],
  );

  const dust = useMemo(
    () =>
      Array.from({ length: DUST_COUNT }, (_, i) => ({
        id: i,
        top: 22 + (i * 11) % 52,
        left: 10 + (i * 7) % 76,
        size: 4 + (i % 3) * 2,
        duration: 2.6 + (i % 5) * 0.4,
      })),
    [],
  );

  const sparks = useMemo(
    () =>
      Array.from({ length: SPARK_COUNT }, (_, i) => ({
        id: i,
        top: 28 + (i * 9) % 45,
        left: 16 + (i * 8) % 70,
        delay: i * 0.14,
      })),
    [],
  );

  const isClean = phase === "clean";

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#0A0F1F] text-bone-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,144,255,0.22),transparent_30%),radial-gradient(circle_at_75%_18%,rgba(0,229,255,0.18),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(30,144,255,0.12),transparent_30%)]" />
        <motion.div
          animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.06, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.12),transparent_62%)] blur-3xl"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_18%,transparent_82%,rgba(255,255,255,0.03))]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:96px_96px]" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col justify-center px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(560px,1.1fr)] xl:gap-16">
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5"
            >
              <AnimatePresence mode="wait">
                <StatusPill key={phase} phase={phase} />
              </AnimatePresence>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(3rem,7vw,7.4rem)] uppercase leading-[0.88] tracking-[-0.04em] text-white"
            >
              Watch
              <span className="block bg-[linear-gradient(135deg,#FFFFFF_10%,#BEEBFF_38%,#00E5FF_62%,#1E90FF_95%)] bg-clip-text text-transparent">
                grime die.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-base leading-7 text-bone-200 sm:text-lg sm:leading-8"
            >
              A cinematic Shoe Glitch experience page built like a premium product launch —
              dark, sharp, and motion-led. Start the wash cycle and watch a dead, dusty
              sneaker turn crisp with water, foam, steam, and an electric clean finish.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.985 }}
                onClick={startSequence}
                disabled={isRunning}
                className="group inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(30,144,255,0.96),rgba(0,229,255,0.96))] px-7 py-4 font-medium text-[#07101E] shadow-[0_12px_50px_rgba(0,229,255,0.28)] transition disabled:cursor-not-allowed disabled:opacity-75"
              >
                <span>Wash my shoes</span>
                <span className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm transition group-hover:bg-white/30">
                  →
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={resetScene}
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-7 py-4 font-medium text-white/88 backdrop-blur-md transition hover:bg-white/8"
              >
                Reset scene
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 grid max-w-xl grid-cols-3 gap-3"
            >
              {[
                ["Water hit", "Cold rinse"],
                ["Foam phase", "Deep breakdown"],
                ["Steam finish", "Fresh glow"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
                >
                  <div className="text-sm font-medium text-white">{title}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.22em] text-bone-300/85">
                    {desc}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[900px]"
          >
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-3 shadow-[0_30px_140px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-5">
              <div className="relative aspect-[1.18/1] overflow-hidden rounded-[1.9rem] bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,#10182D_0%,#0B1224_55%,#09111F_100%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(0,229,255,0.10),transparent_32%)]" />

                {!isClean && (
                  <div className="pointer-events-none absolute inset-0">
                    {dust.map((particle) => (
                      <motion.span
                        key={`${cycle}-dust-${particle.id}`}
                        initial={{ opacity: 0.12, y: 0, x: 0 }}
                        animate={{
                          opacity: [0.16, 0.32, 0.12],
                          y: [-4, 5, -3],
                          x: [-3, 3, -2],
                        }}
                        transition={{
                          duration: particle.duration,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute rounded-full bg-[rgba(123,77,37,0.9)] blur-[1px]"
                        style={{
                          top: `${particle.top}%`,
                          left: `${particle.left}%`,
                          width: particle.size,
                          height: particle.size,
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="absolute inset-x-[4%] bottom-[10%] top-[14%]">
                  <SneakerArt clean={isClean} />
                </div>

                <AnimatePresence>
                  {phase === "water" && (
                    <div className="pointer-events-none absolute inset-x-[8%] top-[5%] bottom-[12%]">
                      {droplets.map((drop) => (
                        <motion.span
                          key={`${cycle}-drop-${drop.id}`}
                          initial={{ y: -90, opacity: 0 }}
                          animate={{ y: ["0%", "82%"], opacity: [0, 1, 0.18] }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: drop.duration,
                            delay: drop.delay,
                            repeat: 1,
                            ease: [0.18, 0.88, 0.34, 1],
                          }}
                          className="absolute top-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(0,229,255,0.48))] shadow-[0_0_18px_rgba(0,229,255,0.4)]"
                          style={{
                            left: `${drop.left}%`,
                            width: 7,
                            height: drop.height,
                          }}
                        />
                      ))}

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.75, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.1 }}
                        className="absolute inset-x-[8%] top-[22%] h-[36%] rounded-full bg-[radial-gradient(circle,rgba(125,225,255,0.26),transparent_60%)] blur-2xl"
                      />
                    </div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {phase === "foam" && (
                    <div className="pointer-events-none absolute inset-x-[9%] bottom-[16%] h-[34%]">
                      {foam.map((bubble) => (
                        <motion.span
                          key={`${cycle}-foam-${bubble.id}`}
                          initial={{ opacity: 0, scale: 0.3, y: 20 }}
                          animate={{
                            opacity: [0, 0.95, 0.85, 0],
                            scale: [0.3, 1, 1.06, 0.95],
                            y: [18, -12, -22, -36],
                            x: [0, bubble.id % 2 === 0 ? -6 : 7, 0],
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 1.55,
                            delay: bubble.delay,
                            repeat: 1,
                            ease: "easeOut",
                          }}
                          className="absolute rounded-full border border-white/35 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.96),rgba(213,247,255,0.48)_48%,rgba(255,255,255,0.08))] shadow-[0_0_24px_rgba(255,255,255,0.12)]"
                          style={{
                            left: `${bubble.left}%`,
                            bottom: `${bubble.bottom}%`,
                            width: bubble.size,
                            height: bubble.size,
                          }}
                        />
                      ))}

                      <motion.div
                        initial={{ opacity: 0, scaleX: 0.85 }}
                        animate={{ opacity: [0, 0.95, 0.2], scaleX: [0.85, 1.03, 1] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.45 }}
                        className="absolute inset-x-[9%] bottom-[10%] h-20 rounded-[999px] bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.98),rgba(219,246,255,0.62)_42%,rgba(255,255,255,0.08)_72%)] blur-md"
                      />
                    </div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {phase === "steam" && (
                    <div className="pointer-events-none absolute inset-x-[12%] top-[15%] bottom-[22%]">
                      {steam.map((cloud) => (
                        <motion.span
                          key={`${cycle}-steam-${cloud.id}`}
                          initial={{ opacity: 0, y: 34, x: 0, scale: 0.86 }}
                          animate={{
                            opacity: [0, 0.38, 0],
                            y: [26, -48, -96],
                            x: [0, cloud.id % 2 === 0 ? -10 : 10, cloud.id % 2 === 0 ? -16 : 16],
                            scale: [0.86, 1.08, 1.14],
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 2,
                            delay: cloud.delay,
                            repeat: 1,
                            ease: "easeOut",
                          }}
                          className="absolute bottom-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.82),rgba(214,245,255,0.18)_58%,transparent_72%)] blur-2xl"
                          style={{
                            left: `${cloud.left}%`,
                            width: cloud.width,
                            height: cloud.width * 0.68,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isClean && (
                    <>
                      <motion.div
                        key={`${cycle}-shine`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.58, 0.24] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.45 }}
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_40%,rgba(255,255,255,0.34),transparent_28%),radial-gradient(circle_at_50%_58%,rgba(0,229,255,0.18),transparent_28%)]"
                      />
                      <div className="pointer-events-none absolute inset-0">
                        {sparks.map((spark) => (
                          <motion.span
                            key={`${cycle}-spark-${spark.id}`}
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0.4, 1.2, 0.65],
                              rotate: [0, 180],
                            }}
                            transition={{
                              duration: 1.2,
                              delay: spark.delay,
                              ease: "easeOut",
                            }}
                            className="absolute h-5 w-5 rounded-full bg-[radial-gradient(circle,#ffffff_0%,#c4f7ff_38%,transparent_68%)] blur-[1px]"
                            style={{ top: `${spark.top}%`, left: `${spark.left}%` }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </AnimatePresence>

                <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(10,15,31,0.72))]" />
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-8 left-1/2 h-28 w-[86%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.14),transparent_68%)] blur-3xl" />
          </motion.div>
        </div>
      </section>
    </main>
  );
}
