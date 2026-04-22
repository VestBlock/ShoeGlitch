import { MOCK_OPPORTUNITIES } from '@/features/intelligence/fixtures';
import { buildScoreRecord } from '@/features/intelligence/scoring';
import type { SneakerFeedAdapter } from '@/features/intelligence/adapters/types';
import type { SneakerFeedItem } from '@/features/intelligence/types';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const mockFallbackAdapter: SneakerFeedAdapter = {
  key: 'mock-fallback',
  label: 'Mock fallback adapter',
  async load(now) {
    const items: SneakerFeedItem[] = MOCK_OPPORTUNITIES.map((entry) => {
      const slug = slugify(entry.name);
      const market = {
        source: 'placeholder-model',
        capturedAt: now.toISOString(),
        lowAsk: null,
        lastSale: null,
        estimatedResale: entry.marketPlaceholder ?? null,
        confidence: 42,
        isPlaceholder: true,
      };
      const scores = buildScoreRecord(
        {
          releaseDate: entry.releaseDate,
          retailPrice: entry.retailUsd,
          market,
          materials: entry.materials,
          opportunityFlags: entry.suggestedFlags,
          sourceType: 'fallback',
        },
        now,
      );

      return {
        id: entry.seedId,
        externalId: entry.seedId,
        provider: 'mock',
        slug,
        name: entry.name,
        brand: entry.brand,
        silhouette: entry.silhouette,
        colorway: entry.colorway,
        sku: entry.sku,
        category: 'sneakers',
        description: entry.description,
        availability: new Date(entry.releaseDate) > now ? 'upcoming' : 'watch-worthy',
        marketUrl: null,
        sizes: [],
        priceSummary: {
          retailPrice: entry.retailUsd,
          lowestAsk: entry.marketPlaceholder ?? null,
          lastSale: null,
          averagePrice: entry.marketPlaceholder ?? null,
          currency: 'USD',
          isPlaceholder: true,
        },
        release: {
          date: entry.releaseDate,
          timezone: 'UTC',
          status: new Date(entry.releaseDate) > now ? 'upcoming' : 'released',
          retailPrice: entry.retailUsd,
          currency: 'USD',
          retailers: [{ label: 'Monitor drop', href: `/intelligence/${slug}`, retailer: 'Shoe Glitch feed' }],
        },
        market,
        media: {
          thumbnailUrl: entry.imageUrl,
          alt: `${entry.name} opportunity preview`,
          dominantTone: '#1348a7',
        },
        sourceType: 'fallback',
        sourceName: 'Shoe Glitch fallback',
        materials: entry.materials,
        opportunityFlags: entry.suggestedFlags,
        scores,
        primaryCta:
          scores.restoration >= scores.cleaning
            ? {
                label: 'Restore this pair',
                href: `/book?intent=restoration&pair=${slug}`,
                kind: 'book-restoration',
              }
            : {
                label: 'Book cleaning',
                href: `/book?intent=cleaning&pair=${slug}`,
                kind: 'book-cleaning',
              },
        secondaryCta: {
          label: 'Join waitlist',
          href: `/intelligence/${slug}`,
          kind: 'join-waitlist',
        },
        rankingNote: 'Fallback intelligence layer active while live market data is still being wired.',
        lastUpdatedAt: now.toISOString(),
      };
    });

    return {
      items,
      health: {
        key: 'mock-fallback',
        label: 'Mock fallback adapter',
        status: 'fallback',
        lastAttemptAt: now.toISOString(),
        lastSuccessAt: now.toISOString(),
        message: `${items.length} curated fallback records are available if live source coverage is incomplete.`,
      },
    };
  },
};
