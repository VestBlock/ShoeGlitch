import { NextResponse } from 'next/server';
import { isAuthorizedSocialRequest } from '@/features/social/auth';
import { socialStore } from '@/features/social/store';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const authorized = await isAuthorizedSocialRequest(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized to update social drafts.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status;
  const recommendedScheduleAt = typeof body?.recommendedScheduleAt === 'string' ? body.recommendedScheduleAt : undefined;
  const approvalNotes =
    typeof body?.approvalNotes === 'string' || body?.approvalNotes === null
      ? body.approvalNotes
      : undefined;

  if (
    status !== undefined &&
    status !== 'draft' &&
    status !== 'approved' &&
    status !== 'scheduled' &&
    status !== 'published' &&
    status !== 'failed'
  ) {
    return NextResponse.json({ error: 'Invalid social post status.' }, { status: 400 });
  }

  const item = await socialStore.updateForReview(params.id, {
    status,
    recommendedScheduleAt,
    approvalNotes,
  });

  if (!item) {
    return NextResponse.json({ error: 'Social draft not found.' }, { status: 404 });
  }

  return NextResponse.json({ item });
}
