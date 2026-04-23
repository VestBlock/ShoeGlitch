import { NextResponse } from 'next/server';
import { createSocialDraftForPath } from '@/features/social/service';
import { socialStore } from '@/features/social/store';
import { isAuthorizedSocialRequest } from '@/features/social/auth';

export async function GET(request: Request) {
  const authorized = await isAuthorizedSocialRequest(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized to view social queue.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? undefined;
  const limit = Number.parseInt(searchParams.get('limit') ?? '25', 10);

  const items = await socialStore.listQueue({
    status: status === 'draft' || status === 'approved' || status === 'scheduled' || status === 'published' || status === 'failed' ? status : undefined,
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 25,
  });

  return NextResponse.json({ items, count: items.length });
}

export async function POST(request: Request) {
  const authorized = await isAuthorizedSocialRequest(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized to create social drafts.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const path = typeof body?.path === 'string' ? body.path.trim() : '';
  const force = Boolean(body?.force);
  const sourceUpdatedAt = typeof body?.sourceUpdatedAt === 'string' ? body.sourceUpdatedAt : undefined;

  if (!path.startsWith('/')) {
    return NextResponse.json({ error: 'Provide a valid route path.' }, { status: 400 });
  }

  const result = await createSocialDraftForPath(path, force, sourceUpdatedAt);
  const status =
    result.status === 'created'
      ? 201
      : result.status === 'duplicate' || result.status === 'skipped'
        ? 200
        : 500;

  return NextResponse.json(result, { status });
}
