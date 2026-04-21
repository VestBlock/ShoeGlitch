'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'idle' | 'washing' | 'foaming' | 'rinsing' | 'steam' | 'clean';

/* ─── Particle helpers ────────────────────────────────────────── */
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  hue: number;
  lightness: number;
}

function genParticles(n: number, seed: number): Particle[] {
  let s = seed;
  const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: r() * 78 + 11,
    y: r() * 58 + 21,
    size: r() * 6 + 2,
    delay: r() * 2.2,
    duration: r() * 2 + 1.4,
    drift: (r() - 0.5) * 48,
    hue: r() * 18 + 20,
    lightness: r() * 18 + 14,
  }));
}

/* ─── Sneaker SVG ─────────────────────────────────────────────── */
function SneakerSVG({ isClean }: { isClean: boolean }) {
  return (
    <svg viewBox="0 0 520 230" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="sg-upper" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor={isClean ? '#2a5ab8' : '#3d4e6a'} />
          <stop offset="100%" stopColor={isClean ? '#0e2060' : '#1e2840'} />
        </linearGradient>
        <linearGradient id="sg-midsole" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isClean ? '#b8cef0' : '#6a7888'} />
          <stop offset="100%" stopColor={isClean ? '#dce8ff' : '#8899aa'} />
        </linearGradient>
        <linearGradient id="sg-stripe" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E90FF" stopOpacity="0" />
          <stop offset="20%" stopColor="#1E90FF" />
          <stop offset="72%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </linearGradient>
        <filter id="sg-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sg-softglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="265" cy="220" rx="192" ry="7" fill="rgba(0,0,0,0.45)" />

      {/* OUTSOLE */}
      <path
        d="M72 207 L438 207 Q468 207 470 190 L470 181 Q470 173 452 172 L72 172 Q52 172 50 181 L50 192 Q50 207 72 207Z"
        fill="#0e1320"
      />
      <path
        d="M88 200 L432 200 Q456 200 460 193"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* MIDSOLE */}
      <line x1="74" y1="172" x2="450" y2="172" stroke="url(#sg-midsole)" strokeWidth="9" strokeLinecap="round" />

      {/* UPPER MAIN BODY */}
      <path
        d="M70 172 L70 93 Q68 72 86 65 Q104 58 124 61 Q152 57 174 55 L372 55 Q416 55 442 82 Q462 108 462 144 L462 172Z"
        fill="url(#sg-upper)"
      />

      {/* HEEL COUNTER */}
      <path
        d="M70 172 L70 93 Q69 73 83 67 L112 63 Q90 70 87 91 L87 172Z"
        fill={isClean ? '#183880' : '#252e48'}
        opacity="0.85"
      />

      {/* ANKLE COLLAR opening */}
      <ellipse cx="104" cy="91" rx="37" ry="31" fill="#0A0F1F" />
      <ellipse
        cx="104" cy="91" rx="37" ry="31"
        fill="none"
        stroke={isClean ? '#2458b0' : '#253050'}
        strokeWidth="2"
      />

      {/* TOE BOX */}
      <path
        d="M382 55 Q418 55 444 83 Q463 109 461 146 L461 172 L405 172 L405 88 Q397 64 380 60Z"
        fill={isClean ? '#1a3880' : '#2e3d58'}
        opacity="0.7"
      />
      <path
        d="M405 88 Q397 64 380 60"
        stroke={isClean ? '#3468c8' : '#38475e'}
        strokeWidth="1.5"
        fill="none"
      />

      {/* TONGUE */}
      <path
        d="M174 55 Q188 52 206 53 L210 126 Q190 130 170 126Z"
        fill={isClean ? '#1e4898' : '#2e3e5e'}
      />
      <rect x="181" y="68" width="26" height="20" rx="5"
        fill={isClean ? '#1E90FF' : '#263858'}
        opacity="0.95"
      />
      <rect x="181" y="68" width="26" height="20" rx="5"
        fill="none"
        stroke={isClean ? '#60b8ff' : '#344870'}
        strokeWidth="1"
      />

      {/* VAMP (lace area) */}
      <path
        d="M206 53 L372 55 L372 126 L210 126Z"
        fill={isClean ? '#1e3868' : '#283458'}
        opacity="0.55"
      />

      {/* LACES */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x={212} y={60 + i * 13} width={148} height={7} rx={3.5}
            fill={isClean ? '#c0d8ff' : '#404e70'}
          />
          <circle cx={209} cy={63 + i * 13} r={3.5} fill={isClean ? '#182848' : '#18202e'} />
          <circle cx={363} cy={63 + i * 13} r={3.5} fill={isClean ? '#182848' : '#18202e'} />
        </g>
      ))}

      {/* SIDE STRIPE */}
      <path
        d="M92 150 C162 138 272 130 368 128 Q412 127 453 139"
        stroke="url(#sg-stripe)"
        strokeWidth="3.5"
        fill="none"
        opacity={isClean ? 1 : 0.3}
        strokeLinecap="round"
      />

      {/* UPPER HIGHLIGHT */}
      <path
        d="M94 102 C148 87 248 79 348 79"
        stroke="rgba(255,255,255,0.13)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M102 115 C155 106 230 102 310 103"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* CLEAN: glow outline + logo dot */}
      {isClean && (
        <>
          <path
            d="M70 172 L70 93 Q68 72 86 65 Q104 58 124 61 Q152 57 174 55 L372 55 Q416 55 442 82 Q462 108 462 144 L462 172Z"
            fill="none"
            stroke="#1E90FF"
            strokeWidth="1.5"
            opacity="0.55"
            filter="url(#sg-glow)"
          />
          <circle cx="288" cy="144" r="5.5" fill="#00E5FF" filter="url(#sg-softglow)" opacity="0.85" />
          <circle cx="288" cy="144" r="2.5" fill="white" opacity="0.9" />
        </>
      )}
    </svg>
  );
}

/* ─── Particle visuals ─────────────────────────────────────────── */
function DirtParticle({ p }: { p: Particle }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: p.size,
        height: p.size,
        background: `hsl(${p.hue}, 48%, ${p.lightness}%)`,
      }}
      animate={{
        y: [0, -5, 3, -3, 0],
        x: [0, p.drift * 0.15, 0],
        opacity: [0.55, 0.75, 0.45, 0.65, 0.55],
      }}
      transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function WaterDroplet({ p }: { p: Particle }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${p.x}%`, top: 0 }}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: '105vh', opacity: [0, 0.9, 0.9, 0] }}
      transition={{ duration: p.duration * 0.65, delay: p.delay, repeat: Infinity, ease: 'easeIn' }}
    >
      <div
        style={{
          width: p.size * 0.65,
          height: p.size * 1.3,
          borderRadius: `${p.size * 0.65}px ${p.size * 0.65}px ${p.size * 0.4}px ${p.size * 0.4}px`,
          background: 'linear-gradient(180deg, #80c0ff 0%, #1E90FF 100%)',
          boxShadow: `0 0 ${p.size + 2}px rgba(30,144,255,0.55)`,
        }}
      />
    </motion.div>
  );
}

function FoamBubble({ p }: { p: Particle }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: p.size * 1.6,
        height: p.size * 1.6,
        background: 'radial-gradient(circle at 33% 33%, rgba(255,255,255,0.92), rgba(190,225,255,0.45))',
        border: '1px solid rgba(255,255,255,0.35)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1, 1.1, 0.95, 0],
        opacity: [0, 0.85, 0.9, 0.6, 0],
        y: [0, -p.size * 4, -p.size * 10],
        x: [0, p.drift * 0.4, p.drift * 0.85],
      }}
      transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

function SteamWisp({ p }: { p: Particle }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${p.x}%`,
        bottom: '38%',
        width: p.size * 3.5,
        height: p.size * 3.5,
        background: 'radial-gradient(circle, rgba(210,225,255,0.55), transparent)',
        filter: 'blur(5px)',
      }}
      initial={{ y: 0, opacity: 0, scale: 0.4 }}
      animate={{
        y: [-10, -90, -160],
        opacity: [0, 0.65, 0.35, 0],
        scale: [0.4, 1.3, 2, 0.8],
        x: [0, p.drift * 0.4, p.drift],
      }}
      transition={{ duration: p.duration * 1.3, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

/* ─── Config ──────────────────────────────────────────────────── */
const PHASE_LABELS: Record<Phase, string> = {
  idle:    'soaked in grime',
  washing: 'rinsing...',
  foaming: 'deep clean...',
  rinsing: 'final rinse...',
  steam:   'finishing...',
  clean:   'glitch clean ✦',
};

const PHASE_COLORS: Record<Phase, string> = {
  idle:    '#5a6880',
  washing: '#60a8ff',
  foaming: '#90ccff',
  rinsing: '#60c8ff',
  steam:   '#b0d0ff',
  clean:   '#00E5FF',
};

const PROGRESS_PHASES: Phase[] = ['washing', 'foaming', 'rinsing', 'steam'];

const SHOE_FILTER: Record<Phase, string> = {
  idle:    'saturate(0.18) brightness(0.52) sepia(0.35)',
  washing: 'saturate(0.5)  brightness(0.72)',
  foaming: 'saturate(0.68) brightness(0.84)',
  rinsing: 'saturate(0.84) brightness(0.95)',
  steam:   'saturate(1.05) brightness(1.05)',
  clean:   'saturate(1.55) brightness(1.18) drop-shadow(0 0 42px rgba(30,144,255,0.58))',
};

/* ─── Main Component ─────────────────────────────────────────── */
export default function Experience() {
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dirtParticles = useMemo(() => genParticles(30, 1337), []);
  const waterDroplets = useMemo(() => genParticles(24, 2048), []);
  const foamBubbles   = useMemo(() => genParticles(22, 4096), []);
  const steamWisps    = useMemo(() => genParticles(16, 8192), []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const startWash = useCallback(() => {
    if (phase !== 'idle') return;
    clearTimers();
    setPhase('washing');
    timers.current = [
      setTimeout(() => setPhase('foaming'), 2300),
      setTimeout(() => setPhase('rinsing'), 4800),
      setTimeout(() => setPhase('steam'),   6500),
      setTimeout(() => setPhase('clean'),   8700),
    ];
  }, [phase, clearTimers]);

  const reset = useCallback(() => { clearTimers(); setPhase('idle'); }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const isDirty = phase === 'idle';
  const isClean = phase === 'clean';
  const isActive = !isDirty && !isClean;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0A0F1F] flex flex-col items-center justify-center select-none">

      {/* Ambient background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: isClean
            ? 'radial-gradient(ellipse 65% 48% at 50% 56%, rgba(30,144,255,0.2) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 55% 42% at 50% 56%, rgba(30,144,255,0.04) 0%, transparent 70%)',
        }}
        transition={{ duration: 2.2 }}
      />

      {/* Water-phase tint */}
      <AnimatePresence>
        {(phase === 'washing' || phase === 'rinsing') && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'radial-gradient(ellipse 85% 65% at 50% 38%, rgba(20,90,255,0.07), transparent)' }}
          />
        )}
      </AnimatePresence>

      {/* Dirt */}
      <AnimatePresence>
        {isDirty && (
          <motion.div key="dirt" className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.1 } }}>
            {dirtParticles.map(p => <DirtParticle key={p.id} p={p} />)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Water */}
      <AnimatePresence>
        {(phase === 'washing' || phase === 'rinsing') && (
          <motion.div key="water" className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {waterDroplets.map(p => <WaterDroplet key={p.id} p={p} />)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Foam */}
      <AnimatePresence>
        {phase === 'foaming' && (
          <motion.div key="foam" className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {foamBubbles.map(p => <FoamBubble key={p.id} p={p} />)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steam */}
      <AnimatePresence>
        {phase === 'steam' && (
          <motion.div key="steam" className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {steamWisps.map(p => <SteamWisp key={p.id} p={p} />)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean sparkles */}
      <AnimatePresence>
        {isClean && (
          <motion.div key="sparkles" className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: `${15 + (i % 4) * 20}%`, top: `${18 + Math.floor(i / 4) * 25}%` }}
                animate={{ scale: [0, 1, 0], opacity: [0, 0.9, 0], rotate: [0, 180] }}
                transition={{ duration: 1.8, delay: i * 0.2, repeat: Infinity, repeatDelay: 2.2 }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14">
                  <path d="M7 0 L7.8 5.8 L14 7 L7.8 8.2 L7 14 L6.2 8.2 L0 7 L6.2 5.8Z"
                    fill={i % 2 === 0 ? '#1E90FF' : '#00E5FF'} />
                </svg>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brand mark */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.38em] text-white/25">Shoe Glitch</span>
        <div className="h-px w-10 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </motion.div>

      {/* Shoe + UI */}
      <div className="relative flex flex-col items-center w-full max-w-[600px] px-6 sm:px-10">

        {/* Glow halo */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-48 pointer-events-none rounded-full blur-[70px]"
          animate={{
            background: isClean ? 'rgba(30,144,255,0.28)' : isDirty ? 'rgba(30,144,255,0.03)' : 'rgba(30,144,255,0.1)',
            scale: isClean ? 1.15 : 1,
          }}
          transition={{ duration: 2 }}
        />

        {/* Shoe SVG */}
        <motion.div
          className="relative w-full"
          style={{ aspectRatio: '520/230' }}
          animate={{ filter: SHOE_FILTER[phase] }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        >
          <SneakerSVG isClean={isClean} />
        </motion.div>

        {/* Phase label */}
        <motion.p
          className="mt-5 font-mono text-[10px] uppercase tracking-[0.32em]"
          animate={{ color: PHASE_COLORS[phase] }}
          transition={{ duration: 0.9 }}
        >
          {PHASE_LABELS[phase]}
        </motion.p>

        {/* CTA area */}
        <div className="mt-8 flex flex-col items-center">
          <AnimatePresence mode="wait">

            {isDirty && (
              <motion.button
                key="wash"
                onClick={startWash}
                className="relative overflow-hidden rounded-full px-11 py-4 text-sm font-semibold uppercase tracking-widest text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #1E90FF 0%, #00E5FF 100%)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(30,144,255,0.65)' }}
                whileTap={{ scale: 0.97 }}
              >
                Wash my shoes
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  animate={{ x: ['-100%', '220%'] }}
                  transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.8 }}
                />
              </motion.button>
            )}

            {isActive && (
              <motion.div
                key="progress"
                className="flex gap-2 items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {PROGRESS_PHASES.map((p) => (
                  <motion.div
                    key={p}
                    className="h-[3px] rounded-full"
                    animate={{
                      width: p === phase ? 36 : 8,
                      background: p === phase ? '#1E90FF' : 'rgba(255,255,255,0.18)',
                      opacity: p === phase ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.35 }}
                  />
                ))}
              </motion.div>
            )}

            {isClean && (
              <motion.div
                key="clean-cta"
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <a
                  href="/book"
                  className="relative overflow-hidden rounded-full px-11 py-4 text-sm font-semibold uppercase tracking-widest text-[#0A0F1F]"
                  style={{ background: 'linear-gradient(135deg, #00E5FF 0%, #1E90FF 100%)' }}
                >
                  Book a clean
                </a>
                <button
                  onClick={reset}
                  className="font-mono text-[10px] uppercase tracking-widest text-white/25 hover:text-white/55 transition-colors"
                >
                  Run again
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.028) 2px, rgba(0,0,0,0.028) 4px)',
        }}
      />

      {/* Grain noise */}
      <div className="grain absolute inset-0 pointer-events-none" />
    </div>
  );
}
