import { MOCK_OPPORTUNITIES } from '@/features/intelligence/fixtures';
import type {
  NormalizedSneaker,
  ProviderHealth,
  ProviderProductResult,
  ProviderSearchInput,
  ProviderSearchResult,
  SneakerProvider,
} from '@/features/intelligence/providers/types';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNormalized(now: Date): NormalizedSneaker[] {
  return MOCK_OPPORTUNITIES.map((entry) => ({
    id: entry.seedId,
    externalId: entry.seedId,
    provider: 'mock',
    sku: entry.sku,
    slug: slugify(entry.name),
    name: entry.name,
    brand: entry.brand,
    model: entry.silhouette,
    colorway: entry.colorway,
    category: 'sneakers',
    releaseDate: entry.releaseDate,
    retailPrice: entry.retailUsd,
    imageUrl: entry.imageUrl,
    marketUrl: null,
    sizes: [],
    priceSummary: {
      retailPrice: entry.retailUsd,
      lowestAsk: entry.marketPlaceholder ?? null,
      lastSale: null,
      averagePrice: null,
      currency: 'USD',
      isPlaceholder: true,
    },
    availability: new Date(entry.releaseDate).getTime() > now.getTime() ? 'upcoming' : 'watch-worthy',
    updatedAt: now.toISOString(),
    description: entry.description,
  }));
}

function health(now: Date, message: string): ProviderHealth {
  return {
    key: 'mock',
    label: 'Mock fallback provider',
    status: 'fallback',
    message,
    lastAttemptAt: now.toISOString(),
    lastSuccessAt: now.toISOString(),
  };
}

export const mockSneakerProvider: SneakerProvider = {
  key: 'mock',
  label: 'Mock fallback provider',

  async search(input: ProviderSearchInput, now: Date): Promise<ProviderSearchResult> {
    const items = toNormalized(now).filter((item) => {
      const q = (input.sku ?? input.query ?? '').toLowerCase();
      if (!q) return true;
      return `${item.name} ${item.brand} ${item.sku}`.toLowerCase().includes(q);
    });

    return {
      items: items.slice(0, input.limit ?? 8),
      raw: { source: 'mock', total: items.length },
      cached: false,
      health: health(now, 'Fallback records are active because live provider data is unavailable or incomplete.'),
    };
  },

  async getProduct(idOrSlug: string, now: Date): Promise<ProviderProductResult> {
    const item =
      toNormalized(now).find((entry) => entry.slug === idOrSlug || entry.externalId === idOrSlug) ?? null;

    return {
      item,
      raw: item ? { source: 'mock', id: item.id } : { source: 'mock', missing: idOrSlug },
      cached: false,
      health: health(now, item ? 'Fallback product detail loaded.' : 'Fallback provider did not match that product.'),
    };
  },
};
