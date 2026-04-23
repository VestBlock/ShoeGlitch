import { promises as fs } from 'fs';
import path from 'path';
import type { ReleaseAutomationManifest } from '@/features/releases/automation';
import { buildReleaseAutomationManifest } from '@/features/releases/automation';
import type { SeoAutomationEntry } from '@/features/seo/automation';
import { buildSeoAutomationManifest } from '@/features/seo/automation';

interface RouteManifestSnapshot {
  generatedAt: string;
  total: number;
  byFamily: Record<string, number>;
  byKind: Record<string, number>;
  entries: SeoAutomationEntry[];
}

export interface AdminManifestStatus {
  label: string;
  updatedAt: string;
  ageHours: number;
  status: 'fresh' | 'warn' | 'stale';
}

export interface AdminSeoSummary {
  routeManifest: RouteManifestSnapshot;
  releaseManifest: ReleaseAutomationManifest;
  routeStatus: AdminManifestStatus;
  releaseStatus: AdminManifestStatus;
  topRouteFamilies: Array<{ family: string; total: number }>;
  topReleaseFamilies: Array<{ family: string; total: number }>;
  routeSamples: SeoAutomationEntry[];
  releaseSamples: ReleaseAutomationManifest['entries'];
}

const ROUTE_MANIFEST_PATH = path.join(process.cwd(), 'public', 'seo', 'route-manifest.json');
const RELEASE_MANIFEST_PATH = path.join(process.cwd(), 'public', 'seo', 'release-content-manifest.json');

async function readJsonFile<T>(filePath: string): Promise<{ data: T | null; updatedAt: string | null }> {
  try {
    const [raw, stats] = await Promise.all([fs.readFile(filePath, 'utf8'), fs.stat(filePath)]);
    return {
      data: JSON.parse(raw) as T,
      updatedAt: stats.mtime.toISOString(),
    };
  } catch {
    return { data: null, updatedAt: null };
  }
}

function hoursSince(iso: string) {
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
}

function buildManifestStatus(label: string, updatedAt: string): AdminManifestStatus {
  const ageHours = hoursSince(updatedAt);

  return {
    label,
    updatedAt,
    ageHours,
    status: ageHours <= 24 ? 'fresh' : ageHours <= 48 ? 'warn' : 'stale',
  };
}

export async function buildAdminSeoSummary(): Promise<AdminSeoSummary> {
  const [routeFile, releaseFile] = await Promise.all([
    readJsonFile<RouteManifestSnapshot>(ROUTE_MANIFEST_PATH),
    readJsonFile<ReleaseAutomationManifest>(RELEASE_MANIFEST_PATH),
  ]);

  const routeManifest =
    routeFile.data ??
    (() => {
      return buildSeoAutomationManifest().then((manifest) => ({
        generatedAt: new Date().toISOString(),
        total: manifest.length,
        byFamily: manifest.reduce<Record<string, number>>((acc, entry) => {
          acc[entry.family] = (acc[entry.family] ?? 0) + 1;
          return acc;
        }, {}),
        byKind: manifest.reduce<Record<string, number>>((acc, entry) => {
          acc[entry.kind] = (acc[entry.kind] ?? 0) + 1;
          return acc;
        }, {}),
        entries: manifest,
      }));
    })();

  const resolvedRouteManifest = routeManifest instanceof Promise ? await routeManifest : routeManifest;
  const resolvedReleaseManifest = releaseFile.data ?? (await buildReleaseAutomationManifest());

  const routeStatus = buildManifestStatus(
    'Route manifest',
    routeFile.updatedAt ?? resolvedRouteManifest.generatedAt,
  );
  const releaseStatus = buildManifestStatus(
    'Release-content manifest',
    releaseFile.updatedAt ?? resolvedReleaseManifest.generatedAt,
  );

  const topRouteFamilies = Object.entries(resolvedRouteManifest.byFamily)
    .map(([family, total]) => ({ family, total }))
    .sort((a, b) => b.total - a.total);

  const topReleaseFamilies = Object.entries(
    resolvedReleaseManifest.entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.family] = (acc[entry.family] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([family, total]) => ({ family, total }))
    .sort((a, b) => b.total - a.total);

  return {
    routeManifest: resolvedRouteManifest,
    releaseManifest: resolvedReleaseManifest,
    routeStatus,
    releaseStatus,
    topRouteFamilies,
    topReleaseFamilies,
    routeSamples: resolvedRouteManifest.entries.slice(0, 8),
    releaseSamples: resolvedReleaseManifest.entries.slice(0, 8),
  };
}
