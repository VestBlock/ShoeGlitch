import type { IntelligenceApiContract } from '@/features/intelligence/api/contracts';
import {
  mapFeedResponse,
  mapProductResponse,
  mapSearchResponse,
  mapSourceHealthRecord,
} from '@/features/intelligence/api/mapper';
import type {
  IntelligenceFeedQuery,
  IntelligenceFeedResponse,
  IntelligenceProductResponse,
  IntelligenceSearchQuery,
  IntelligenceSearchResponse,
  IntelligenceSourceHealthRecord,
} from '@/features/intelligence/api/types';
import { getSneakerProduct, searchSneakers } from '@/features/intelligence/provider-service';
import { getSneakerBySlug, getSneakerFeed } from '@/features/intelligence/service';
import type { SneakerFeedItem } from '@/features/intelligence/types';

function clampLimit(value: number | undefined, fallback: number) {
  if (!value) return fallback;
  return Math.max(1, Math.min(60, value));
}

function filterFeedItems(items: SneakerFeedItem[], query: IntelligenceFeedQuery) {
  const search = query.search?.trim().toLowerCase();
  const provider = query.provider ?? 'all';
  const brand = query.brand?.trim();
  const opportunity = query.opportunity ?? 'all';
  const limit = clampLimit(query.limit, 24);

  return items
    .filter((item) => {
      const matchesSearch =
        !search ||
        `${item.name} ${item.brand} ${item.silhouette} ${item.colorway} ${item.sku}`.toLowerCase().includes(search);
      const matchesProvider = provider === 'all' || item.provider === provider;
      const matchesBrand = !brand || item.brand.toLowerCase() === brand.toLowerCase();
      const matchesOpportunity = opportunity === 'all' || item.opportunityFlags.includes(opportunity);
      return matchesSearch && matchesProvider && matchesBrand && matchesOpportunity;
    })
    .slice(0, limit);
}

export async function getIntelligenceFeed(query: IntelligenceFeedQuery = {}): Promise<IntelligenceFeedResponse> {
  const feed = await getSneakerFeed({ includeNikePublic: query.includeNikePublic ?? true });
  const items = filterFeedItems(feed.items, query);
  return mapFeedResponse(feed, items);
}

export async function searchIntelligenceCatalog(
  query: IntelligenceSearchQuery,
): Promise<IntelligenceSearchResponse> {
  const generatedAt = new Date().toISOString();
  const result = await searchSneakers({
    query: query.query,
    limit: clampLimit(query.limit, 18),
  });
  const mapped = await Promise.all(
    result.items.map(async (item) => {
      const feedItem =
        (await getSneakerBySlug(item.slug, { includeNikePublic: query.includeNikePublic ?? true })) ??
        (await getSneakerBySlug(item.externalId, { includeNikePublic: query.includeNikePublic ?? true }));
      return feedItem ?? null;
    }),
  );

  return mapSearchResponse(
    generatedAt,
    mapped.filter((item): item is SneakerFeedItem => Boolean(item)),
  );
}

export async function getIntelligenceProduct(
  slugOrId: string,
  options?: { includeNikePublic?: boolean },
): Promise<IntelligenceProductResponse> {
  const generatedAt = new Date().toISOString();
  const direct = await getSneakerBySlug(slugOrId, { includeNikePublic: options?.includeNikePublic ?? true });
  if (direct) {
    return mapProductResponse(generatedAt, direct);
  }

  const product = await getSneakerProduct(slugOrId, { includeNikePublic: options?.includeNikePublic ?? true });
  if (!product.item) {
    return mapProductResponse(generatedAt, null);
  }

  const feedItem = await getSneakerBySlug(product.item.slug, { includeNikePublic: options?.includeNikePublic ?? true });
  return mapProductResponse(generatedAt, feedItem ?? null);
}

export async function getIntelligenceSourceHealth(
  options?: { includeNikePublic?: boolean },
): Promise<IntelligenceSourceHealthRecord[]> {
  const feed = await getSneakerFeed({ includeNikePublic: options?.includeNikePublic ?? true });
  return feed.sourceHealth.map(mapSourceHealthRecord);
}

export const intelligenceApiEngine: IntelligenceApiContract = {
  getFeed: getIntelligenceFeed,
  getProduct: getIntelligenceProduct,
  search: searchIntelligenceCatalog,
  getSourceHealth: getIntelligenceSourceHealth,
};

