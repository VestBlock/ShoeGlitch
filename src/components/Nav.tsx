import Link from 'next/link';
import { getSession } from '@/lib/session';
import { ROLE_HOME } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import { StatusDot } from '@/components/ui';

const NAV_ITEMS = [
  { href: '/services', label: 'Services' },
  { href: '/coverage', label: 'Coverage' },
  { href: '/mail-in', label: 'Mail-In' },
  { href: '/operator', label: 'Become an Operator' },
  { href: '/book', label: 'Book' },
] as const;

export default async function Nav({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const session = await getSession().catch(() => null);
  const dark = theme === 'dark';

  return (
    <header className={cn('relative z-40 w-full', dark ? 'bg-ink text-bone' : 'bg-bone text-ink')}>
      <div className="container-x py-5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex flex-col leading-none">
            <span className="h-display text-[clamp(1.6rem,2vw,2rem)] tracking-tight">Shoe Glitch</span>
            <span className={cn('text-[10px] uppercase tracking-[0.25em]', dark ? 'text-bone/50' : 'text-ink/50')}>
              multi-city sole-care
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-glitch transition">
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
              <Link href="/login" className={cn('btn py-2.5 px-4', dark ? 'bg-bone text-ink hover:bg-glitch hover:text-white' : 'btn-primary')}>
                Sign in
              </Link>
            )}
            <Link href="/book" className="btn-glitch py-2.5 px-4 hidden sm:inline-flex">
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
                'shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition',
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
