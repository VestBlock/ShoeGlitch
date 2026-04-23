import { NextResponse } from 'next/server';
import { getBufferAvailability } from '@/features/social/buffer';
import { isAuthorizedSocialRequest } from '@/features/social/auth';
import { publishApprovedSocialQueue, syncScheduledSocialQueue } from '@/features/social/service';

export async function POST(request: Request) {
  const authorized = await isAuthorizedSocialRequest(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized to publish social queue.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const mode = body?.mode === 'sync' ? 'sync' : 'publish';
  const limit = Number.parseInt(body?.limit ?? '5', 10);
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 25) : 5;
  const buffer = getBufferAvailability();

  if (mode === 'sync') {
    const summary = await syncScheduledSocialQueue(safeLimit);
    return NextResponse.json({ mode, buffer, ...summary });
  }

  const summary = await publishApprovedSocialQueue(safeLimit);
  return NextResponse.json({ mode, buffer, ...summary });
}
