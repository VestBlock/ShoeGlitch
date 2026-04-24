export type RetailMonitorStatus = 'healthy' | 'degraded' | 'fallback';

export interface RetailMonitorEntry {
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

export interface RetailMonitorHealth {
  key: string;
  label: string;
  status: RetailMonitorStatus;
  message: string;
  sourceUrl: string;
  httpStatus?: number;
  checkedAt: string;
  lastSuccessAt?: string;
}

export interface RetailMonitorSnapshot {
  generatedAt: string;
  entries: RetailMonitorEntry[];
  health: RetailMonitorHealth[];
}

export interface RetailMonitorSource {
  key: string;
  label: string;
  sourceUrl: string;
  collect(now: Date): Promise<{
    entries: RetailMonitorEntry[];
    health: RetailMonitorHealth;
  }>;
}

