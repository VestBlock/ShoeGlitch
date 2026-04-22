import type { SneakerFeedItem, SourceHealth } from '@/features/intelligence/types';

export interface AdapterResult {
  items: SneakerFeedItem[];
  health: SourceHealth;
}

export interface SneakerFeedAdapter {
  key: string;
  label: string;
  load(now: Date): Promise<AdapterResult>;
}
