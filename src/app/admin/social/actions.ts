'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { publishApprovedSocialQueue, runDailySocialDraftScan } from '@/features/social/service';
import { getBufferAvailability, scheduleBufferInstagramPost } from '@/features/social/buffer';
import { socialStore } from '@/features/social/store';
import { recordAutomationRun } from '@/features/admin/automation-reporting';
import { getSession } from '@/lib/session';

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Admin only');
  }
}

function finish(message: string): never {
  redirect(`/admin/social?notice=${encodeURIComponent(message)}`);
}

function finishError(message: string): never {
  redirect(`/admin/social?notice=${encodeURIComponent(message)}`);
}

function normalizeScheduleInput(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function parseHashtags(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return undefined;
  return value
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
}

export async function saveSocialDraftAction(formData: FormData) {
  await requireSuperAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) finish('Missing social draft id.');

  const hook = String(formData.get('hook') ?? '').trim();
  const caption = String(formData.get('caption') ?? '').trim();
  const hashtags = parseHashtags(formData.get('hashtags'));
  const recommendedScheduleAt = normalizeScheduleInput(formData.get('recommendedScheduleAt'));
  const approvalNotes = String(formData.get('approvalNotes') ?? '').trim() || null;

  const item = await socialStore.updateContent(id, {
    hook,
    caption,
    hashtags,
    recommendedScheduleAt,
    approvalNotes,
  });

  revalidatePath('/admin/social');
  finish(item ? 'Social draft saved.' : 'Unable to save that social draft.');
}

export async function approveSocialDraftAction(formData: FormData) {
  await requireSuperAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) finish('Missing social draft id.');

  const item = await socialStore.updateForReview(id, {
    status: 'approved',
    recommendedScheduleAt: normalizeScheduleInput(formData.get('recommendedScheduleAt')),
    approvalNotes: String(formData.get('approvalNotes') ?? '').trim() || null,
  });

  revalidatePath('/admin/social');
  finish(item ? 'Social draft approved. Use “Send to Buffer now” on the row or “Schedule approved” at the top to push it into Buffer.' : 'Unable to approve that social draft.');
}

export async function scheduleSocialDraftNowAction(formData: FormData) {
  await requireSuperAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) finishError('Missing social draft id.');

  const buffer = getBufferAvailability();
  if (!buffer.configured) {
    finishError('Buffer is not configured yet. Add the Buffer token before scheduling.');
  }

  const item = await socialStore.getById(id);
  if (!item) {
    finishError('That social post could not be found.');
  }

  const staged = await socialStore.updateForReview(id, {
    status: 'approved',
    recommendedScheduleAt: normalizeScheduleInput(formData.get('recommendedScheduleAt')) ?? item.recommendedScheduleAt,
    approvalNotes: String(formData.get('approvalNotes') ?? '').trim() || null,
  });

  if (!staged) {
    finishError('Unable to stage that post for scheduling.');
  }

  try {
    const scheduled = await scheduleBufferInstagramPost(staged);
    await socialStore.markScheduled(staged.id, {
      externalPostId: scheduled.externalPostId,
      provider: 'buffer',
      scheduledAt: scheduled.scheduledAt,
      metadata: {
        ...staged.metadata,
        ...scheduled.metadata,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Buffer scheduling failed.';
    await socialStore.markFailed(staged.id, message);
    revalidatePath('/admin/social');
    finishError(`Buffer rejected that post: ${message}`);
  }

  revalidatePath('/admin/social');
  finish('Social post scheduled to Buffer.');
}

export async function returnSocialDraftAction(formData: FormData) {
  await requireSuperAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) finish('Missing social draft id.');

  const item = await socialStore.updateForReview(id, {
    status: 'draft',
    approvalNotes: String(formData.get('approvalNotes') ?? '').trim() || null,
  });

  revalidatePath('/admin/social');
  finish(item ? 'Social post returned to draft.' : 'Unable to update that social post.');
}

export async function failSocialDraftAction(formData: FormData) {
  await requireSuperAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) finish('Missing social draft id.');

  const message = String(formData.get('approvalNotes') ?? '').trim() || 'Rejected during admin review.';
  const item = await socialStore.markFailed(id, message);

  revalidatePath('/admin/social');
  finish(item ? 'Social post marked as failed/rejected.' : 'Unable to update that social post.');
}

export async function scanSocialDraftsAction() {
  await requireSuperAdmin();

  const summary = await runDailySocialDraftScan();
  await recordAutomationRun({
    task: 'social-scan',
    status: summary.failed > 0 ? 'failed' : 'success',
    message: `Created ${summary.created} drafts, skipped ${summary.skippedDuplicates}, failed ${summary.failed}.`,
    metadata: { ...summary },
  });

  revalidatePath('/admin/social');
  finish(`Social scan created ${summary.created} drafts and skipped ${summary.skippedDuplicates} duplicates.`);
}

export async function publishApprovedSocialAction() {
  await requireSuperAdmin();

  const summary = await publishApprovedSocialQueue();
  await recordAutomationRun({
    task: 'social-publish',
    status: summary.failed > 0 ? 'failed' : 'success',
    message: `Scheduled ${summary.scheduled}, published ${summary.published}, failed ${summary.failed}.`,
    metadata: { ...summary },
  });

  revalidatePath('/admin/social');
  finish(`Social publish run scheduled ${summary.scheduled} posts and failed ${summary.failed}.`);
}
