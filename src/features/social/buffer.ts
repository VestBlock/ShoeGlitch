import type { BufferChannelSummary, SocialQueueRecord } from '@/features/social/types';

const BUFFER_ENDPOINT = 'https://api.buffer.com';

interface BufferPostSummary {
  id: string;
  status?: string | null;
  dueAt?: string | null;
  channelId?: string | null;
}

interface BufferAvailability {
  configured: boolean;
  reason?: string;
}

export interface BufferOrganizationSummary {
  id: string;
  name: string;
}

function cleanEnvValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function isBufferObjectId(value?: string | null) {
  return Boolean(value && /^[a-f0-9]{24}$/i.test(value));
}

function getConfig() {
  const accessToken = cleanEnvValue(process.env.BUFFER_ACCESS_TOKEN ?? process.env.BUFFER_API_TOKEN);
  const organizationId = cleanEnvValue(process.env.BUFFER_ORGANIZATION_ID);
  const instagramChannelId = cleanEnvValue(process.env.BUFFER_INSTAGRAM_CHANNEL_ID);

  if (!accessToken) {
    return null;
  }

  return { accessToken, organizationId, instagramChannelId };
}

async function bufferRequest<T>(query: string): Promise<T> {
  const config = getConfig();
  if (!config) {
    throw new Error('Buffer is not configured. Add BUFFER_ACCESS_TOKEN and BUFFER_ORGANIZATION_ID.');
  }

  const response = await fetch(BUFFER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.accessToken}`,
    },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.errors?.[0]?.message ?? `Buffer request failed with status ${response.status}.`);
  }
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? 'Buffer GraphQL request failed.');
  }

  return json.data as T;
}

function gqlString(value: string) {
  return JSON.stringify(value);
}

function buildAssetsBlock(imageUrl?: string | null) {
  if (!imageUrl) return '';
  return `
      assets: {
        images: [{ url: ${gqlString(imageUrl)} }]
      }`;
}

function buildInstagramMetadataBlock() {
  return `
      metadata: {
        instagram: {
          type: post
          shouldShareToFeed: true
        }
      }`;
}

export function getBufferAvailability(): BufferAvailability {
  return getConfig()
    ? { configured: true }
    : { configured: false, reason: 'Add BUFFER_ACCESS_TOKEN or BUFFER_API_TOKEN to enable scheduling.' };
}

export async function getBufferOrganizations(): Promise<BufferOrganizationSummary[]> {
  const config = getConfig();
  if (!config) return [];

  const query = `
    query GetOrganizations {
      account {
        organizations {
          id
          name
        }
      }
    }
  `;

  const data = await bufferRequest<{ account?: { organizations?: BufferOrganizationSummary[] } }>(query);
  return data.account?.organizations ?? [];
}

async function resolveOrganizationId() {
  const config = getConfig();
  if (!config) return null;
  if (isBufferObjectId(config.organizationId)) return config.organizationId;

  const organizations = await getBufferOrganizations();
  return organizations[0]?.id ?? null;
}

export async function getBufferInstagramChannels(): Promise<BufferChannelSummary[]> {
  const organizationId = await resolveOrganizationId();
  if (!organizationId) return [];

  const query = `
    query GetChannels {
      channels(input: {
        organizationId: ${gqlString(organizationId)}
      }) {
        id
        name
        displayName
        service
        avatar
        isQueuePaused
      }
    }
  `;

  const data = await bufferRequest<{ channels: BufferChannelSummary[] }>(query);
  return (data.channels ?? []).filter((channel) => channel.service?.toLowerCase() === 'instagram');
}

async function resolveInstagramChannelId() {
  const config = getConfig();
  if (!config) return null;
  if (isBufferObjectId(config.instagramChannelId)) return config.instagramChannelId;

  const channels = await getBufferInstagramChannels();
  return channels[0]?.id ?? null;
}

export async function scheduleBufferInstagramPost(record: SocialQueueRecord): Promise<{
  externalPostId: string;
  scheduledAt: string;
  metadata: Record<string, unknown>;
}> {
  if (!record.imageUrl) {
    throw new Error('Instagram posts require at least one image.');
  }

  const channelId = await resolveInstagramChannelId();
  if (!channelId) {
    throw new Error('No Instagram channel is available in Buffer. Add BUFFER_INSTAGRAM_CHANNEL_ID or connect an Instagram channel.');
  }

  const query = `
    mutation CreatePost {
      createPost(input: {
        text: ${gqlString(record.caption)}
        channelId: ${gqlString(channelId)}
        schedulingType: automatic
        mode: customScheduled
        dueAt: ${gqlString(record.recommendedScheduleAt)}${buildAssetsBlock(record.imageUrl)}${buildInstagramMetadataBlock()}
      }) {
        ... on PostActionSuccess {
          post {
            id
            text
            dueAt
            status
            channelId
          }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;

  const data = await bufferRequest<{
    createPost:
      | { post?: BufferPostSummary | null; message?: never }
      | { post?: never; message?: string };
  }>(query);

  const result = data.createPost;
  if ('message' in result && result.message) {
    throw new Error(result.message);
  }

  if (!result.post?.id) {
    throw new Error('Buffer did not return a scheduled post id.');
  }

  return {
    externalPostId: result.post.id,
    scheduledAt: result.post.dueAt ?? record.recommendedScheduleAt,
    metadata: {
      bufferStatus: result.post.status ?? 'scheduled',
      bufferChannelId: result.post.channelId ?? channelId,
    },
  };
}

export async function syncBufferPostStatuses(externalIds: string[]) {
  const config = getConfig();
  if (!config || externalIds.length === 0) return [];

  const organizationId = await resolveOrganizationId();
  const channelId = await resolveInstagramChannelId();
  if (!channelId || !organizationId) return [];

  const query = `
    query GetPostsForChannels {
      posts(
        first: 50,
        input: {
          organizationId: ${gqlString(organizationId)},
          filter: {
            status: [scheduled, sent, error],
            channelIds: [${gqlString(channelId)}]
          }
        }
      ) {
        edges {
          node {
            id
            status
            dueAt
            channelId
          }
        }
      }
    }
  `;

  const data = await bufferRequest<{
    posts?: { edges?: Array<{ node: BufferPostSummary }> };
  }>(query);

  const nodes = (data.posts?.edges ?? [])
    .map((edge) => edge.node)
    .filter((node) => externalIds.includes(node.id));

  return nodes;
}
