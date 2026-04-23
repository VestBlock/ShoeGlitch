import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Badge, Card, StatusDot } from '@/components/ui';
import { buildAdminSeoSummary } from '@/features/admin/seo-reporting';
import { getSession } from '@/lib/session';

function tone(status: 'fresh' | 'warn' | 'stale') {
  if (status === 'fresh') return 'live' as const;
  if (status === 'warn') return 'warn' as const;
  return 'error' as const;
}

export default async function AdminSeoPage() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') redirect('/login');

  const summary = await buildAdminSeoSummary();

  return (
    <DashboardShell currentPath="/admin/seo" pageTitle="SEO health">
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Badge tone="glitch"><StatusDot tone={tone(summary.routeStatus.status)} /> {summary.routeManifest.total} route targets</Badge>
        <Badge tone="dark"><StatusDot tone={tone(summary.releaseStatus.status)} /> {summary.releaseManifest.counts.total} release targets</Badge>
        <Badge>{summary.releaseManifest.budget.plan} KicksDB plan</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Route manifest</div>
          <div className="h-display text-4xl">{summary.routeManifest.total}</div>
          <div className="mt-2 text-xs text-ink/55">
            Updated {new Date(summary.routeStatus.updatedAt).toLocaleString()}
          </div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Release manifest</div>
          <div className="h-display text-4xl">{summary.releaseManifest.counts.total}</div>
          <div className="mt-2 text-xs text-ink/55">
            Updated {new Date(summary.releaseStatus.updatedAt).toLocaleString()}
          </div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Healthy request budget</div>
          <div className="h-display text-4xl">{summary.releaseManifest.budget.healthyRequestsPerDay}</div>
          <div className="mt-2 text-xs text-ink/55">Requests per day</div>
        </Card>
        <Card className="card-ink">
          <div className="font-mono text-xs text-bone/40 mb-1">Automation posture</div>
          <div className="h-display text-4xl text-bone">
            {summary.routeStatus.status === 'fresh' && summary.releaseStatus.status === 'fresh' ? 'Fresh' : 'Check'}
          </div>
          <div className="mt-2 text-xs text-bone/55">Based on manifest export timestamps</div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Manifest health</div>
              <h2 className="h-display text-3xl mt-2">What is updating</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {[summary.routeStatus, summary.releaseStatus].map((item) => (
              <div key={item.label} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-ink">{item.label}</div>
                  <Badge tone={item.status === 'fresh' ? 'acid' : item.status === 'warn' ? 'default' : 'glitch'}>
                    <StatusDot tone={tone(item.status)} /> {item.status}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-ink/62">
                  Last observed export: {new Date(item.updatedAt).toLocaleString()} ({item.ageHours.toFixed(1)}h ago)
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Release engine budget</div>
          <h2 className="h-display text-3xl mt-2">Current daily publishing guardrails</h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="text-xs text-ink/50 uppercase tracking-widest">Release pages</div>
              <div className="h-display text-3xl mt-2">{summary.releaseManifest.budget.healthyNewReleasePagesPerDay}</div>
            </div>
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="text-xs text-ink/50 uppercase tracking-widest">Worth restoring</div>
              <div className="h-display text-3xl mt-2">{summary.releaseManifest.budget.healthyWorthRestoringPagesPerDay}</div>
            </div>
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="text-xs text-ink/50 uppercase tracking-widest">How to clean</div>
              <div className="h-display text-3xl mt-2">{summary.releaseManifest.budget.healthyHowToCleanPagesPerDay}</div>
            </div>
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="text-xs text-ink/50 uppercase tracking-widest">Alert pages</div>
              <div className="h-display text-3xl mt-2">{summary.releaseManifest.budget.healthyReleaseAlertPagesPerDay}</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-ink/65">{summary.releaseManifest.budget.rationale}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Route families</div>
          <div className="mt-5 space-y-3">
            {summary.topRouteFamilies.map((family) => (
              <div key={family.family} className="flex items-center justify-between rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-3">
                <div className="font-semibold text-ink capitalize">{family.family}</div>
                <div className="font-mono text-sm text-ink/65">{family.total}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Release families</div>
          <div className="mt-5 space-y-3">
            {summary.topReleaseFamilies.map((family) => (
              <div key={family.family} className="flex items-center justify-between rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-3">
                <div className="font-semibold text-ink capitalize">{family.family}</div>
                <div className="font-mono text-sm text-ink/65">{family.total}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Route samples</div>
              <h2 className="h-display text-3xl mt-2">Current SEO targets</h2>
            </div>
            <Link href="/api/seo/manifest" className="btn-ghost text-xs">Manifest →</Link>
          </div>
          <div className="mt-5 space-y-3">
            {summary.routeSamples.map((entry) => (
              <div key={entry.path} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-ink">{entry.path}</div>
                  <Badge>{entry.family}</Badge>
                </div>
                <div className="mt-2 text-sm text-ink/62">{entry.title}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-ink/45">Release samples</div>
              <h2 className="h-display text-3xl mt-2">Current content engine targets</h2>
            </div>
            <Link href="/api/seo/release-manifest" className="btn-ghost text-xs">Release manifest →</Link>
          </div>
          <div className="mt-5 space-y-3">
            {summary.releaseSamples.map((entry) => (
              <div key={entry.path} className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-ink">{entry.path}</div>
                  <Badge tone="glitch">{entry.family}</Badge>
                </div>
                <div className="mt-2 text-sm text-ink/62">{entry.title}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
