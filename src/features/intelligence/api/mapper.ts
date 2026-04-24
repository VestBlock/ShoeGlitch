import type { ProviderHealth } from '@/features/intelligence/providers/types';
import type { RetailMonitorSnapshot } from '@/features/intelligence/monitors/types';
import type { SneakerFeedItem, SneakerFeedResult } from '@/features/intelligence/types';
import type {
  IntelligenceFeedRecord,
  IntelligenceFeedResponse,
  IntelligenceProductResponse,
  IntelligenceRetailMonitorSnapshot,
  IntelligenceSearchResponse,
  IntelligenceSourceHealthRecord,
} from '@/features/intelligence/api/types';

export function mapFeedItemToRecord(item: SneakerFeedItem): IntelligenceFeedRecord {
  return {
    id: item.id,
    slug: item.slug,
    externalId: item.externalId,
    provider: item.provider,
    sourceType: item.sourceType,
    sourceName: item.sourceName,
    name: item.name,
    brand: item.brand,
    silhouette: item.silhouette,
    colorway: item.colorway,
    sku: item.sku,
    imageUrl: item.media.thumbnailUrl,
    imageAlt: item.media.alt,
    availability: item.availability,
    releaseDate: item.release.date,
    retailPrice: item.release.retailPrice,
    marketUrl: item.marketUrl,
    materials: item.materials,
    opportunityFlags: item.opportunityFlags,
    rankingNote: item.rankingNote,
    scores: {
      cleaning: item.scores.cleaning,
      restoration: item.scores.restoration,
      marketStrength: item.scores.marketStrength,
      rarity: item.scores.rarity,
      serviceFit: item.scores.serviceFit,
      releasePressure: item.scores.releasePressure,
    },
    primaryAction: item.primaryCta,
    secondaryAction: item.secondaryCta,
    lastUpdatedAt: item.lastUpdatedAt,
  };
}

export function mapSourceHealthRecord(item: ProviderHealth): IntelligenceSourceHealthRecord {
  return {
    key: item.key,
    label: item.label,
    status: item.status,
    message: item.message,
    lastAttemptAt: item.lastAttemptAt,
    lastSuccessAt: item.lastSuccessAt,
  };
}

export function mapFeedResponse(feed: SneakerFeedResult, items: SneakerFeedItem[]): IntelligenceFeedResponse {
  return {
    generatedAt: feed.generatedAt,
    usedFallbackData: feed.usedFallbackData,
    total: items.length,
    items: items.map(mapFeedItemToRecord),
    sourceHealth: feed.sourceHealth.map(mapSourceHealthRecord),
  };
}

export function mapSearchResponse(generatedAt: string, items: SneakerFeedItem[]): IntelligenceSearchResponse {
  return {
    generatedAt,
    total: items.length,
    items: items.map(mapFeedItemToRecord),
  };
}

export function mapProductResponse(generatedAt: string, item: SneakerFeedItem | null): IntelligenceProductResponse {
  return {
    generatedAt,
    product: item ? mapFeedItemToRecord(item) : null,
  };
}

export function mapRetailMonitorSnapshot(snapshot: RetailMonitorSnapshot): IntelligenceRetailMonitorSnapshot {
  return {
    generatedAt: snapshot.generatedAt,
    entries: snapshot.entries.map((entry) => ({ ...entry })),
    health: snapshot.health.map((entry) => ({
      key: entry.key,
      label: entry.label,
      status: entry.status,
      message: entry.message,
      lastAttemptAt: entry.checkedAt,
      lastSuccessAt: entry.lastSuccessAt,
    })),
  };
}
