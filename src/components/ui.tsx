import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: React.ReactNode;
  tone?: 'default' | 'dark' | 'glitch' | 'neon' | 'acid';
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: 'badge',
    dark: 'badge-dark',
    glitch: 'badge-glitch',
    neon: 'badge border-neon/40 bg-neon/10 text-ink',
    acid: 'badge border-ink/20 bg-acid text-ink',
  };
  return <span className={cn(tones[tone], className)}>{children}</span>;
}

export function StatusDot({ tone = 'ok' }: { tone?: 'ok' | 'warn' | 'error' | 'mute' | 'live' }) {
  const tones: Record<string, string> = {
    ok: 'bg-neon',
    warn: 'bg-acid',
    error: 'bg-glitch',
    mute: 'bg-ink/30',
    live: 'bg-glitch animate-pulse',
  };
  return <span className={cn('dot', tones[tone])} />;
}

export function Card({
  children,
  className,
  as: As = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: any;
}) {
  return <As className={cn('card p-6', className)}>{children}</As>;
}

export function SectionHeader({
  eyebrow,
  title,
  tagline,
  align = 'left',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  tagline?: string;
  align?: 'left' | 'center';
}) {
  return (
    <header className={cn('flex flex-col gap-3', align === 'center' && 'items-center text-center')}>
      {eyebrow && <span className="badge">{eyebrow}</span>}
      <h2 className="h-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.95]">{title}</h2>
      {tagline && <p className="max-w-xl text-ink/70 text-base">{tagline}</p>}
    </header>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-ink/10', className)} />;
}

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="rail">
      <span style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
    </div>
  );
}
