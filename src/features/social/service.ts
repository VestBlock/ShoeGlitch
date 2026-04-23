import { buildReleaseAutomationManifest } from '@/features/releases/automation';
import { checkRequiredOperationalTables } from '@/features/admin/db-health';
import { getIntelligenceRouteIndex } from '@/features/intelligence/service';
import { buildSeoAutomationManifest } from '@/features/seo/automation';
import { scheduleBufferPost, syncBufferPostStatuses } from '@/features/social/buffer';
import { extractSocialSourceFromPath } from '@/features/social/extract';
import { buildSocialPayload } from '@/features/social/generate';
import { socialStore } from '@/features/social/store';
import type {
  SocialPageType,
  SocialPlatformTarget,
  SocialPublishSummary,
  SocialQueueRecord,
  SocialQueueSummary,
} from '@/features/social/types';

function compareIso(left?: string | null, right?: string | null) {
  if (!left && !right) return 0;
  if (!left) return -1;
  if (!right) return 1;
  return new Date(left).getTime() - new Date(right).getTime();
}

function buildContentKey(routePath: string, contentAngle: string, platform: string, sourceUpdatedAt: string) {
  return `${routePath}|${contentAngle}|${platform}|${sourceUpdatedAt}`;
}

function socialEligibleSeoEntry(path: string) {
  return (
    path === '/locations' ||
    path.startsWith('/sneaker-cleaning') ||
    path.startsWith('/shoe-restoration') ||
    path.startsWith('/pickup-dropoff') ||
    path.startsWith('/locations/')
  );
}

function activeStatusPriority(status: SocialQueueRecord['status']) {
  switch (status) {
    case 'scheduled':
      return 4;
    case 'approved':
      return 3;
    case 'draft':
      return 2;
    case 'failed':
      return 1;
    case 'published':
      return 0;
    default:
      return 0;
  }
}

function routePriority(pageType: SocialPageType) {
  switch (pageType) {
    case 'release':
      return 5;
    case 'how-to-clean':
      return 4;
    case 'release-alerts':
      return 3;
    case 'worth-restoring':
      return 3;
    case 'service-city':
    case 'service-area':
      return 2;
    default:
      return 1;
  }
}

export async function createSocialDraftForPath(path: string, force = false, sourceUpdatedAtOverride?: string) {
  const source = await extractSocialSourceFromPath(path, sourceUpdatedAtOverride);
  if (!source) {
    return { status: 'skipped' as const, reason: `No social extraction model exists for ${path}.`, draft: null };
  }

  const platforms: SocialPlatformTarget[] = ['instagram', 'tiktok'];
  let primaryDraft: SocialQueueRecord | null = null;
  let createdAny = false;
  let duplicateOnly = true;
  const reasons: string[] = [];

  for (const platform of platforms) {
    const payload = buildSocialPayload(source, platform);
    const latest = await socialStore.latestForRouteAngle(
      source.routePath,
      payload.contentAngle,
      payload.socialPlatformTarget,
    );

    if (!force && latest) {
      const sameOrNewer = compareIso(latest.sourceUpdatedAt, source.sourceUpdatedAt) >= 0;
      if (latest.status === 'scheduled' || latest.status === 'published') {
        reasons.push(
          `A ${latest.status} ${platform} candidate already exists for ${source.routePath} and angle ${payload.contentAngle}.`,
        );
        primaryDraft ??= latest;
        continue;
      }

      if (sameOrNewer || latest.status === 'draft' || latest.status === 'approved' || latest.status === 'failed') {
        if (latest.status === 'draft' || latest.status === 'failed' || latest.status === 'approved') {
          const refreshed = await socialStore.updateContent(latest.id, {
            hook: payload.hook,
            caption: payload.caption,
            hashtags: payload.hashtags,
            recommendedScheduleAt: payload.recommendedScheduleAt,
            approvalNotes: latest.approvalNotes ?? null,
          });
          const recycled =
            latest.status === 'failed' || latest.status === 'approved'
              ? await socialStore.updateForReview(latest.id, {
                  status: latest.status === 'approved' ? 'approved' : 'draft',
                  recommendedScheduleAt: payload.recommendedScheduleAt,
                  approvalNotes: latest.approvalNotes ?? null,
                })
              : refreshed;
          reasons.push(
            recycled
              ? latest.status === 'failed'
                ? `Recycled failed ${platform} candidate for ${source.routePath} back into draft status.`
                : latest.status === 'approved'
                  ? `Refreshed approved ${platform} candidate for ${source.routePath} without creating a duplicate.`
                  : `Refreshed draft ${platform} candidate for ${source.routePath} and angle ${payload.contentAngle}.`
              : `A draft ${platform} candidate already exists for ${source.routePath} and angle ${payload.contentAngle}.`,
          );
          primaryDraft ??= recycled ?? refreshed ?? latest;
          continue;
        }

        reasons.push(`A ${latest.status} ${platform} candidate already exists for ${source.routePath} and angle ${payload.contentAngle}.`);
        primaryDraft ??= latest;
        continue;
      }
    }

    const contentKey = buildContentKey(
      source.routePath,
      payload.contentAngle,
      payload.socialPlatformTarget,
      source.sourceUpdatedAt,
    );

    const draft = await socialStore.createDraft({
      source,
      contentKey,
      contentAngle: payload.contentAngle,
      targetPlatform: payload.socialPlatformTarget,
      title: source.title,
      shortSummary: source.shortSummary,
      hook: payload.hook,
      caption: payload.caption,
      hashtags: payload.hashtags,
      imageUrl: payload.imageUrl,
      canonicalLink: payload.canonicalLink,
      recommendedScheduleAt: payload.recommendedScheduleAt,
      metadata: {
        ...source.metadata,
        ...payload.metadata,
      },
    });

    if (draft) {
      createdAny = true;
      duplicateOnly = false;
      primaryDraft ??= draft;
      reasons.push(`Created ${platform} draft for ${source.routePath}.`);
    } else {
      duplicateOnly = false;
      reasons.push(
        `Failed to create ${platform} social draft for ${source.routePath}. Confirm the social_post_queue table exists and Supabase admin access is configured.`,
      );
    }
  }

  if (createdAny) {
    return {
      status: 'created' as const,
      reason: reasons.join(' '),
      draft: primaryDraft,
    };
  }

  if (duplicateOnly) {
    return {
      status: 'duplicate' as const,
      reason: reasons.join(' '),
      draft: primaryDraft,
    };
  }

  return {
    status: 'failed' as const,
    reason: reasons.join(' '),
    draft: primaryDraft,
  };
}

export async function cleanupSocialQueueDuplicates(limit = 250) {
  const rows = await socialStore.listQueue({ limit });
  const grouped = new Map<string, SocialQueueRecord[]>();

  for (const row of rows) {
    const key = `${row.routePath}|${row.contentAngle}|${row.targetPlatform}`;
    const existing = grouped.get(key) ?? [];
    existing.push(row);
    grouped.set(key, existing);
  }

  const idsToDelete: string[] = [];
  const messages: string[] = [];

  for (const [key, entries] of grouped) {
    if (entries.length <= 1) continue;

    const sorted = [...entries].sort((left, right) => {
      const priority = activeStatusPriority(right.status) - activeStatusPriority(left.status);
      if (priority !== 0) return priority;
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });

    const keeper = sorted[0];
    const removable = sorted.slice(1).filter((entry) => entry.status !== 'published');
    if (removable.length === 0) continue;

    idsToDelete.push(...removable.map((entry) => entry.id));
    messages.push(`Kept ${keeper.routePath} (${keeper.status}) and removed ${removable.length} duplicate queue item(s).`);
  }

  const deleted = await socialStore.deleteMany(idsToDelete);

  return {
    scanned: rows.length,
    deleted,
    messages,
  };
}

export async function runDailySocialDraftScan(limit = 8): Promise<SocialQueueSummary> {
  const dbHealth = await checkRequiredOperationalTables();
  const socialQueue = dbHealth.tables.find((table) => table.table === 'social_post_queue');
  if (!socialQueue?.ok) {
    return {
      created: 0,
      skippedDuplicates: 0,
      failed: 0,
      drafts: [],
      messages: [
        `Social queue table is missing. Apply ${socialQueue?.migration ?? 'supabase/migrations/20260422_social_automation.sql'} before scanning drafts.`,
      ],
    };
  }

  const [releaseManifest, seoManifest] = await Promise.all([
    buildReleaseAutomationManifest(),
    buildSeoAutomationManifest(),
  ]);
  const intelligenceIndex = await getIntelligenceRouteIndex();

  const candidatePoolSize = Math.max(limit * 8, 40);
  const candidatePaths = [
    ...releaseManifest.entries
      .sort((a, b) => {
        const priority = routePriority(a.family as SocialPageType) - routePriority(b.family as SocialPageType);
        if (priority !== 0) return priority * -1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, candidatePoolSize)
      .map((entry) => ({ path: entry.path, sourceUpdatedAt: entry.updatedAt })),
    ...seoManifest
      .filter((entry) => socialEligibleSeoEntry(entry.path))
      .slice(0, Math.max(8, Math.floor(candidatePoolSize / 3)))
      .map((entry) => ({ path: entry.path, sourceUpdatedAt: releaseManifest.generatedAt })),
    ...intelligenceIndex
      .filter((entry) => entry.provider === 'nike-public')
      .slice(0, Math.max(8, Math.floor(candidatePoolSize / 2)))
      .map((entry) => ({ path: entry.path, sourceUpdatedAt: entry.updatedAt })),
  ];

  const uniqueCandidates = Array.from(new Map(candidatePaths.map((candidate) => [candidate.path, candidate])).values());
  const drafts: SocialQueueRecord[] = [];
  const messages: string[] = [];
  let created = 0;
  let skippedDuplicates = 0;
  let failed = 0;

  for (const candidate of uniqueCandidates) {
    if (created >= limit) break;
    const result = await createSocialDraftForPath(candidate.path, false, candidate.sourceUpdatedAt);
    if (result.status === 'created' && result.draft) {
      created += 1;
      drafts.push(result.draft);
    } else if (result.status === 'duplicate') {
      skippedDuplicates += 1;
      messages.push(result.reason);
    } else if (result.status === 'failed') {
      failed += 1;
      messages.push(result.reason);
    }
  }

  return { created, skippedDuplicates, failed, drafts, messages };
}

export async function publishApprovedSocialQueue(limit = 5): Promise<SocialPublishSummary> {
  const approved = await socialStore.listApproved(limit);
  const summary: SocialPublishSummary = {
    scheduled: 0,
    published: 0,
    failed: 0,
    skipped: 0,
    messages: [],
  };

  for (const record of approved) {
    try {
      const scheduled = await scheduleBufferPost(record);
      await socialStore.markScheduled(record.id, {
        externalPostId: scheduled.externalPostId,
        provider: 'buffer',
        scheduledAt: scheduled.scheduledAt,
        metadata: {
          ...record.metadata,
          ...scheduled.metadata,
        },
      });
      summary.scheduled += 1;
      summary.messages.push(`Scheduled ${record.routePath} to Buffer.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Buffer scheduling failed.';
      await socialStore.markFailed(record.id, message);
      summary.failed += 1;
      summary.messages.push(`Failed ${record.routePath}: ${message}`);
    }
  }

  const syncResult = await syncScheduledSocialQueue();
  summary.published += syncResult.published;
  summary.failed += syncResult.failed;
  summary.messages.push(...syncResult.messages);

  return summary;
}

export async function syncScheduledSocialQueue(limit = 20): Promise<SocialPublishSummary> {
  const scheduled = await socialStore.listScheduled(limit);
  const externalIds = scheduled
    .map((record) => record.externalPostId)
    .filter((id): id is string => Boolean(id));

  const summary: SocialPublishSummary = {
    scheduled: 0,
    published: 0,
    failed: 0,
    skipped: 0,
    messages: [],
  };

  if (externalIds.length === 0) return summary;

  try {
    const statuses = await syncBufferPostStatuses(externalIds);
    for (const post of statuses) {
      const record = scheduled.find((entry) => entry.externalPostId === post.id);
      if (!record) continue;

      if (post.status === 'sent') {
        await socialStore.markPublished(record.id, post.dueAt ?? new Date().toISOString());
        summary.published += 1;
        summary.messages.push(`Marked ${record.routePath} as published.`);
      } else if (post.status === 'error') {
        await socialStore.markFailed(record.id, 'Buffer reported an error publishing this post.');
        summary.failed += 1;
        summary.messages.push(`Marked ${record.routePath} as failed after Buffer sync.`);
      } else {
        summary.skipped += 1;
      }
    }
  } catch (error) {
    summary.failed += 1;
    summary.messages.push(error instanceof Error ? error.message : 'Buffer sync failed.');
  }

  return summary;
}
