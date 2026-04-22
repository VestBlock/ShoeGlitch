export type WatchlistAlertType = 'release' | 'restock' | 'price_drop' | 'any';
export type SneakerEventType = 'release' | 'restock' | 'price_drop';
export type MatchType = 'exact_sku' | 'fuzzy_identity';
export type AlertDeliveryStatus = 'sent' | 'failed' | 'skipped_duplicate';

export interface WatchlistItemRecord {
  id: string;
  userId: string;
  brand: string;
  model: string;
  name?: string | null;
  colorway?: string | null;
  sku?: string | null;
  size?: string | null;
  targetPrice?: number | null;
  alertType: WatchlistAlertType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SneakerEventRecord {
  id: string;
  source: string;
  sourceEventKey: string;
  eventType: SneakerEventType;
  name: string;
  brand: string;
  model: string;
  colorway?: string | null;
  sku?: string | null;
  size?: string | null;
  price?: number | null;
  currency: string;
  imageUrl?: string | null;
  marketUrl?: string | null;
  eventDate: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface SourceMatchRecord {
  id: string;
  watchlistItemId: string;
  sneakerEventId: string;
  matchType: MatchType;
  matchScore: number;
  explanation: string;
  createdAt: string;
}

export interface AlertDeliveryRecord {
  id: string;
  watchlistItemId: string;
  sneakerEventId: string;
  userId: string;
  channel: 'email';
  provider: 'resend';
  deliveryKey: string;
  status: AlertDeliveryStatus;
  errorMessage?: string | null;
  payload: Record<string, unknown>;
  sentAt?: string | null;
  createdAt: string;
}

export interface AlertHistoryItem {
  delivery: AlertDeliveryRecord;
  watchlistItem: WatchlistItemRecord;
  event: SneakerEventRecord;
}

export interface WatchlistIdentityInput {
  brand: string;
  model: string;
  name?: string | null;
  colorway?: string | null;
  sku?: string | null;
  size?: string | null;
  targetPrice?: number | null;
  alertType: WatchlistAlertType;
}

export interface WatchlistMatchResult {
  matched: boolean;
  matchType?: MatchType;
  score: number;
  explanation: string;
}
