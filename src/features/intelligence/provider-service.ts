import { FEED_QUERIES } from '@/features/intelligence/catalog';
import { kicksDbProvider } from '@/features/intelligence/providers/kicksdb';
import { mockSneakerProvider } from '@/features/intelligence/providers/mock';
import { nikePublicProvider } from '@/features/intelligence/providers/nike-public';
import { sneaksApiProvider } from '@/features/intelligence/providers/sneaks';
import type {
  NormalizedSneaker,
  ProviderHealth,
  ProviderProductResult,
  ProviderSearchInput,
  ProviderSearchResult,
} from '@/features/intelligence/providers/types';

async function safeSearch(input: ProviderSearchInput, now: Date): Promise<ProviderSearchResult> {
  try {
    const result = await kicksDbProvider.search(input, now);
    if (result.items.length > 0) return result;
  } catch {
    // Fall through to public provider.
  }

  try {
    const result = await nikePublicProvider.search(input, now);
    if (result.items.length > 0) return result;
  } catch {
    // Fall through to mock provider.
  }

  return mockSneakerProvider.search(input, now);
}

export async function searchSneakers(input: ProviderSearchInput) {
  return safeSearch(input, new Date());
}

export async function compareSneaksSearch(input: ProviderSearchInput) {
  return sneaksApiProvider.search(input, new Date());
}

export async function searchNikePublicSneakers(input: ProviderSearchInput) {
  return nikePublicProvider.search(input, new Date());
}

export async function getSneakerProduct(idOrSlug: string): Promise<ProviderProductResult> {
  const now = new Date();

  try {
    const result = await kicksDbProvider.getProduct(idOrSlug, now);
    if (result.item) return result;
  } catch {
    // Fall through to public provider.
  }

  try {
    const result = await nikePublicProvider.getProduct(idOrSlug, now);
    if (result.item) return result;
  } catch {
    // Fall through to mock provider.
  }

  return mockSneakerProvider.getProduct(idOrSlug, now);
}

export async function compareSneaksProduct(idOrSlug: string) {
  return sneaksApiProvider.getProduct(idOrSlug, new Date());
}

export async function getNikePublicProduct(idOrSlug: string) {
  return nikePublicProvider.getProduct(idOrSlug, new Date());
}

export async function buildFeaturedSneakerSet() {
  const now = new Date();
  const sourceHealth: ProviderHealth[] = [];
  const merged = new Map<string, NormalizedSneaker>();

  try {
    const results = await Promise.all(FEED_QUERIES.map((entry) => kicksDbProvider.search({ query: entry.query, limit: 5 }, now)));

    for (const result of results) {
      sourceHealth.push(result.health);
      for (const item of result.items) {
        const key = `${item.provider}:${item.externalId}:${item.sku}`;
        if (!merged.has(key)) merged.set(key, item);
      }
    }
  } catch {
    // Fall through to public provider.
  }

  if (merged.size === 0) {
    try {
      const publicResult = await nikePublicProvider.search({ limit: 18 }, now);
      sourceHealth.push(publicResult.health);
      for (const item of publicResult.items) {
        const key = `${item.provider}:${item.externalId}:${item.sku}`;
        if (!merged.has(key)) merged.set(key, item);
      }
    } catch {
      // Fall through to mock provider.
    }
  }

  if (merged.size === 0) {
    const fallbackResult = await mockSneakerProvider.search({ limit: 12 }, now);
    sourceHealth.push(fallbackResult.health);
    for (const item of fallbackResult.items) {
      const key = `${item.provider}:${item.externalId}:${item.sku}`;
      if (!merged.has(key)) merged.set(key, item);
    }
  }

  return {
    items: [...merged.values()],
    sourceHealth,
    generatedAt: now.toISOString(),
    usedFallbackData: [...merged.values()].some((item) => item.provider === 'mock' || item.provider === 'nike-public'),
  };
}
