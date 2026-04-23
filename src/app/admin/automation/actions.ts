'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { buildReleaseAutomationManifest } from '@/features/releases/automation';
import { buildSeoAutomationManifest } from '@/features/seo/automation';
import { publishApprovedSocialQueue, runDailySocialDraftScan } from '@/features/social/service';
import { recordAutomationRun } from '@/features/admin/automation-reporting';
import { buildRouteManifestSnapshot } from '@/features/admin/seo-reporting';
import { runMockWatchlistScan, sendWatchlistDigestBatch } from '@/features/intelligence/watchlist/service';
import { getSession } from '@/lib/session';

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Admin only');
  }
}

async function saveJson(filePath: string, payload: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
}

function withResult(message: string) {
  redirect(`/admin/automation?notice=${encodeURIComponent(message)}`);
}

export async function runSeoAutomationAction() {
  await requireSuperAdmin();

  try {
    const [routeEntries, releaseManifest] = await Promise.all([
      buildSeoAutomationManifest(),
      buildReleaseAutomationManifest(),
    ]);

    const routeManifest = buildRouteManifestSnapshot(routeEntries);

    await Promise.all([
      saveJson(path.join(process.cwd(), 'public', 'seo', 'route-manifest.json'), routeManifest),
      saveJson(path.join(process.cwd(), 'public', 'seo', 'release-content-manifest.json'), releaseManifest),
    ]);

    await recordAutomationRun({
      task: 'seo-refresh',
      status: 'success',
      message: `Refreshed ${routeManifest.total} SEO routes and ${releaseManifest.counts.total} release-content routes.`,
      metadata: {
        routeTotal: routeManifest.total,
        releaseTotal: releaseManifest.counts.total,
      },
    });
    revalidatePath('/admin/seo');
    revalidatePath('/admin/automation');
    withResult('SEO automation refreshed successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SEO automation failed.';
    await recordAutomationRun({ task: 'seo-refresh', status: 'failed', message });
    withResult(`SEO automation failed: ${message}`);
  }
}

async function verifyRoute(url: string, expectRedirect = false) {
  const response = await fetch(url, { redirect: expectRedirect ? 'manual' : 'follow' });
  const body = await response.text();
  const ok = expectRedirect
    ? response.status >= 300 && response.status < 400
    : response.ok && /<h1[\s>]/i.test(body) && /<title>.*<\/title>/i.test(body);
  return { ok, status: response.status, url };
}

export async function runRouteQaAction() {
  await requireSuperAdmin();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  try {
    const checks = await Promise.all([
      verifyRoute(`${baseUrl}/`),
      verifyRoute(`${baseUrl}/sneaker-cleaning`),
      verifyRoute(`${baseUrl}/become-an-operator`),
      verifyRoute(`${baseUrl}/intelligence`),
      verifyRoute(`${baseUrl}/customer/watchlist`, true),
      verifyRoute(`${baseUrl}/admin/social`, true),
    ]);

    const failures = checks.filter((item) => !item.ok);
    const message =
      failures.length === 0
        ? `Route QA passed for ${checks.length} checks.`
        : `Route QA found ${failures.length} failing routes.`;

    await recordAutomationRun({
      task: 'route-qa',
      status: failures.length === 0 ? 'success' : 'failed',
      message,
      metadata: {
        checked: checks.length,
        failures: failures.map((item) => ({ url: item.url, status: item.status })),
      },
    });
    revalidatePath('/admin/automation');
    withResult(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Route QA failed.';
    await recordAutomationRun({ task: 'route-qa', status: 'failed', message });
    withResult(`Route QA failed: ${message}`);
  }
}

export async function runWatchlistAutomationAction() {
  await requireSuperAdmin();

  try {
    const summary = await runMockWatchlistScan();
    const message = `Watchlist scan processed ${summary.processedEvents} events and sent ${summary.sentAlerts} alerts.`;
    await recordAutomationRun({
      task: 'watchlist-scan',
      status: 'success',
      message,
      metadata: summary,
    });
    revalidatePath('/admin/automation');
    withResult(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Watchlist scan failed.';
    await recordAutomationRun({ task: 'watchlist-scan', status: 'failed', message });
    withResult(`Watchlist scan failed: ${message}`);
  }
}

export async function runWatchlistDigestAction() {
  await requireSuperAdmin();

  try {
    const summary = await sendWatchlistDigestBatch();
    const message = `Watchlist digest sent ${summary.sentDigests} digests across ${summary.processedUsers} users.`;
    await recordAutomationRun({
      task: 'watchlist-digest',
      status: 'success',
      message,
      metadata: summary,
    });
    revalidatePath('/admin/automation');
    withResult(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Watchlist digest failed.';
    await recordAutomationRun({ task: 'watchlist-digest', status: 'failed', message });
    withResult(`Watchlist digest failed: ${message}`);
  }
}

export async function runSocialAutomationAction() {
  await requireSuperAdmin();

  try {
    const [scan, publish] = await Promise.all([runDailySocialDraftScan(), publishApprovedSocialQueue()]);
    const message = `Social automation created ${scan.created} drafts and scheduled ${publish.scheduled} posts.`;
    await recordAutomationRun({
      task: 'social-automation',
      status: 'success',
      message,
      metadata: {
        scan,
        publish,
      },
    });
    revalidatePath('/admin/social');
    revalidatePath('/admin/automation');
    withResult(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Social automation failed.';
    await recordAutomationRun({ task: 'social-automation', status: 'failed', message });
    withResult(`Social automation failed: ${message}`);
  }
}
