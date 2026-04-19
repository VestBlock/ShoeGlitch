import Link from 'next/link';
import { getSession } from '@/lib/session';
import { ROLE_HOME } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import { StatusDot } from '@/components/ui';

export default async function Nav({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const session = await getSession().catch(() => null);
  const dark = theme === 'dark';
  return (
    <header className={cn('relative z-40 w-full', dark ? 'bg-ink text-bone' : 'bg-bone text-ink')}>
      <div className="container-x flex items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Shoe Glitch" className="h-12 w-12 rounded-lg object-cover" />
          <div className="flex flex-col leading-none">
            <span className="h-display text-xl tracking-tight">Shoe Glitch</span>
            <span className={cn('text-[10px] uppercase tracking-[0.25em]', dark ? 'text-bone/50' : 'text-ink/50')}>
              multi-city sole-care
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/services" className="hover:text-glitch transition">Services</Link>
          <Link href="/coverage" className="hover:text-glitch transition">Coverage</Link>
          <Link href="/mail-in" className="hover:text-glitch transition">Mail-In</Link>
          <Link href="/operator" className="hover:text-glitch transition">Become an Operator</Link>
          <Link href="/book" className="hover:text-glitch transition">Book</Link>
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
    </header>
  );
}
