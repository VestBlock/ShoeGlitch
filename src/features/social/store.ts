import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type {
  SocialContentAngle,
  SocialPlatformTarget,
  SocialPostStatus,
  SocialQueueRecord,
  SocialSourceExtract,
} from '@/features/social/types';

const adminSafe = () => {
  try {
    return createAdminSupabaseClient();
  } catch {
    return null;
  }
};

function mapQueueRow(row: any): SocialQueueRecord {
  return {
    id: row.id,
    routePath: row.route_path,
    pageType: row.page_type,
    sourceKind: row.source_kind,
    contentAngle: row.content_angle,
    targetPlatform: row.target_platform,
    contentKey: row.content_key,
    title: row.title,
    shortSummary: row.short_summary,
    hook: row.hook,
    caption: row.caption,
    hashtags: row.hashtags ?? [],
    imageUrl: row.image_url,
    canonicalLink: row.canonical_link,
    publishDate: row.publish_date,
    sourceUpdatedAt: row.source_updated_at,
    recommendedScheduleAt: row.recommended_schedule_at,
    status: row.status,
    approvalNotes: row.approval_notes,
    externalProvider: row.external_provider,
    externalPostId: row.external_post_id,
    errorMessage: row.error_message,
    metadata: row.metadata ?? {},
    scheduledAt: row.scheduled_at,
    publishedAt: row.published_at,
    lastAttemptAt: row.last_attempt_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const socialStore = {
  async latestForRouteAngle(routePath: string, contentAngle: SocialContentAngle, platform: SocialPlatformTarget) {
    const client = adminSafe();
    if (!client) return null;

    const { data, error } = await client
      .from('social_post_queue')
      .select('*')
      .eq('route_path', routePath)
      .eq('content_angle', contentAngle)
      .eq('target_platform', platform)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error || !data?.length) return null;

    const rows = data.map(mapQueueRow);
    const nonPublished = rows.filter((row) => row.status !== 'published');
    return nonPublished[0] ?? rows[0] ?? null;
  },

  async listQueue(input?: { status?: SocialPostStatus; limit?: number; excludeStatuses?: SocialPostStatus[] }) {
    const client = adminSafe();
    if (!client) return [];

    let query = client.from('social_post_queue').select('*').order('updated_at', { ascending: false });
    if (input?.status) query = query.eq('status', input.status);
    if (input?.excludeStatuses?.length) query = query.not('status', 'in', `(${input.excludeStatuses.join(',')})`);
    if (input?.limit) query = query.limit(input.limit);

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapQueueRow);
  },

  async countByStatus() {
    const client = adminSafe();
    if (!client) return null;

    const statuses: SocialPostStatus[] = ['draft', 'approved', 'scheduled', 'published', 'failed'];
    const counts = await Promise.all(
      statuses.map(async (status) => {
        const { count, error } = await client
          .from('social_post_queue')
          .select('id', { count: 'exact', head: true })
          .eq('status', status);
        return [status, error ? 0 : count ?? 0] as const;
      }),
    );

    return Object.fromEntries(counts) as Record<SocialPostStatus, number>;
  },

  async getById(id: string) {
    const client = adminSafe();
    if (!client) return null;

    const { data, error } = await client.from('social_post_queue').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return mapQueueRow(data);
  },

  async createDraft(input: {
    source: SocialSourceExtract;
    contentKey: string;
    contentAngle: SocialContentAngle;
    targetPlatform: SocialPlatformTarget;
    title: string;
    shortSummary: string;
    hook: string;
    caption: string;
    hashtags: string[];
    imageUrl: string | null;
    canonicalLink: string;
    recommendedScheduleAt: string;
    metadata: Record<string, unknown>;
  }) {
    const client = adminSafe();
    if (!client) return null;

    const now = new Date().toISOString();
    const { data, error } = await client
      .from('social_post_queue')
      .insert({
        route_path: input.source.routePath,
        page_type: input.source.pageType,
        source_kind: input.source.sourceKind,
        content_angle: input.contentAngle,
        target_platform: input.targetPlatform,
        content_key: input.contentKey,
        title: input.title,
        short_summary: input.shortSummary,
        hook: input.hook,
        caption: input.caption,
        hashtags: input.hashtags,
        image_url: input.imageUrl,
        canonical_link: input.canonicalLink,
        publish_date: input.source.publishDate ?? null,
        source_updated_at: input.source.sourceUpdatedAt,
        recommended_schedule_at: input.recommendedScheduleAt,
        status: 'draft',
        metadata: input.metadata,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single();

    if (error || !data) return null;
    return mapQueueRow(data);
  },

  async updateForReview(
    id: string,
    patch: { status?: SocialPostStatus; recommendedScheduleAt?: string; approvalNotes?: string | null },
  ) {
    const client = adminSafe();
    if (!client) return null;

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (patch.status) payload.status = patch.status;
    if (patch.recommendedScheduleAt) payload.recommended_schedule_at = patch.recommendedScheduleAt;
    if (patch.approvalNotes !== undefined) payload.approval_notes = patch.approvalNotes;

    const { data, error } = await client
      .from('social_post_queue')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return mapQueueRow(data);
  },

  async updateContent(
    id: string,
    patch: {
      hook?: string;
      caption?: string;
      hashtags?: string[];
      recommendedScheduleAt?: string;
      approvalNotes?: string | null;
    },
  ) {
    const client = adminSafe();
    if (!client) return null;

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (patch.hook !== undefined) payload.hook = patch.hook;
    if (patch.caption !== undefined) payload.caption = patch.caption;
    if (patch.hashtags !== undefined) payload.hashtags = patch.hashtags;
    if (patch.recommendedScheduleAt !== undefined) payload.recommended_schedule_at = patch.recommendedScheduleAt;
    if (patch.approvalNotes !== undefined) payload.approval_notes = patch.approvalNotes;

    const { data, error } = await client
      .from('social_post_queue')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return mapQueueRow(data);
  },

  async listApproved(limit = 10) {
    const client = adminSafe();
    if (!client) return [];

    const { data, error } = await client
      .from('social_post_queue')
      .select('*')
      .eq('status', 'approved')
      .order('recommended_schedule_at', { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data.map(mapQueueRow);
  },

  async listScheduled(limit = 25) {
    const client = adminSafe();
    if (!client) return [];

    const { data, error } = await client
      .from('social_post_queue')
      .select('*')
      .eq('status', 'scheduled')
      .not('external_post_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(mapQueueRow);
  },

  async markScheduled(id: string, input: { externalPostId: string; provider: 'buffer'; scheduledAt: string; metadata?: Record<string, unknown> }) {
    const client = adminSafe();
    if (!client) return null;

    const now = new Date().toISOString();
    const { data, error } = await client
      .from('social_post_queue')
      .update({
        status: 'scheduled',
        external_provider: input.provider,
        external_post_id: input.externalPostId,
        scheduled_at: input.scheduledAt,
        last_attempt_at: now,
        error_message: null,
        metadata: input.metadata ?? {},
        updated_at: now,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return mapQueueRow(data);
  },

  async markPublished(id: string, publishedAt: string) {
    const client = adminSafe();
    if (!client) return null;

    const { data, error } = await client
      .from('social_post_queue')
      .update({
        status: 'published',
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return mapQueueRow(data);
  },

  async markFailed(id: string, message: string) {
    const client = adminSafe();
    if (!client) return null;

    const { data, error } = await client
      .from('social_post_queue')
      .update({
        status: 'failed',
        error_message: message,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return mapQueueRow(data);
  },

  async deleteMany(ids: string[]) {
    const client = adminSafe();
    if (!client || ids.length === 0) return 0;

    const { error, count } = await client
      .from('social_post_queue')
      .delete({ count: 'exact' })
      .in('id', ids);

    if (error) return 0;
    return count ?? ids.length;
  },
};
