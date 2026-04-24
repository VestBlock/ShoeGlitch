import { adidasMonitorSource } from '@/features/intelligence/monitors/adidas';
import { createBlockedAwareSource } from '@/features/intelligence/monitors/blocked';
import { footLockerMonitorSource } from '@/features/intelligence/monitors/footlocker';
import type { RetailMonitorEntry, RetailMonitorSnapshot, RetailMonitorSource } from '@/features/intelligence/monitors/types';
import type { SneakerEventRecord } from '@/features/intelligence/watchlist/types';

const MONITOR_SOURCES: RetailMonitorSource[] = [
  adidasMonitorSource,
  footLockerMonitorSource,
  createBlockedAwareSource({
    key: 'new-balance',
    label: 'New Balance launch calendar',
    sourceUrl: 'https://www.newbalance.com/men/featured/launch-calendar/',
  }),
  createBlockedAwareSource({
    key: 'finish-line',
    label: 'Finish Line release calendar',
    sourceUrl: 'https://www.finishline.com/sneaker-release-dates?mnid=release_calendar',
  }),
  createBlockedAwareSource({
    key: 'snipes',
    label: 'SNIPES releases',
    sourceUrl: 'https://www.snipesusa.com/releases/',
  }),
  createBlockedAwareSource({
    key: 'eql',
    label: 'EQL launches',
    sourceUrl: 'https://eql.com/',
  }),
];

function mergeEntries(entries: RetailMonitorEntry[]) {
  const unique = new Map<string, RetailMonitorEntry>();
  for (const entry of entries) unique.set(entry.id, entry);
  return [...unique.values()];
}

function entryToSneakerEvent(entry: RetailMonitorEntry): SneakerEventRecord {
  return {
    id: `monitor:${entry.id}`,
    source: entry.source,
    sourceEventKey: `monitor:${entry.source}:${entry.id}`,
    eventType: 'release',
    name: entry.name,
    brand: entry.brand,
    model: entry.model,
    colorway: entry.colorway ?? null,
    sku: entry.sku ?? null,
    size: null,
    price: null,
    currency: 'USD',
    imageUrl: entry.imageUrl ?? null,
    marketUrl: entry.url,
    eventDate: entry.releaseDate ?? entry.detectedAt,
    metadata: {
      ...entry.metadata,
      monitorSource: entry.sourceLabel,
    },
    createdAt: entry.detectedAt,
  };
}

export async function getRetailMonitorSnapshot(): Promise<RetailMonitorSnapshot> {
  const now = new Date();
  const collected = await Promise.all(MONITOR_SOURCES.map((source) => source.collect(now)));
  return {
    generatedAt: now.toISOString(),
    entries: mergeEntries(collected.flatMap((item) => item.entries)),
    health: collected.map((item) => item.health),
  };
}

export async function getRetailMonitorEvents(limit = 40): Promise<SneakerEventRecord[]> {
  const snapshot = await getRetailMonitorSnapshot();
  return snapshot.entries.slice(0, limit).map(entryToSneakerEvent);
}

