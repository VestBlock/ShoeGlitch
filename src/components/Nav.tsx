import Link from 'next/link';
import { getSession } from '@/lib/session';
import { ROLE_HOME } from '@/lib/rbac';
import { buildLoginHref } from '@/lib/login-redirect';
import { cn } from '@/lib/utils';
import { StatusDot } from '@/components/ui';

const NAV_ITEMS = [
  { href: '/services', label: 'Services' },
  { href: '/mail-in', label: 'Mail-In' },
  { href: '/locations', label: 'Locations' },
  { href: '/intelligence', label: 'Intelligence' },
  { href: '/operator', label: 'Operators' },
] as const;

export default async function Nav({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const session = await getSession().catch(() => null);
  const dark = theme === 'dark';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b backdrop-blur-xl',
        dark ? 'border-white/10 bg-ink/90 text-bone' : 'border-ink/8 bg-bone/78 text-ink',
      )}
    >
      <div className="container-x py-4">
        <div
          className={cn(
            'flex items-center justify-between gap-4 rounded-[1.5rem] border px-4 py-4 shadow-[0_18px_40px_rgba(10,15,31,0.08)] md:px-5',
            dark ? 'border-white/10 bg-white/6 text-bone' : 'border-ink/10 bg-white/78 text-ink',
          )}
        >
          <Link href="/" className="group flex flex-col leading-none">
            <span className="h-display text-[clamp(1.6rem,2vw,2rem)] tracking-tight group-hover:text-glitch transition">Shoe Glitch</span>
            <span className={cn('hidden text-[10px] uppercase tracking-[0.25em] sm:block', dark ? 'text-bone/50' : 'text-ink/50')}>
              luxury sneaker care
            </span>
          </Link>

          <nav className="hidden items-center gap-2 text-sm md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full border border-transparent px-3 py-2 font-medium transition',
                  dark
                    ? 'text-bone/72 hover:border-cyan/18 hover:bg-white/6 hover:text-cyan'
                    : 'text-ink/72 hover:border-glitch/18 hover:bg-glitch/6 hover:text-glitch',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link href={ROLE_HOME[session.role]} className={cn('btn py-2.5 px-4', dark ? 'bg-bone text-ink hover:bg-glitch hover:text-white' : 'btn-primary')}>
                <StatusDot tone="live" />
                <span className="hidden sm:inline">{session.name.split(' ')[0]}</span>
                <span className="sm:hidden">Me</span>
              </Link>
            ) : (
              <Link href={buildLoginHref('/customer')} className={cn('text-sm font-semibold transition hover:text-glitch', dark ? 'text-bone/78' : 'text-ink/72')}>
                Sign in
              </Link>
            )}
            <Link href="/book" className="btn-glitch py-2.5 px-4 inline-flex">
              Book now →
            </Link>
          </div>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'shrink-0 rounded-[1.1rem] border px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition',
                dark
                  ? 'border-bone/15 bg-bone/5 text-bone/80 hover:border-cyan hover:text-cyan'
                  : 'border-ink/10 bg-white text-ink/70 hover:border-glitch hover:text-glitch',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
