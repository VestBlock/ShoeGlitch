import { redirect } from 'next/navigation';
import Image from 'next/image';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, StatusDot } from '@/components/ui';
import { buildAdminSocialSummary } from '@/features/admin/social-reporting';
import {
  approveSocialDraftAction,
  createMoreSocialDraftsAction,
  failSocialDraftAction,
  publishApprovedSocialAction,
  returnSocialDraftAction,
  saveSocialDraftAction,
  scanSocialDraftsAction,
  scheduleSocialDraftNowAction,
} from '@/app/admin/social/actions';
import { getSession } from '@/lib/session';
import type { SocialQueueRecord } from '@/features/social/types';

function tone(status: 'live' | 'empty' | 'unavailable') {
  if (status === 'live') return 'ok' as const;
  if (status === 'empty') return 'warn' as const;
  return 'error' as const;
}

function toLocalDateTimeInput(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function QueueSection({
  title,
  items,
}: {
  title: string;
  items: SocialQueueRecord[];
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-xs uppercase tracking-widest text-ink/45">{title}</div>
        <Badge>{items.length} items</Badge>
      </div>
      <div className="mt-5 space-y-3">
        {items.length > 0 ? items.map((item) => (
          <div key={item.id} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
            <div className="grid gap-4 md:grid-cols-[148px_minmax(0,1fr)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] border border-ink/10 bg-white">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="148px"
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-xs font-semibold uppercase tracking-widest text-ink/35">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink">{item.title}</div>
                    <div className="mt-1 truncate font-mono text-xs text-ink/45">{item.routePath}</div>
                  </div>
                  <Badge tone={item.status === 'published' ? 'acid' : item.status === 'failed' ? 'glitch' : 'default'}>
                    {item.status}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-ink/62">{item.hook}</div>
                <div className="mt-1 text-xs text-ink/48">
                  {item.contentAngle} · {item.targetPlatform} · {new Date(item.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
            <form action={saveSocialDraftAction} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={item.id} />
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-widest text-ink/45">
                Hook
                <input
                  name="hook"
                  defaultValue={item.hook}
                  className="rounded-[0.9rem] border border-ink/10 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-widest text-ink/45">
                Caption
                <textarea
                  name="caption"
                  defaultValue={item.caption}
                  rows={5}
                  className="rounded-[0.9rem] border border-ink/10 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink"
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-widest text-ink/45">
                  Hashtags
                  <input
                    name="hashtags"
                    defaultValue={item.hashtags.join(' ')}
                    className="rounded-[0.9rem] border border-ink/10 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-widest text-ink/45">
                  Schedule
                  <input
                    name="recommendedScheduleAt"
                    type="datetime-local"
                    defaultValue={toLocalDateTimeInput(item.recommendedScheduleAt)}
                    className="rounded-[0.9rem] border border-ink/10 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink"
                  />
                </label>
              </div>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-widest text-ink/45">
                Review note
                <input
                  name="approvalNotes"
                  defaultValue={item.approvalNotes ?? ''}
                  className="rounded-[0.9rem] border border-ink/10 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button className="btn-glitch-ghost" type="submit">Save edits</button>
                <button
                  className="btn-glitch"
                  formAction={approveSocialDraftAction}
                  type="submit"
                  disabled={item.status === 'scheduled' || item.status === 'published'}
                >
                  Approve only
                </button>
                <button
                  className="btn-primary"
                  formAction={scheduleSocialDraftNowAction}
                  type="submit"
                  disabled={item.status === 'scheduled' || item.status === 'published'}
                >
                  Send to Buffer now
                </button>
                <button className="btn-glitch-ghost" formAction={returnSocialDraftAction} type="submit">
                  Return to draft
                </button>
                <button className="btn-glitch-ghost" formAction={failSocialDraftAction} type="submit">
                  Reject
                </button>
              </div>
            </form>
          </div>
        )) : (
          <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm text-ink/62">
            No queue items for this platform yet.
          </div>
        )}
      </div>
    </Card>
  );
}

export default async function AdminSocialPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const summary = await buildAdminSocialSummary();
  const params = (await searchParams) ?? {};
  const notice = typeof params.notice === 'string' ? params.notice : null;
  const instagramQueue = summary.recentQueue.filter((item) => item.targetPlatform === 'instagram');
  const tiktokQueue = summary.recentQueue.filter((item) => item.targetPlatform === 'tiktok');

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
        <Badge>{summary.buffer.instagramChannelCount} Instagram</Badge>
        <Badge>{summary.buffer.tiktokChannelCount} TikTok</Badge>
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

      {notice ? (
        <Card className="mb-8">
          <div className="text-sm leading-6 text-ink/66">{notice}</div>
        </Card>
      ) : null}

      <Card className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Review workflow</div>
            <div className="mt-2 text-sm leading-6 text-ink/66">
              Drafts are review-first. “Approve only” keeps a post in the internal queue. “Send to Buffer now” schedules it immediately if Buffer is ready.
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <form action={scanSocialDraftsAction}>
              <button className="btn-glitch-ghost">Scan for drafts</button>
            </form>
            <form action={publishApprovedSocialAction}>
              <button className="btn-glitch">Schedule approved</button>
            </form>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink/45">Create more drafts</span>
          {[8, 16, 24, 50].map((limit) => (
            <form key={limit} action={createMoreSocialDraftsAction}>
              <input type="hidden" name="limit" value={String(limit)} />
              <button className="btn-glitch-ghost" type="submit">{limit} more</button>
            </form>
          ))}
        </div>
      </Card>

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
            {summary.buffer.instagramChannels.length > 0 ? summary.buffer.instagramChannels.map((channel) => (
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

      <Card className="mb-10">
        <div className="font-mono text-xs uppercase tracking-widest text-ink/45">TikTok channels</div>
        <div className="mt-5 space-y-3">
          {summary.buffer.tiktokChannels.length > 0 ? summary.buffer.tiktokChannels.map((channel) => (
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
              TikTok channels will appear here once Buffer discovery succeeds.
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <QueueSection title="Instagram queue" items={instagramQueue} />
        <QueueSection title="TikTok queue" items={tiktokQueue} />
      </div>
    </DashboardShell>
  );
}
