import { NextResponse } from 'next/server';
import { buildReleaseAutomationManifest } from '@/features/releases/automation';

export async function GET() {
  const manifest = await buildReleaseAutomationManifest();
  return NextResponse.json(manifest);
}
