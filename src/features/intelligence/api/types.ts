import type { SneakerOpportunityKind, SneakerSourceType } from '@/features/intelligence/types';
import type { SneakerProviderKey } from '@/features/intelligence/providers/types';

export interface IntelligenceFeedQuery {
  search?: string;
  brand?: string;
  provider?: SneakerProviderKey | 'all';
  opportunity?: SneakerOpportunityKind | 'all';
  limit?: number;
  includeNikePublic?: boolean;
}

export interface IntelligenceFeedRecord {
  id: string;
  slug: string;
  externalId: string;
  provider: SneakerProviderKey;
  sourceType: SneakerSourceType;
  sourceName: string;
  name: string;
  brand: string;
  silhouette: string;
  colorway: string;
  sku: string;
  imageUrl: string;
  imageAlt: string;
  availability: string;
  releaseDate: string;
  retailPrice: number;
  marketUrl?: string | null;
  materials: string[];
  opportunityFlags: SneakerOpportunityKind[];
  rankingNote: string;
  scores: {
    cleaning: number;
    restoration: number;
    marketStrength: number;
    rarity: number;
    serviceFit: number;
    releasePressure: number;
  };
  primaryAction: {
    label: string;
    href: string;
    kind: string;
  };
  secondaryAction: {
    label: string;
    href: string;
    kind: string;
  };
  lastUpdatedAt: string;
}

export interface IntelligenceSourceHealthRecord {
  key: string;
  label: string;
  status: 'healthy' | 'degraded' | 'fallback';
  message: string;
  lastAttemptAt: string;
  lastSuccessAt?: string;
}

export interface IntelligenceFeedResponse {
  generatedAt: string;
  usedFallbackData: boolean;
  total: number;
  items: IntelligenceFeedRecord[];
  sourceHealth: IntelligenceSourceHealthRecord[];
}

export interface IntelligenceSearchQuery {
  query: string;
  limit?: number;
  includeNikePublic?: boolean;
}

export interface IntelligenceSearchResponse {
  generatedAt: string;
  total: number;
  items: IntelligenceFeedRecord[];
}

export interface IntelligenceProductResponse {
  generatedAt: string;
  product: IntelligenceFeedRecord | null;
}

export interface IntelligenceRetailMonitorRecord {
  id: string;
  source: string;
  sourceLabel: string;
  brand: string;
  model: string;
  name: string;
  colorway?: string | null;
  sku?: string | null;
  url: string;
  imageUrl?: string | null;
  releaseDate?: string | null;
  detectedAt: string;
  metadata: Record<string, unknown>;
}

export interface IntelligenceRetailMonitorSnapshot {
  generatedAt: string;
  entries: IntelligenceRetailMonitorRecord[];
  health: IntelligenceSourceHealthRecord[];
}
