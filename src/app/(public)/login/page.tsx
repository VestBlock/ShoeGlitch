import { Badge, Card } from '@/components/ui';
import { loginAction, loginAsAction, googleSignInAction } from './actions';
import { db } from '@/lib/db';

const DEMO_ROLES: Array<{ email: string; label: string; role: string; desc: string }> = [
  { email: 'admin@shoeglitch.test', label: 'HQ Admin', role: 'super_admin', desc: 'All cities, all orders, all pricing.' },
  { email: 'cm.milwaukee@shoeglitch.test', label: 'City Manager · Milwaukee', role: 'city_manager', desc: 'Milwaukee ops + cleaners.' },
  { email: 'cleaner.milwaukee@shoeglitch.test', label: 'Cleaner · Milwaukee', role: 'cleaner', desc: 'Marcus Hill — Pro-tier operator.' },
  { email: 'customer@shoeglitch.test', label: 'Customer · Milwaukee', role: 'customer', desc: 'Ava Brooks — East Side.' },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { demo?: string; error?: string };
}) {
  const showDemo = searchParams?.demo === '1';
  const users = showDemo ? await db.users.all() : [];
  const loginError = searchParams?.error === 'signin_failed'
    ? 'Could not sign in with that account. Use a seeded demo email or continue with Google.'
    : null;

  return (
    <section className="container-x pt-10 pb-24">
      <div className={`grid grid-cols-1 gap-8 ${showDemo ? 'md:grid-cols-5' : 'max-w-sm'}`}>
        <div className={showDemo ? 'md:col-span-2' : ''}>
          <Badge className="mb-4">Sign in</Badge>
          <h1 className="h-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] mb-6">
            Welcome back.
          </h1>
          <form action={loginAction} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input name="email" className="input" placeholder="you@example.com" required />
            </div>
            {loginError && (
              <div className="rounded-xl border border-glitch/20 bg-glitch/5 px-4 py-3 text-sm text-glitch">
                {loginError}
              </div>
            )}
            <button type="submit" className="btn-glitch w-full">Continue →</button>
          </form>

          <div className="mt-6 pt-6 border-t border-ink/10">
            <form action={googleSignInAction}>
              <button type="submit" className="btn-outline w-full">
                Continue with Google
              </button>
            </form>
          </div>

          {showDemo && (
            <p className="mt-6 text-xs text-ink/50">
              Demo mode uses password <code className="font-mono">shoeglitch-demo</code> for seeded accounts.
            </p>
          )}
        </div>

        {showDemo && (
          <div className="md:col-span-3">
            <Card className="p-8 card-ink">
              <Badge tone="glitch" className="bg-cyan text-ink mb-4">Demo mode</Badge>
              <h2 className="h-display text-3xl mb-2">Instant role switching</h2>
              <p className="text-bone/60 mb-6">Click any demo account to sign in.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_ROLES.map((d) => (
                  <form key={d.email} action={async () => { 'use server'; await loginAsAction(d.email); }}>
                    <button className="w-full text-left p-4 rounded-xl border border-bone/15 hover:border-cyan hover:bg-bone/5 transition">
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-semibold">{d.label}</div>
                        <span className="badge-dark border-cyan/30 text-cyan text-[9px]">{d.role}</span>
                      </div>
                      <div className="text-xs text-bone/60 font-mono mb-2">{d.email}</div>
                      <div className="text-xs text-bone/50">{d.desc}</div>
                    </button>
                  </form>
                ))}
              </div>
              {users.length > 0 && (
                <div className="mt-6 pt-6 border-t border-bone/10">
                  <div className="text-xs text-cyan uppercase tracking-widest mb-2">All seeded users ({users.length})</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {users.map((u) => (
                      <span key={u.id} className="font-mono text-bone/60">{u.email}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
