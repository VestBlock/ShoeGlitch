import { buildFeaturedSneakerSet, getSneakerProduct } from '@/features/intelligence/provider-service';
import { buildScoreRecord } from '@/features/intelligence/scoring';
import type { NormalizedSneaker } from '@/features/intelligence/providers/types';
import type { SneakerFeedItem, SneakerFeedResult } from '@/features/intelligence/types';

function describeProvider(item: NormalizedSneaker) {
  switch (item.provider) {
    case 'kicksdb':
      return {
        sourceType: 'snapshot' as const,
        sourceName: 'KicksDB',
        marketConfidence: item.priceSummary.isPlaceholder ? 44 : 78,
      };
    case 'nike-public':
      return {
        sourceType: 'snapshot' as const,
        sourceName: 'Nike SNKRS public feed',
        marketConfidence: 58,
      };
    case 'sneaks':
      return {
        sourceType: 'snapshot' as const,
        sourceName: 'Sneaks API comparison',
        marketConfidence: 50,
      };
    default:
      return {
        sourceType: 'fallback' as const,
        sourceName: 'Mock fallback',
        marketConfidence: 44,
      };
  }
}

function sortByPriority(items: SneakerFeedItem[]) {
  return [...items].sort((left, right) => {
    const urgencyDelta = right.scores.urgency - left.scores.urgency;
    if (urgencyDelta !== 0) return urgencyDelta;

    const releaseDelta = new Date(left.release.date).getTime() - new Date(right.release.date).getTime();
    if (releaseDelta !== 0) return releaseDelta;

    return right.scores.flipPotential - left.scores.flipPotential;
  });
}

function mergeUnique(items: SneakerFeedItem[]) {
  const seen = new Set<string>();
  const merged: SneakerFeedItem[] = [];

  for (const item of items) {
    const identity = `${item.slug}:${item.sku}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    merged.push(item);
  }

  return merged;
}

function inferMaterials(item: NormalizedSneaker) {
  const text = `${item.name} ${item.colorway} ${item.description}`.toLowerCase();
  const materials: string[] = [];

  if (/(white|cream|sail|light)/.test(text)) materials.push('light-upper');
  if (/mesh/.test(text)) materials.push('mesh');
  if (/suede/.test(text)) materials.push('suede');
  if (/leather/.test(text)) materials.push('leather');
  if (/gum/.test(text)) materials.push('gum-sole');
  if (/jordan 1|collector|retro/.test(text)) materials.push('collector-lean');

  return materials;
}

function inferFlags(item: NormalizedSneaker) {
  const flags: SneakerFeedItem['opportunityFlags'] = [];
  if (item.availability === 'upcoming') flags.push('upcoming');
  if (item.availability === 'watch-worthy') flags.push('watch');
  if (inferMaterials(item).some((material) => ['light-upper', 'mesh', 'suede'].includes(material))) flags.push('cleaning');
  if (inferMaterials(item).some((material) => ['leather', 'collector-lean'].includes(material))) flags.push('restoration');
  if ((item.priceSummary.lowestAsk ?? 0) > (item.retailPrice ?? 0)) flags.push('flip');
  return [...new Set(flags)];
}

function mapNormalizedToFeedItem(item: NormalizedSneaker): SneakerFeedItem {
  const now = new Date();
  const materials = inferMaterials(item);
  const opportunityFlags = inferFlags(item);
  const providerInfo = describeProvider(item);
  const market = {
    source: item.provider,
    capturedAt: item.updatedAt,
    lowAsk: item.priceSummary.lowestAsk,
    lastSale: item.priceSummary.lastSale,
    estimatedResale: item.priceSummary.averagePrice,
    confidence: providerInfo.marketConfidence,
    isPlaceholder: item.priceSummary.isPlaceholder,
  };
  const scores = buildScoreRecord(
    {
      releaseDate: item.releaseDate ?? item.updatedAt,
      retailPrice: item.retailPrice ?? 0,
      market,
      materials,
      opportunityFlags,
      sourceType: providerInfo.sourceType,
    },
    now,
  );

  const primaryCta =
    scores.restoration >= scores.cleaning
      ? {
          label: 'Restore this pair',
          href: `/book?intent=restoration&pair=${item.slug}`,
          kind: 'book-restoration' as const,
        }
      : {
          label: 'Book cleaning',
          href: `/book?intent=cleaning&pair=${item.slug}`,
          kind: 'book-cleaning' as const,
        };

  return {
    id: item.id,
    externalId: item.externalId,
    provider: item.provider,
    slug: item.slug,
    name: item.name,
    brand: item.brand,
    silhouette: item.model,
    colorway: item.colorway,
    sku: item.sku,
    category: item.category,
    description: item.description,
    availability: item.availability,
    marketUrl: item.marketUrl,
    sizes: item.sizes,
    priceSummary: item.priceSummary,
    release: {
      date: item.releaseDate ?? item.updatedAt,
      timezone: 'UTC',
      status: item.availability === 'released' ? 'released' : 'upcoming',
      retailPrice: item.retailPrice ?? 0,
      currency: 'USD',
      retailers: item.marketUrl
        ? [{ label: 'Market page', href: item.marketUrl, retailer: item.provider }]
        : [{ label: 'Feed detail', href: `/intelligence/${item.slug}`, retailer: 'Shoe Glitch feed' }],
    },
    market,
    media: {
      thumbnailUrl: item.imageUrl,
      alt: `${item.name} intelligence preview`,
      dominantTone: '#1f6fd7',
    },
    sourceType: providerInfo.sourceType,
    sourceName: providerInfo.sourceName,
    sourceUrl: item.marketUrl ?? undefined,
    materials,
    opportunityFlags,
    scores,
    primaryCta,
    secondaryCta: {
      label: item.marketUrl ? 'View market' : 'Watch market',
      href: item.marketUrl ?? `/intelligence/${item.slug}`,
      kind: 'watch-market',
    },
    rankingNote:
      item.provider === 'nike-public'
        ? 'This release is coming from Nike SNKRS public launch data, so market pricing is still a placeholder while KicksDB is offline locally.'
        : item.priceSummary.isPlaceholder
          ? 'Market fields are still partial here, so treat this as a service-first watch candidate.'
        : 'Live provider pricing is available here, which makes the feed ranking more reliable.',
    lastUpdatedAt: item.updatedAt,
  };
}

export async function getSneakerFeed(): Promise<SneakerFeedResult> {
  const featured = await buildFeaturedSneakerSet();
  const merged = mergeUnique(featured.items.map(mapNormalizedToFeedItem));
  const items = sortByPriority(merged);
  const usedFallbackData = featured.usedFallbackData;

  return {
    items,
    sourceHealth: featured.sourceHealth,
    generatedAt: featured.generatedAt,
    usedFallbackData,
  };
}

export async function getSneakerBySlug(slug: string) {
  const product = await getSneakerProduct(slug);
  if (product.item) return mapNormalizedToFeedItem(product.item);

  const feed = await getSneakerFeed();
  return feed.items.find((item) => item.slug === slug || item.externalId === slug);
}

export async function getIntelligenceRouteIndex() {
  const feed = await getSneakerFeed();
  return feed.items.map((item) => ({
    path: `/intelligence/${item.slug}`,
    updatedAt: item.lastUpdatedAt,
  }));
}
