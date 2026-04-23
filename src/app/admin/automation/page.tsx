import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, StatusDot } from '@/components/ui';
import { buildAdminAutomationSummary } from '@/features/admin/automation-reporting';
import {
  runRouteQaAction,
  runSeoAutomationAction,
  runSocialAutomationAction,
  runWatchlistAutomationAction,
  runWatchlistDigestAction,
} from '@/app/admin/automation/actions';
import { getSession } from '@/lib/session';

function runTone(status: string) {
  if (status === 'success') return 'ok' as const;
  if (status === 'failed') return 'error' as const;
  return 'warn' as const;
}

function sourceTone(status: string) {
  if (status === 'healthy' || status === 'ready') return 'ok' as const;
  if (status === 'degraded' || status === 'empty') return 'warn' as const;
  return 'error' as const;
}

export default async function AdminAutomationPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const summary = await buildAdminAutomationSummary();
  const params = (await searchParams) ?? {};
  const notice = typeof params.notice === 'string' ? params.notice : null;

  return (
    <DashboardShell currentPath="/admin/automation" pageTitle="Automation control">
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Badge tone="acid">
          <StatusDot tone="ok" /> SEO manifest {summary.seo.routeManifest.total}
        </Badge>
        <Badge tone={summary.social.buffer.configured ? 'acid' : 'glitch'}>
          <StatusDot tone={summary.social.buffer.configured ? 'ok' : 'error'} /> Buffer {summary.social.buffer.configured ? 'configured' : 'blocked'}
        </Badge>
        <Badge>{summary.seo.releaseManifest.counts.total} release routes</Badge>
        <Badge tone={summary.dbHealth.status === 'ready' ? 'acid' : 'glitch'}>
          <StatusDot tone={summary.dbHealth.status === 'ready' ? 'ok' : 'error'} /> DB {summary.dbHealth.status}
        </Badge>
        <Badge tone={summary.sourceHealth.kicksdb.status === 'healthy' ? 'acid' : 'glitch'}>
          <StatusDot tone={sourceTone(summary.sourceHealth.kicksdb.status)} /> KicksDB {summary.sourceHealth.kicksdb.status}
        </Badge>
      </div>

      {notice ? (
        <Card className="mb-8">
          <div className="text-sm leading-6 text-ink/66">{notice}</div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Run now</div>
          <div className="mt-5 grid gap-3">
            <form action={runSeoAutomationAction}>
              <button className="btn-glitch w-full justify-center">Refresh SEO manifests</button>
            </form>
            <form action={runRouteQaAction}>
              <button className="btn-glitch-ghost w-full justify-center">Run route QA</button>
            </form>
            <form action={runWatchlistAutomationAction}>
              <button className="btn-glitch-ghost w-full justify-center">Run watchlist scan</button>
            </form>
            <form action={runWatchlistDigestAction}>
              <button className="btn-glitch-ghost w-full justify-center">Send watchlist digest</button>
            </form>
            <form action={runSocialAutomationAction}>
              <button className="btn-glitch-ghost w-full justify-center">Run social queue</button>
            </form>
          </div>
        </Card>

        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Current posture</div>
          <div className="mt-5 space-y-3 text-sm leading-6 text-ink/66">
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              Route manifest refreshed: {summary.routeManifestUpdatedAt ? new Date(summary.routeManifestUpdatedAt).toLocaleString() : 'Not written yet'}
            </div>
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              Release manifest refreshed: {summary.releaseManifestUpdatedAt ? new Date(summary.releaseManifestUpdatedAt).toLocaleString() : 'Not written yet'}
            </div>
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              Social queue: {summary.social.queueStatus} · {summary.social.totals.drafts} drafts / {summary.social.totals.approved} approved
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Database readiness</div>
            <div className="mt-2 text-sm leading-6 text-ink/66">
              These tables power analytics, watchlists, KicksDB caching, and social automation.
            </div>
          </div>
          <Badge tone={summary.dbHealth.status === 'ready' ? 'acid' : 'glitch'}>
            <StatusDot tone={summary.dbHealth.status === 'ready' ? 'ok' : 'error'} /> {summary.dbHealth.status}
          </Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {summary.dbHealth.tables.map((table) => (
            <div key={table.table} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-ink">{table.table}</div>
                <StatusDot tone={table.ok ? 'ok' : 'error'} />
              </div>
              <div className="mt-1 text-sm text-ink/62">{table.purpose}</div>
              {!table.ok ? (
                <div className="mt-2 text-xs text-ink/48">
                  Apply: <span className="font-mono">{table.migration}</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Sneaker source health</div>
            <div className="mt-2 text-sm leading-6 text-ink/66">
              This checks the KicksDB provider path and the normalized provider cache that powers releases, alerts, and intelligence pages.
            </div>
          </div>
          <Badge tone={summary.sourceHealth.kicksdb.status === 'healthy' ? 'acid' : 'glitch'}>
            <StatusDot tone={sourceTone(summary.sourceHealth.kicksdb.status)} /> {summary.sourceHealth.kicksdb.status}
          </Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
            <div className="font-semibold text-ink">KicksDB probe</div>
            <div className="mt-1 text-sm text-ink/62">{summary.sourceHealth.kicksdb.message}</div>
            <div className="mt-2 grid gap-1 text-xs text-ink/48">
              <span>Sample products: {summary.sourceHealth.kicksdb.sampleCount}</span>
              <span>Served from cache: {summary.sourceHealth.kicksdb.cached ? 'yes' : 'no'}</span>
              <span>Direct key configured: {summary.sourceHealth.kicksdb.liveKeyConfigured ? 'yes' : 'no'}</span>
              <span>Live proxy fallback available: {summary.sourceHealth.kicksdb.proxyModeAvailable ? 'yes' : 'no'}</span>
              <span>Last attempt: {new Date(summary.sourceHealth.kicksdb.lastAttemptAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-ink">Provider cache</div>
              <StatusDot tone={sourceTone(summary.sourceHealth.cache.status)} />
            </div>
            <div className="mt-1 text-sm text-ink/62">
              {summary.sourceHealth.cache.message ?? `${summary.sourceHealth.cache.totalRows} cached records, ${summary.sourceHealth.cache.expiredRows} expired.`}
            </div>
            <div className="mt-2 grid gap-1 text-xs text-ink/48">
              <span>Latest fetch: {summary.sourceHealth.cache.latestFetchAt ? new Date(summary.sourceHealth.cache.latestFetchAt).toLocaleString() : 'none yet'}</span>
              <span>
                Providers: {summary.sourceHealth.cache.byProvider.length > 0
                  ? summary.sourceHealth.cache.byProvider.map((item) => `${item.provider} (${item.total})`).join(', ')
                  : 'none yet'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Recent automation runs</div>
          <div className="mt-5 space-y-3">
            {summary.recentRuns.length > 0 ? summary.recentRuns.map((run) => (
              <div key={`${run.task}-${run.createdAt}`} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-ink">{run.task}</div>
                  <Badge tone={run.status === 'success' ? 'acid' : 'glitch'}>
                    <StatusDot tone={runTone(run.status)} /> {run.status}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-ink/62">{run.message}</div>
                <div className="mt-1 text-xs text-ink/48">{new Date(run.createdAt).toLocaleString()}</div>
              </div>
            )) : (
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm text-ink/62">
                No automation runs recorded yet.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">What this controls</div>
          <div className="mt-5 space-y-3 text-sm leading-6 text-ink/66">
            <p>Use this page to refresh SEO manifests, verify live route health, run the watchlist event pipeline, send digest emails, and scan/schedule social drafts.</p>
            <p>The runs are logged into the existing growth event store, so admin analytics can trace what automation actually executed instead of leaving it hidden in scripts only.</p>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
