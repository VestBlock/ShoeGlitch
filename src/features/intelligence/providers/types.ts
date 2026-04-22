export type SneakerProviderKey = 'kicksdb' | 'nike-public' | 'mock' | 'sneaks';

export interface NormalizedSneakerSize {
  label: string;
  market?: string | null;
  lowestAsk?: number | null;
  lastSale?: number | null;
  currency?: string | null;
}

export interface NormalizedPriceSummary {
  retailPrice: number | null;
  lowestAsk: number | null;
  lastSale: number | null;
  averagePrice: number | null;
  currency: string;
  isPlaceholder: boolean;
}

export interface NormalizedSneaker {
  id: string;
  externalId: string;
  provider: SneakerProviderKey;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  colorway: string;
  category: string;
  releaseDate: string | null;
  retailPrice: number | null;
  imageUrl: string;
  marketUrl: string | null;
  sizes: NormalizedSneakerSize[];
  priceSummary: NormalizedPriceSummary;
  availability: 'upcoming' | 'released' | 'watch-worthy' | 'unknown';
  updatedAt: string;
  description: string;
  rawSummary?: {
    rank?: number | null;
    weeklyOrders?: number | null;
    upcoming?: boolean | null;
  };
}

export interface ProviderHealth {
  key: string;
  label: string;
  status: 'healthy' | 'degraded' | 'fallback';
  message: string;
  lastAttemptAt: string;
  lastSuccessAt?: string;
}

export interface ProviderSearchInput {
  query?: string;
  sku?: string;
  limit?: number;
}

export interface ProviderSearchResult {
  items: NormalizedSneaker[];
  raw: unknown;
  cached: boolean;
  health: ProviderHealth;
}

export interface ProviderProductResult {
  item: NormalizedSneaker | null;
  raw: unknown;
  cached: boolean;
  health: ProviderHealth;
}

export interface SneakerProvider {
  key: SneakerProviderKey;
  label: string;
  search(input: ProviderSearchInput, now: Date): Promise<ProviderSearchResult>;
  getProduct(idOrSlug: string, now: Date): Promise<ProviderProductResult>;
}
