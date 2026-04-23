import { NextResponse } from 'next/server';
import { isAuthorizedSocialRequest } from '@/features/social/auth';
import { runDailySocialDraftScan } from '@/features/social/service';

export async function POST(request: Request) {
  const authorized = await isAuthorizedSocialRequest(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized to scan social content.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const limit = Number.parseInt(body?.limit ?? '8', 10);
  const summary = await runDailySocialDraftScan(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 8);
  return NextResponse.json(summary);
}
