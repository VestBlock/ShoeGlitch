import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, BarChart3, Bot, PackageSearch, Share2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, StatusDot } from '@/components/ui';
import { buildAdminAnalyticsSummary } from '@/features/admin/analytics-reporting';
import { getSession } from '@/lib/session';

function CommandLink({
  href,
  eyebrow,
  title,
  detail,
  Icon,
}: {
  href: string;
  eyebrow: string;
  title: string;
  detail: string;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.2rem] border border-ink/10 bg-white px-5 py-4 transition hover:-translate-y-0.5 hover:border-glitch/25 hover:bg-bone-soft"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-glitch/10 text-glitch">
          <Icon size={18} />
        </div>
        <ArrowUpRight size={17} className="text-ink/32 transition group-hover:text-glitch" />
      </div>
      <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.24em] text-glitch/80">{eyebrow}</div>
      <div className="mt-2 font-semibold text-ink">{title}</div>
      <div className="mt-1 text-sm leading-6 text-ink/58">{detail}</div>
    </Link>
  );
}

export default async function AdminAnalyticsPage() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const summary = await buildAdminAnalyticsSummary();

  return (
    <DashboardShell currentPath="/admin/analytics" pageTitle="Analytics & leads">
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Badge tone={summary.status === 'live' ? 'acid' : summary.status === 'empty' ? 'default' : 'glitch'}>
          <StatusDot tone={summary.status === 'live' ? 'ok' : summary.status === 'empty' ? 'warn' : 'error'} /> {summary.status}
        </Badge>
        <Badge>{summary.totals.trackedRoutes} active pages</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mb-10">
        <CommandLink
          href="/admin/automation"
          eyebrow="Run checks"
          title="Refresh site systems"
          detail="Run SEO, route, release, watchlist, and social jobs from one place."
          Icon={Bot}
        />
        <CommandLink
          href="/admin/social"
          eyebrow="Turn traffic into content"
          title="Open social queue"
          detail="Review drafts and send approved posts to Buffer when channels are ready."
          Icon={Share2}
        />
        <CommandLink
          href="/admin/orders"
          eyebrow="Revenue follow-through"
          title="Review orders"
          detail="Check whether traffic is turning into booked cleaning and restoration work."
          Icon={PackageSearch}
        />
        <CommandLink
          href="/services"
          eyebrow="Public view"
          title="Audit the service page"
          detail="Open the customer-facing tier flow and compare it against booking data."
          Icon={BarChart3}
        />
      </div>

      {summary.message ? (
        <Card className="mb-8">
          <div className="text-sm leading-6 text-ink/66">{summary.message}</div>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-5 mb-10">
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Page views</div>
          <div className="h-display text-4xl">{summary.totals.pageViews}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">CTA clicks</div>
          <div className="h-display text-4xl">{summary.totals.ctaClicks}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Lead captures</div>
          <div className="h-display text-4xl">{summary.totals.leads}</div>
        </Card>
        <Card className="card-ink">
          <div className="font-mono text-xs text-bone/40 mb-1">Active pages</div>
          <div className="h-display text-4xl text-bone">{summary.totals.trackedRoutes}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Booking starts</div>
          <div className="h-display text-4xl">{summary.totals.bookingStarts}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Booking completes</div>
          <div className="h-display text-4xl">{summary.totals.bookingCompletes}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Watchlist saves</div>
          <div className="h-display text-4xl">{summary.totals.watchlistSaves}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Operator interests</div>
          <div className="h-display text-4xl">{summary.totals.operatorInterests}</div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Funnel rates</div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="font-semibold text-ink">CTA rate</div>
              <div className="mt-1 text-3xl h-display">{summary.funnels.ctaRate}%</div>
              <div className="mt-1 text-xs text-ink/48">CTA clicks divided by page views.</div>
            </div>
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="font-semibold text-ink">Lead rate</div>
              <div className="mt-1 text-3xl h-display">{summary.funnels.leadRate}%</div>
              <div className="mt-1 text-xs text-ink/48">Lead captures divided by page views.</div>
            </div>
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="font-semibold text-ink">Booking completion</div>
              <div className="mt-1 text-3xl h-display">{summary.funnels.bookingCompletionRate}%</div>
              <div className="mt-1 text-xs text-ink/48">Completed checkouts divided by booking starts.</div>
            </div>
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="font-semibold text-ink">Watchlist save rate</div>
              <div className="mt-1 text-3xl h-display">{summary.funnels.watchlistSaveRate}%</div>
              <div className="mt-1 text-xs text-ink/48">Watchlist saves divided by page views.</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Performance by page type</div>
          <div className="mt-5 space-y-3">
            {summary.byFamily.length > 0 ? summary.byFamily.map((family) => (
              <div key={family.family} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-ink capitalize">{family.family.replaceAll('-', ' ')}</div>
                  <div className="font-mono text-sm text-ink/65">
                    {family.pageViews} views / {family.ctaClicks} clicks / {family.leads} leads
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm text-ink/62">
                No analytics activity has been recorded yet on active pages.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">What this page measures</div>
          <div className="mt-5 space-y-3 text-sm leading-6 text-ink/66">
            <p>This view connects website attention to the actions that matter:</p>
            <ul className="list-disc pl-5">
              <li>public page views across homepage, services, booking, coverage, mail-in, operator, release, and intelligence pages</li>
              <li>CTA clicks on tagged links and buttons</li>
              <li>lead captures from growth lead forms</li>
              <li>booking starts and completed checkouts</li>
              <li>watchlist saves and operator application interest</li>
            </ul>
            <p className="pt-2">Use it to spot which pages deserve more social content, stronger proof, or a cleaner booking path.</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Top pages</div>
          <div className="mt-5 space-y-3">
            {summary.topRoutes.length > 0 ? summary.topRoutes.map((route) => (
              <Link key={route.routePath} href={route.routePath} className="block rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 transition hover:border-glitch/20 hover:bg-white">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-ink">{route.routePath}</div>
                  <Badge>{route.family}</Badge>
                </div>
                <div className="mt-2 text-sm text-ink/62">
                  {route.pageViews} views · {route.ctaClicks} clicks · {route.leads} leads
                </div>
                {route.lastSeenAt ? (
                  <div className="mt-1 text-xs text-ink/48">Last seen {new Date(route.lastSeenAt).toLocaleString()}</div>
                ) : null}
              </Link>
            )) : (
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm text-ink/62">
                Top pages will appear here as traffic arrives.
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Recent events</div>
            <div className="mt-5 space-y-3">
              {summary.recentEvents.length > 0 ? summary.recentEvents.map((event) => (
                <div key={`${event.route_path}-${event.event_name}-${event.created_at}`} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-semibold text-ink">{event.event_name}</div>
                    <div className="text-xs text-ink/48">{new Date(event.created_at).toLocaleString()}</div>
                  </div>
                  <div className="mt-1 text-sm text-ink/62">{event.route_path}</div>
                  {event.cta_label ? <div className="mt-1 text-xs text-ink/48">CTA: {event.cta_label}</div> : null}
                </div>
              )) : (
                <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm text-ink/62">
                  No recent website actions yet.
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Recent leads</div>
            <div className="mt-5 space-y-3">
              {summary.recentLeads.length > 0 ? summary.recentLeads.map((lead) => (
                <div key={`${lead.route_path}-${lead.email}-${lead.created_at}`} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-semibold text-ink">{lead.offer}</div>
                    <div className="text-xs text-ink/48">{new Date(lead.created_at).toLocaleString()}</div>
                  </div>
                  <div className="mt-1 text-sm text-ink/62">{lead.route_path}</div>
                  <div className="mt-1 text-xs text-ink/48">{lead.email}</div>
                </div>
              )) : (
                <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm text-ink/62">
                  Lead captures will appear here as tracked forms are submitted.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
