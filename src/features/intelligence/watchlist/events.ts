import { buildFeaturedSneakerSet } from '@/features/intelligence/provider-service';
import { getRetailMonitorEvents } from '@/features/intelligence/monitors/service';
import type { NormalizedSneaker } from '@/features/intelligence/providers/types';
import type { SneakerEventRecord, SneakerEventType } from '@/features/intelligence/watchlist/types';

function makeEventId(item: NormalizedSneaker, eventType: SneakerEventType) {
  const seed = `${item.provider}:${item.externalId}:${item.sku || item.slug}:${eventType}:${item.releaseDate ?? item.updatedAt}`;
  return seed.toLowerCase().replace(/[^a-z0-9:.-]+/g, '-');
}

function baseEvent(item: NormalizedSneaker, eventType: SneakerEventType): SneakerEventRecord {
  return {
    id: makeEventId(item, eventType),
    source: item.provider,
    sourceEventKey: `${item.provider}:${item.externalId}:${eventType}`,
    eventType,
    name: item.name,
    brand: item.brand,
    model: item.model,
    colorway: item.colorway,
    sku: item.sku || null,
    size: item.sizes[0]?.label ?? null,
    price: item.priceSummary.lowestAsk ?? item.priceSummary.averagePrice ?? item.priceSummary.lastSale ?? item.retailPrice ?? null,
    currency: item.priceSummary.currency || 'USD',
    imageUrl: item.imageUrl,
    marketUrl: item.marketUrl,
    eventDate: item.releaseDate ?? item.updatedAt,
    metadata: {
      availability: item.availability,
      rawSummary: item.rawSummary ?? {},
      sizesCount: item.sizes.length,
    },
    createdAt: new Date().toISOString(),
  };
}

function toSneakerEvents(item: NormalizedSneaker): SneakerEventRecord[] {
  const events: SneakerEventRecord[] = [];

  if (item.availability === 'upcoming') {
    events.push(baseEvent(item, 'release'));
  }

  const hasSizes = item.sizes.length > 0;
  const releasedOrLive = item.availability === 'released' || hasSizes;
  if (releasedOrLive) {
    events.push(baseEvent(item, 'restock'));
  }

  if (item.priceSummary.lowestAsk && item.retailPrice && item.priceSummary.lowestAsk <= item.retailPrice * 0.92) {
    events.push(baseEvent(item, 'price_drop'));
  }

  if (events.length === 0) {
    events.push(baseEvent(item, 'restock'));
  }

  return events;
}

function uniqueEvents(events: SneakerEventRecord[]) {
  const seen = new Set<string>();
  return events.filter((event) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

export async function loadCurrentSneakerEvents(limit = 24) {
  const featured = await buildFeaturedSneakerSet();
  const providerEvents = featured.items.slice(0, limit).flatMap(toSneakerEvents);
  const monitorEvents = await getRetailMonitorEvents(Math.max(12, Math.ceil(limit / 2)));
  return uniqueEvents([...providerEvents, ...monitorEvents].slice(0, limit + monitorEvents.length));
}

export function buildMockSneakerEvents(now = new Date()): SneakerEventRecord[] {
  const iso = now.toISOString();
  return [
    {
      id: 'mock-release-jordan-4-white-navy',
      source: 'mock',
      sourceEventKey: 'mock:jordan-4-white-navy:release',
      eventType: 'release',
      name: 'Air Jordan 4 White Navy',
      brand: 'Jordan',
      model: 'Jordan 4',
      colorway: 'White / Midnight Navy',
      sku: 'FV5029-141',
      size: null,
      price: 215,
      currency: 'USD',
      imageUrl: '/ShoeTest-poster.png',
      marketUrl: 'https://shoeglitch.com/intelligence',
      eventDate: iso,
      metadata: { mocked: true },
      createdAt: iso,
    },
    {
      id: 'mock-restock-foamposite-galaxy',
      source: 'mock',
      sourceEventKey: 'mock:foamposite-galaxy:restock',
      eventType: 'restock',
      name: 'Foamposite Galaxy',
      brand: 'Nike',
      model: 'Foamposite One',
      colorway: 'Galaxy',
      sku: 'FQ4303-400',
      size: '10',
      price: 420,
      currency: 'USD',
      imageUrl: '/ShoeTest-poster.png',
      marketUrl: 'https://shoeglitch.com/intelligence',
      eventDate: iso,
      metadata: { mocked: true },
      createdAt: iso,
    },
  ];
}
