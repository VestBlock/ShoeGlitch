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
    const pressureDelta = right.scores.releasePressure - left.scores.releasePressure;
    if (pressureDelta !== 0) return pressureDelta;

    const releaseDelta = new Date(left.release.date).getTime() - new Date(right.release.date).getTime();
    if (releaseDelta !== 0) return releaseDelta;

    return right.scores.marketWatchFit - left.scores.marketWatchFit;
  });
}

function mixProviders(items: SneakerFeedItem[]) {
  const nike = items.filter((item) => item.provider === 'nike-public');
  const primary = items.filter((item) => item.provider !== 'nike-public');

  if (nike.length === 0) return items;

  const frontloaded: SneakerFeedItem[] = [];
  const nikeTarget = Math.min(6, nike.length);
  let nikeUsed = 0;
  let primaryIndex = 0;
  let nikeIndex = 0;

  while (frontloaded.length < Math.min(items.length, 24) && (primaryIndex < primary.length || nikeIndex < nike.length)) {
    for (let i = 0; i < 3 && primaryIndex < primary.length && frontloaded.length < 24; i += 1) {
      frontloaded.push(primary[primaryIndex]);
      primaryIndex += 1;
    }
    if (nikeUsed < nikeTarget && nikeIndex < nike.length && frontloaded.length < 24) {
      frontloaded.push(nike[nikeIndex]);
      nikeIndex += 1;
      nikeUsed += 1;
    }
  }

  const used = new Set(frontloaded.map((item) => `${item.provider}:${item.externalId}:${item.sku}`));
  const remainder = items.filter((item) => !used.has(`${item.provider}:${item.externalId}:${item.sku}`));

  return [...frontloaded, ...remainder];
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
  const text = `${item.name} ${item.model} ${item.colorway} ${item.description} ${item.sku} ${item.brand}`.toLowerCase();
  const traits = new Set<string>();

  if (/(white|light bone|summit white|cream|sail|ivory|bone|coconut milk|pearl|orewood|fossil|light smoke)/.test(text)) {
    traits.add('light-upper');
  }
  if (/(cream|sail|bone|ivory|coconut milk)/.test(text)) traits.add('cream-upper');
  if (/(black|anthracite|obsidian|navy|midnight|onyx|charcoal)/.test(text)) traits.add('dark-upper');
  if (/mesh|netting/.test(text)) traits.add('mesh');
  if (/suede/.test(text)) traits.add('suede');
  if (/nubuck/.test(text)) traits.add('nubuck');
  if (/canvas|hemp/.test(text)) traits.add('canvas');
  if (/knit|flyknit|primeknit/.test(text)) traits.add('knit');
  if (/patent/.test(text)) traits.add('patent');
  if (/leather/.test(text)) traits.add('leather');
  if (/gum/.test(text)) traits.add('gum-sole');
  if (/icy|translucent/.test(text)) traits.add('icy-sole');
  if (/sail midsole|aged sole|yellowed|yellowing/.test(text)) traits.add('aged-sole');
  if (/midsole/.test(text)) traits.add('white-midsole');
  if (/(daily|everyday|lifestyle|general release|easy wear)/.test(text)) traits.add('daily-wear');
  if (/retro|og|reimagined|anniversary|foamposite/.test(text)) traits.add('retro-lean');
  if (/(travis scott|off-white|union|a ma maniere|fragment|kith|patta|concepts|trophy room|salehe|j balvin)/.test(text)) {
    traits.add('collab-lean');
  }
  if ((item.rawSummary?.rank ?? 99999) < 2500) traits.add('limited-lean');
  if ((item.priceSummary.averagePrice ?? item.priceSummary.lowestAsk ?? 0) >= 350) traits.add('premium-lean');
  if (/(air max|vomero|pegasus|samba|gel-|asics|runner|1906|990|2002r)/.test(text)) traits.add('runner-lean');
  if (/dunk|jordan|air force|foamposite|retro/.test(text)) traits.add('collector-lean');
  if (!traits.has('limited-lean') && !traits.has('collab-lean') && !traits.has('collector-lean')) {
    traits.add('general-release');
  }

  return [...traits];
}

function inferFlags(item: NormalizedSneaker, materials: string[]) {
  const flags: SneakerFeedItem['opportunityFlags'] = [];
  if (item.availability === 'upcoming') flags.push('upcoming');
  if (item.availability === 'watch-worthy') flags.push('watch');
  if (materials.some((material) => ['light-upper', 'mesh', 'suede', 'nubuck', 'canvas', 'knit'].includes(material))) {
    flags.push('cleaning');
  }
  if (materials.some((material) => ['leather', 'collector-lean', 'collab-lean', 'retro-lean', 'aged-sole'].includes(material))) {
    flags.push('restoration');
  }
  if ((item.priceSummary.lowestAsk ?? 0) > (item.retailPrice ?? 0)) flags.push('flip');
  return [...new Set(flags)];
}

function buildRankingNote(item: NormalizedSneaker, materials: string[], scores: ReturnType<typeof buildScoreRecord>) {
  const textureReason = materials.find((material) =>
    ['mesh', 'suede', 'nubuck', 'canvas', 'knit', 'patent', 'leather'].includes(material),
  );
  const colorReason = materials.includes('light-upper')
    ? 'light colorway'
    : materials.includes('cream-upper')
      ? 'cream-toned upper'
      : materials.includes('dark-upper')
        ? 'darker finish'
        : 'material mix';
  const rarityReason = materials.find((material) =>
    ['collab-lean', 'limited-lean', 'collector-lean', 'premium-lean', 'retro-lean'].includes(material),
  );

  if (scores.serviceFit >= scores.marketWatchFit && scores.cleaning >= scores.restoration) {
    return `${item.name} leans cleaning-first because the ${colorReason}${textureReason ? ` and ${textureReason}` : ''} drive visible wear faster than most pairs in the feed.`;
  }

  if (scores.preservationValue >= scores.marketWatchFit) {
    return `${item.name} reads more like a restoration and preservation candidate thanks to its ${rarityReason?.replace(/-lean$/, '') ?? 'collector'} profile and the details owners usually want protected long-term.`;
  }

  return `${item.name} is more watchlist-driven right now because the market strength, liquidity, and release pressure are doing more work than the service profile, even if ${rarityReason ? 'rarity still helps the story' : 'the service angle remains secondary'}.`;
}

function buildWatchlistHref(item: NormalizedSneaker) {
  const params = new URLSearchParams({
    source: 'intelligence',
    sku: item.sku,
    brand: item.brand,
    model: item.model,
    colorway: item.colorway,
    name: item.name,
    slug: item.slug,
  });

  return `/customer/watchlist?${params.toString()}`;
}

function mapNormalizedToFeedItem(item: NormalizedSneaker): SneakerFeedItem {
  const now = new Date();
  const materials = inferMaterials(item);
  const opportunityFlags = inferFlags(item, materials);
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
      weeklyOrders: item.rawSummary?.weeklyOrders ?? null,
      rank: item.rawSummary?.rank ?? null,
      sizesCount: item.sizes.length,
    },
    now,
  );

  const serviceCta =
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
  const watchCta = {
    label: scores.releasePressure >= 72 ? 'Watch this release' : 'Add to watchlist',
    href: buildWatchlistHref(item),
    kind: 'join-waitlist' as const,
  };
  const primaryCta =
    scores.marketWatchFit >= scores.serviceFit + 8 && scores.confidence >= 54 ? watchCta : serviceCta;
  const secondaryCta = primaryCta.kind === 'join-waitlist' ? serviceCta : watchCta;

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
    secondaryCta,
    rankingNote:
      item.provider === 'nike-public'
        ? `${buildRankingNote(item, materials, scores)} Market pricing is still partial because this record is coming from Nike SNKRS public launch data.`
        : item.priceSummary.isPlaceholder
          ? `${buildRankingNote(item, materials, scores)} Market fields are still partial here, so treat this as a service-first watch candidate.`
          : buildRankingNote(item, materials, scores),
    lastUpdatedAt: item.updatedAt,
  };
}

export async function getSneakerFeed(options?: { includeNikePublic?: boolean }): Promise<SneakerFeedResult> {
  const featured = await buildFeaturedSneakerSet({ includeNikePublic: options?.includeNikePublic ?? true });
  const merged = mergeUnique(featured.items.map(mapNormalizedToFeedItem));
  const items = mixProviders(sortByPriority(merged));
  const usedFallbackData = featured.usedFallbackData;

  return {
    items,
    sourceHealth: featured.sourceHealth,
    generatedAt: featured.generatedAt,
    usedFallbackData,
  };
}

export async function getSneakerBySlug(slug: string, options?: { includeNikePublic?: boolean }) {
  const includeNikePublic = options?.includeNikePublic ?? true;
  const feed = await getSneakerFeed({ includeNikePublic });
  const feedItem = feed.items.find((item) => item.slug === slug || item.externalId === slug);
  if (feedItem) return feedItem;

  const product = await getSneakerProduct(slug, { includeNikePublic });
  if (product.item) return mapNormalizedToFeedItem(product.item);

  return undefined;
}

export async function getIntelligenceRouteIndex() {
  const feed = await getSneakerFeed();
  return feed.items.map((item) => ({
    path: `/intelligence/${item.slug}`,
    updatedAt: item.lastUpdatedAt,
    provider: item.provider,
  }));
}
