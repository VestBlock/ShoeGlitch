import { promises as fs } from 'fs';
import path from 'path';
import { buildAdminSeoSummary } from '@/features/admin/seo-reporting';
import { buildAdminSocialSummary } from '@/features/admin/social-reporting';
import { checkRequiredOperationalTables } from '@/features/admin/db-health';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { recordGrowthEvent } from '@/lib/growth/persistence';

type AutomationRunRow = {
  route_path: string;
  event_name: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function adminSafe() {
  try {
    return createAdminSupabaseClient();
  } catch {
    return null;
  }
}

async function getManifestTimestamp(filePath: string) {
  try {
    const stats = await fs.stat(filePath);
    return stats.mtime.toISOString();
  } catch {
    return null;
  }
}

export async function recordAutomationRun(params: {
  task: string;
  status: 'success' | 'failed';
  message: string;
  metadata?: Record<string, unknown>;
}) {
  await recordGrowthEvent({
    routePath: '/admin/automation',
    eventName: 'automation_run',
    metadata: {
      task: params.task,
      status: params.status,
      message: params.message,
      ...(params.metadata ?? {}),
    },
  });
}

export async function buildAdminAutomationSummary() {
  const [seo, social, dbHealth, routeManifestUpdatedAt, releaseManifestUpdatedAt] = await Promise.all([
    buildAdminSeoSummary(),
    buildAdminSocialSummary(),
    checkRequiredOperationalTables(),
    getManifestTimestamp(path.join(process.cwd(), 'public', 'seo', 'route-manifest.json')),
    getManifestTimestamp(path.join(process.cwd(), 'public', 'seo', 'release-content-manifest.json')),
  ]);

  const admin = adminSafe();
  let recentRuns: Array<{
    task: string;
    status: string;
    message: string;
    createdAt: string;
  }> = [];

  if (admin) {
    const { data } = await admin
      .from('growth_events')
      .select('route_path,event_name,metadata,created_at')
      .eq('event_name', 'automation_run')
      .order('created_at', { ascending: false })
      .limit(20);

    recentRuns = ((data ?? []) as AutomationRunRow[]).map((row) => ({
      task: String(row.metadata?.task ?? 'automation'),
      status: String(row.metadata?.status ?? 'unknown'),
      message: String(row.metadata?.message ?? ''),
      createdAt: row.created_at,
    }));
  }

  return {
    seo,
    social,
    dbHealth,
    routeManifestUpdatedAt,
    releaseManifestUpdatedAt,
    recentRuns,
  };
}
