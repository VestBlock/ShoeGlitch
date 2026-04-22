import { buildFeaturedSneakerSet } from '@/features/intelligence/provider-service';
import type { NormalizedSneaker } from '@/features/intelligence/providers/types';
import type { SneakerEventRecord, SneakerEventType } from '@/features/intelligence/watchlist/types';

function buildEventType(item: NormalizedSneaker): SneakerEventType {
  if (item.availability === 'upcoming') return 'release';
  if (item.priceSummary.lowestAsk && item.retailPrice && item.priceSummary.lowestAsk <= item.retailPrice * 0.92) {
    return 'price_drop';
  }
  return 'restock';
}

function makeEventId(item: NormalizedSneaker, eventType: SneakerEventType) {
  const seed = `${item.provider}:${item.externalId}:${item.sku || item.slug}:${eventType}:${item.releaseDate ?? item.updatedAt}`;
  return seed.toLowerCase().replace(/[^a-z0-9:.-]+/g, '-');
}

function toSneakerEvent(item: NormalizedSneaker): SneakerEventRecord {
  const eventType = buildEventType(item);
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
  return uniqueEvents(featured.items.slice(0, limit).map(toSneakerEvent));
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
