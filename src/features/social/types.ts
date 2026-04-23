export type SocialPageType =
  | 'intelligence'
  | 'release'
  | 'how-to-clean'
  | 'worth-restoring'
  | 'release-alerts'
  | 'service-hub'
  | 'service-city'
  | 'service-area'
  | 'service-near-me'
  | 'city-hub'
  | 'locations-index';

export type SocialContentAngle =
  | 'release-radar'
  | 'care-guide'
  | 'restoration-read'
  | 'release-alert'
  | 'local-service';

export type SocialPlatformTarget = 'instagram';
export type SocialPostStatus = 'draft' | 'approved' | 'scheduled' | 'published' | 'failed';

export interface SocialSourceExtract {
  routePath: string;
  canonicalUrl: string;
  pageType: SocialPageType;
  sourceKind: 'release-engine' | 'seo-engine' | 'intelligence-feed';
  title: string;
  shortSummary: string;
  imageUrl: string | null;
  publishDate?: string | null;
  sourceUpdatedAt: string;
  metadata: Record<string, unknown>;
}

export interface SocialPayloadDraft {
  contentAngle: SocialContentAngle;
  hook: string;
  caption: string;
  hashtags: string[];
  imageUrl: string | null;
  canonicalLink: string;
  recommendedScheduleAt: string;
  socialPlatformTarget: SocialPlatformTarget;
  postStatus: 'draft';
  metadata: Record<string, unknown>;
}

export interface SocialQueueRecord {
  id: string;
  routePath: string;
  pageType: SocialPageType;
  sourceKind: SocialSourceExtract['sourceKind'];
  contentAngle: SocialContentAngle;
  targetPlatform: SocialPlatformTarget;
  contentKey: string;
  title: string;
  shortSummary: string;
  hook: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string | null;
  canonicalLink: string;
  publishDate?: string | null;
  sourceUpdatedAt: string;
  recommendedScheduleAt: string;
  status: SocialPostStatus;
  approvalNotes?: string | null;
  externalProvider?: 'buffer' | null;
  externalPostId?: string | null;
  errorMessage?: string | null;
  metadata: Record<string, unknown>;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  lastAttemptAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialQueueSummary {
  created: number;
  skippedDuplicates: number;
  failed: number;
  drafts: SocialQueueRecord[];
  messages?: string[];
}

export interface SocialPublishSummary {
  scheduled: number;
  published: number;
  failed: number;
  skipped: number;
  messages: string[];
}

export interface BufferChannelSummary {
  id: string;
  name: string;
  displayName?: string | null;
  service: string;
  avatar?: string | null;
  isQueuePaused?: boolean | null;
}
