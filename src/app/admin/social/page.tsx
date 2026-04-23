import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, StatusDot } from '@/components/ui';
import { buildAdminSocialSummary } from '@/features/admin/social-reporting';
import { getSession } from '@/lib/session';

function tone(status: 'live' | 'empty' | 'unavailable') {
  if (status === 'live') return 'ok' as const;
  if (status === 'empty') return 'warn' as const;
  return 'error' as const;
}

export default async function AdminSocialPage() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const summary = await buildAdminSocialSummary();

  return (
    <DashboardShell currentPath="/admin/social" pageTitle="Social automation">
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Badge tone={summary.buffer.configured ? 'acid' : 'glitch'}>
          <StatusDot tone={summary.buffer.configured ? 'ok' : 'error'} /> Buffer {summary.buffer.configured ? 'configured' : 'not configured'}
        </Badge>
        <Badge tone={summary.queueStatus === 'live' ? 'acid' : summary.queueStatus === 'empty' ? 'default' : 'glitch'}>
          <StatusDot tone={tone(summary.queueStatus)} /> Queue {summary.queueStatus}
        </Badge>
        <Badge>{summary.buffer.organizationCount} orgs</Badge>
        <Badge>{summary.buffer.channelCount} Instagram channels</Badge>
      </div>

      {summary.queueMessage ? (
        <Card className="mb-8">
          <div className="text-sm leading-6 text-ink/66">{summary.queueMessage}</div>
        </Card>
      ) : null}

      {summary.buffer.error ? (
        <Card className="mb-8">
          <div className="text-sm leading-6 text-ink/66">
            Buffer is configured, but discovery returned an error: {summary.buffer.error}
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Drafts</div>
          <div className="h-display text-4xl">{summary.totals.drafts}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Approved</div>
          <div className="h-display text-4xl">{summary.totals.approved}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Scheduled</div>
          <div className="h-display text-4xl">{summary.totals.scheduled}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Published</div>
          <div className="h-display text-4xl">{summary.totals.published}</div>
        </Card>
        <Card className="card-ink">
          <div className="font-mono text-xs text-bone/40 mb-1">Failed</div>
          <div className="h-display text-4xl text-bone">{summary.totals.failed}</div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Buffer setup</div>
          <div className="mt-5 space-y-3">
            {summary.buffer.organizations.length > 0 ? summary.buffer.organizations.map((organization) => (
              <div key={organization.id} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                <div className="font-semibold text-ink">{organization.name}</div>
                <div className="mt-1 text-xs text-ink/48">{organization.id}</div>
              </div>
            )) : (
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm text-ink/62">
                {summary.buffer.configured
                  ? 'No organizations were discovered yet. This can mean the token lacks the needed access, or the organization id still needs to be set explicitly.'
                  : summary.buffer.reason}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Instagram channels</div>
          <div className="mt-5 space-y-3">
            {summary.buffer.channels.length > 0 ? summary.buffer.channels.map((channel) => (
              <div key={channel.id} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-ink">{channel.displayName ?? channel.name}</div>
                    <div className="mt-1 text-xs text-ink/48">{channel.id}</div>
                  </div>
                  <Badge tone={channel.paused ? 'default' : 'acid'}>
                    <StatusDot tone={channel.paused ? 'warn' : 'ok'} /> {channel.paused ? 'paused' : 'ready'}
                  </Badge>
                </div>
              </div>
            )) : (
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm text-ink/62">
                Instagram channels will appear here once Buffer discovery succeeds.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Recent queue items</div>
        <div className="mt-5 space-y-3">
          {summary.recentQueue.length > 0 ? summary.recentQueue.map((item) => (
            <div key={item.id} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="font-semibold text-ink">{item.routePath}</div>
                <Badge tone={item.status === 'published' ? 'acid' : item.status === 'failed' ? 'glitch' : 'default'}>
                  {item.status}
                </Badge>
              </div>
              <div className="mt-2 text-sm text-ink/62">{item.hook}</div>
              <div className="mt-1 text-xs text-ink/48">
                {item.contentAngle} · {item.targetPlatform} · {new Date(item.updatedAt).toLocaleString()}
              </div>
            </div>
          )) : (
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm text-ink/62">
              No social queue records yet.
            </div>
          )}
        </div>
      </Card>
    </DashboardShell>
  );
}
