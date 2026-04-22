import { SNAPSHOT_RELEASES } from '@/features/intelligence/fixtures';
import { buildScoreRecord } from '@/features/intelligence/scoring';
import type { SneakerFeedAdapter } from '@/features/intelligence/adapters/types';
import type { SneakerFeedItem, SneakerOpportunityKind } from '@/features/intelligence/types';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferFlags(materials: string[]): SneakerOpportunityKind[] {
  const flags = new Set<SneakerOpportunityKind>(['upcoming', 'watch']);

  if (materials.some((material) => ['mesh', 'white-upper', 'cream-upper', 'light-upper'].includes(material))) {
    flags.add('cleaning');
  }

  if (materials.some((material) => ['leather', 'suede', 'collector-lean'].includes(material))) {
    flags.add('restoration');
  }

  if (materials.some((material) => ['white-upper', 'collector-lean', 'silver-finish'].includes(material))) {
    flags.add('flip');
  }

  return [...flags];
}

function primaryAction(cleaning: number, restoration: number, slug: string) {
  if (restoration > cleaning + 8) {
    return {
      label: 'Restore this pair',
      href: `/book?intent=restoration&pair=${slug}`,
      kind: 'book-restoration' as const,
    };
  }

  return {
    label: 'Book cleaning',
    href: `/book?intent=cleaning&pair=${slug}`,
    kind: 'book-cleaning' as const,
  };
}

export const sourceSnapshotAdapter: SneakerFeedAdapter = {
  key: 'launch-snapshot',
  label: 'Launch snapshot adapter',
  async load(now) {
    try {
      const items: SneakerFeedItem[] = SNAPSHOT_RELEASES.map((entry) => {
        const slug = slugify(entry.headline);
        const opportunityFlags = inferFlags(entry.materials);
        const market = {
          source: 'snapshot-estimate',
          capturedAt: now.toISOString(),
          lowAsk: entry.market?.lowAsk ?? null,
          lastSale: entry.market?.lastSale ?? null,
          estimatedResale: entry.market?.estimatedResale ?? null,
          confidence: entry.market?.estimatedResale ? 78 : 54,
          isPlaceholder: !entry.market?.estimatedResale,
        };
        const scores = buildScoreRecord(
          {
            releaseDate: entry.launchDate,
            retailPrice: entry.retailUsd,
            market,
            materials: entry.materials,
            opportunityFlags,
            sourceType: 'snapshot',
          },
          now,
        );

        return {
          id: entry.sourceId,
          externalId: entry.sourceId,
          provider: 'kicksdb',
          slug,
          name: entry.headline,
          brand: entry.brandName,
          silhouette: entry.model,
          colorway: entry.colorDescription,
          sku: entry.styleCode,
          category: 'sneakers',
          description: entry.story,
          availability: new Date(entry.launchDate) > now ? 'upcoming' : 'released',
          marketUrl: entry.sourceUrl,
          sizes: [],
          priceSummary: {
            retailPrice: entry.retailUsd,
            lowestAsk: entry.market?.lowAsk ?? null,
            lastSale: entry.market?.lastSale ?? null,
            averagePrice: entry.market?.estimatedResale ?? null,
            currency: 'USD',
            isPlaceholder: !entry.market?.estimatedResale,
          },
          release: {
            date: entry.launchDate,
            timezone: 'UTC',
            status: new Date(entry.launchDate) > now ? 'upcoming' : 'released',
            retailPrice: entry.retailUsd,
            currency: 'USD',
            retailers: entry.retailerLinks,
          },
          market,
          media: {
            thumbnailUrl: entry.heroImage,
            alt: `${entry.headline} release preview`,
            dominantTone: '#1f6fd7',
          },
          sourceType: 'snapshot',
          sourceName: 'Launch snapshot',
          sourceUrl: entry.sourceUrl,
          materials: entry.materials,
          opportunityFlags,
          scores,
          primaryCta: primaryAction(scores.cleaning, scores.restoration, slug),
          secondaryCta: {
            label: 'Watch market',
            href: `/intelligence/${slug}`,
            kind: 'watch-market',
          },
          rankingNote:
            scores.flipPotential >= 65
              ? 'Healthy early spread with enough confidence to watch for affiliate upside.'
              : 'Service value is likely stronger than pure flip upside on first pass.',
          lastUpdatedAt: now.toISOString(),
        };
      });

      return {
        items,
        health: {
          key: 'launch-snapshot',
          label: 'Launch snapshot adapter',
          status: 'healthy',
          lastAttemptAt: now.toISOString(),
          lastSuccessAt: now.toISOString(),
          message: `${items.length} release records normalized from the current source snapshot.`,
        },
      };
    } catch (error) {
      return {
        items: [],
        health: {
          key: 'launch-snapshot',
          label: 'Launch snapshot adapter',
          status: 'degraded',
          lastAttemptAt: now.toISOString(),
          message: error instanceof Error ? error.message : 'Snapshot adapter failed.',
        },
      };
    }
  },
};
