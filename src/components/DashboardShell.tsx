import Link from 'next/link';
import { getSession } from '@/lib/session';
import { logoutAction } from '@/app/(public)/login/actions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import type { Role } from '@/types';
import {
  Home, Package, Users, Wrench, LogOut, Tag, Building2, Bell,
} from 'lucide-react';

interface NavItem { href: string; label: string; icon: any; }

const NAVS: Record<Role, { title: string; items: NavItem[] }> = {
  customer: {
    title: 'My account',
    items: [
      { href: '/customer', label: 'Dashboard', icon: Home },
      { href: '/customer/orders', label: 'Orders', icon: Package },
      { href: '/customer/watchlist', label: 'Watchlist', icon: Bell },
      { href: '/book', label: 'Book a clean', icon: Wrench },
    ],
  },
  cleaner: {
    title: 'Cleaner',
    items: [{ href: '/cleaner', label: 'Jobs board', icon: Home }],
  },
  city_manager: {
    title: 'City ops',
    items: [{ href: '/city-manager', label: 'Overview', icon: Home }],
  },
  super_admin: {
    title: 'HQ',
    items: [
      { href: '/admin', label: 'Overview', icon: Home },
      { href: '/admin/cities', label: 'Cities', icon: Building2 },
      { href: '/admin/orders', label: 'Orders', icon: Package },
      { href: '/admin/operators', label: 'Operators', icon: Wrench },
      { href: '/admin/services', label: 'Services & pricing', icon: Tag },
      { href: '/admin/team', label: 'Team', icon: Users },
    ],
  },
};

export default async function DashboardShell({
  children,
  currentPath,
  pageTitle,
}: {
  children: React.ReactNode;
  currentPath?: string;
  pageTitle?: string;
}) {
  const session = await getSession();
  if (!session) {
    return (
      <div className="container-x py-24">
        <h1 className="h-display text-4xl mb-4">Please sign in</h1>
        <Link href="/login" className="btn-glitch">Sign in</Link>
      </div>
    );
  }
  const nav = NAVS[session.role];

  return (
    <div className="min-h-screen bg-bone-soft">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="bg-ink text-bone lg:min-h-screen p-6 lg:sticky lg:top-0 lg:h-screen flex flex-col">
          <Link href="/" className="flex items-center gap-3 mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Shoe Glitch" className="h-12 w-12 rounded-lg" />
            <div>
              <div className="h-display text-xl">Shoe Glitch</div>
              <div className="text-[10px] uppercase tracking-widest text-cyan">{nav.title}</div>
            </div>
          </Link>

          <div className="mb-6 p-4 rounded-xl bg-bone/5 border border-bone/10">
            <div className="text-[10px] uppercase tracking-widest text-bone/40 mb-1">Signed in as</div>
            <div className="font-semibold truncate">{session.name}</div>
            <div className="text-xs text-bone/50 truncate">{session.email}</div>
            <div className="mt-3"><Badge tone="glitch">{session.role.replace('_', ' ')}</Badge></div>
          </div>

          <nav className="flex flex-col gap-1">
            {nav.items.map((item) => (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition',
                  currentPath === item.href ? 'bg-glitch text-white' : 'hover:bg-bone/5 text-bone/80',
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6">
            <form action={logoutAction}>
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-bone/60 hover:text-bone hover:bg-bone/5 w-full">
                <LogOut size={16} /> Sign out
              </button>
            </form>
          </div>
        </aside>

        <main className="p-6 lg:p-10">
          {pageTitle && (
            <h1 className="h-display text-[clamp(2rem,5vw,3.5rem)] leading-none mb-8">{pageTitle}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
