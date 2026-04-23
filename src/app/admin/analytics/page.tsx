import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, StatusDot } from '@/components/ui';
import { buildAdminAnalyticsSummary } from '@/features/admin/analytics-reporting';
import { getSession } from '@/lib/session';

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
        <Badge>{summary.totals.trackedRoutes} tracked routes</Badge>
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
          <div className="font-mono text-xs text-bone/40 mb-1">Tracked routes</div>
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
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Coverage by family</div>
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
                No analytics activity has been recorded yet on tracked routes.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">What is tracked now</div>
          <div className="mt-5 space-y-3 text-sm leading-6 text-ink/66">
            <p>Tracked by the current growth event system:</p>
            <ul className="list-disc pl-5">
              <li>page views on growth, SEO, operator, and release templates</li>
              <li>CTA clicks on tagged links and buttons</li>
              <li>lead captures from growth lead forms</li>
              <li>booking starts and completed checkouts</li>
              <li>watchlist saves and operator application interest</li>
            </ul>
            <p className="pt-2">
              Homepage-wide, booking-wide, and product analytics can be added next, but this dashboard now gives a real view into the SEO/AEO and operator-acquisition layer.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Top routes</div>
          <div className="mt-5 space-y-3">
            {summary.topRoutes.length > 0 ? summary.topRoutes.map((route) => (
              <div key={route.routePath} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
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
              </div>
            )) : (
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm text-ink/62">
                Top routes will appear here as tracked traffic arrives.
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
                  No recent growth events yet.
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
