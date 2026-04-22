import type { SneakerProviderKey, NormalizedSneakerSize, NormalizedPriceSummary } from '@/features/intelligence/providers/types';

export type SneakerOpportunityKind =
  | 'cleaning'
  | 'restoration'
  | 'flip'
  | 'watch'
  | 'upcoming';

export type SneakerSourceType = 'snapshot' | 'fallback';

export interface SneakerMedia {
  thumbnailUrl: string;
  alt: string;
  dominantTone: string;
}

export interface RetailerLink {
  label: string;
  href: string;
  retailer: string;
}

export interface ReleaseEvent {
  date: string;
  timezone: string;
  status: 'upcoming' | 'live' | 'released';
  retailPrice: number;
  currency: 'USD';
  retailers: RetailerLink[];
}

export interface MarketplacePriceSnapshot {
  source: string;
  capturedAt: string;
  lowAsk?: number | null;
  lastSale?: number | null;
  estimatedResale?: number | null;
  confidence: number;
  isPlaceholder: boolean;
}

export interface ScoreRecord {
  cleaning: number;
  restoration: number;
  flipPotential: number;
  urgency: number;
  confidence: number;
}

export interface ServiceHook {
  label: string;
  href: string;
  kind: 'book-cleaning' | 'book-restoration' | 'watch-market' | 'join-waitlist';
}

export interface SneakerFeedItem {
  id: string;
  externalId: string;
  provider: SneakerProviderKey;
  slug: string;
  name: string;
  brand: string;
  silhouette: string;
  colorway: string;
  sku: string;
  category: string;
  description: string;
  availability: 'upcoming' | 'released' | 'watch-worthy' | 'unknown';
  marketUrl?: string | null;
  sizes: NormalizedSneakerSize[];
  priceSummary: NormalizedPriceSummary;
  release: ReleaseEvent;
  market: MarketplacePriceSnapshot;
  media: SneakerMedia;
  sourceType: SneakerSourceType;
  sourceName: string;
  sourceUrl?: string;
  materials: string[];
  opportunityFlags: SneakerOpportunityKind[];
  scores: ScoreRecord;
  primaryCta: ServiceHook;
  secondaryCta: ServiceHook;
  rankingNote: string;
  lastUpdatedAt: string;
}

export interface SourceHealth {
  key: string;
  label: string;
  status: 'healthy' | 'degraded' | 'fallback';
  lastAttemptAt: string;
  lastSuccessAt?: string;
  message: string;
}

export interface SneakerFeedResult {
  items: SneakerFeedItem[];
  sourceHealth: SourceHealth[];
  generatedAt: string;
  usedFallbackData: boolean;
}

export interface SneakerFilterState {
  search: string;
  brand: string;
  opportunity: 'all' | SneakerOpportunityKind;
  sort: 'release' | 'cleaning' | 'restoration' | 'flip' | 'urgency';
}
