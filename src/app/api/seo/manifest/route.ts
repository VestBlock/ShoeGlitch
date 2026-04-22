import { NextResponse } from 'next/server';
import { buildSeoAutomationManifest } from '@/features/seo/automation';

export const revalidate = 60 * 30;

export async function GET() {
  const manifest = await buildSeoAutomationManifest();
  const byFamily = manifest.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.family] = (acc[entry.family] ?? 0) + 1;
    return acc;
  }, {});
  const byKind = manifest.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.kind] = (acc[entry.kind] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    total: manifest.length,
    byFamily,
    byKind,
    entries: manifest,
  });
}
