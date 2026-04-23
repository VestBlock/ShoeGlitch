import {
  getBufferAvailability,
  getBufferInstagramChannels,
  getBufferOrganizations,
} from '@/features/social/buffer';
import { socialStore } from '@/features/social/store';

export interface AdminSocialSummary {
  queueStatus: 'live' | 'empty' | 'unavailable';
  queueMessage?: string;
  buffer: {
    configured: boolean;
    reason?: string;
    organizationCount: number;
    channelCount: number;
    organizations: Array<{ id: string; name: string }>;
    channels: Array<{ id: string; name: string; displayName?: string | null; paused?: boolean | null }>;
    error?: string;
  };
  totals: {
    drafts: number;
    approved: number;
    scheduled: number;
    published: number;
    failed: number;
  };
  recentQueue: Awaited<ReturnType<typeof socialStore.listQueue>>;
}

export async function buildAdminSocialSummary(): Promise<AdminSocialSummary> {
  const availability = getBufferAvailability();

  let organizations: Array<{ id: string; name: string }> = [];
  let channels: Array<{ id: string; name: string; displayName?: string | null; paused?: boolean | null }> = [];
  let bufferError: string | undefined;

  if (availability.configured) {
    try {
      const [orgs, rawChannels] = await Promise.all([getBufferOrganizations(), getBufferInstagramChannels()]);
      organizations = orgs;
      channels = rawChannels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        displayName: channel.displayName,
        paused: channel.isQueuePaused,
      }));
    } catch (error) {
      bufferError = error instanceof Error ? error.message : 'Unable to query Buffer.';
    }
  }

  try {
    const [items, statusCounts] = await Promise.all([
      socialStore.listQueue({ limit: 50 }),
      socialStore.countByStatus(),
    ]);
    const totals = {
      drafts: statusCounts?.draft ?? 0,
      approved: statusCounts?.approved ?? 0,
      scheduled: statusCounts?.scheduled ?? 0,
      published: statusCounts?.published ?? 0,
      failed: statusCounts?.failed ?? 0,
    };

    return {
      queueStatus: items.length > 0 ? 'live' : 'empty',
      queueMessage:
        items.length > 0
          ? undefined
          : 'The social queue is ready, but no drafts have been stored yet. Apply the social migration, then run the scan job.',
      buffer: {
        configured: availability.configured,
        reason: availability.reason,
        organizationCount: organizations.length,
        channelCount: channels.length,
        organizations,
        channels,
        error: bufferError,
      },
      totals,
      recentQueue: items.slice(0, 12),
    };
  } catch (error) {
    return {
      queueStatus: 'unavailable',
      queueMessage: error instanceof Error ? error.message : 'Unable to load social queue.',
      buffer: {
        configured: availability.configured,
        reason: availability.reason,
        organizationCount: organizations.length,
        channelCount: channels.length,
        organizations,
        channels,
        error: bufferError,
      },
      totals: { drafts: 0, approved: 0, scheduled: 0, published: 0, failed: 0 },
      recentQueue: [],
    };
  }
}
