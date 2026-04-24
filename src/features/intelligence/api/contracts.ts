import type {
  IntelligenceFeedQuery,
  IntelligenceFeedResponse,
  IntelligenceProductResponse,
  IntelligenceSearchQuery,
  IntelligenceSearchResponse,
  IntelligenceSourceHealthRecord,
} from '@/features/intelligence/api/types';

export interface IntelligenceApiContract {
  getFeed(query?: IntelligenceFeedQuery): Promise<IntelligenceFeedResponse>;
  getProduct(slugOrId: string, options?: { includeNikePublic?: boolean }): Promise<IntelligenceProductResponse>;
  search(query: IntelligenceSearchQuery): Promise<IntelligenceSearchResponse>;
  getSourceHealth(options?: { includeNikePublic?: boolean }): Promise<IntelligenceSourceHealthRecord[]>;
}

