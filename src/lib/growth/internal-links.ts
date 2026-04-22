import { buildGrowthRouteIndex } from '@/lib/growth/catalog';
import type { GrowthLinkSuggestion, GrowthRouteSpec } from '@/lib/growth/types';

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function similarity(a: string, b: string) {
  const aTokens = new Set(tokenize(a));
  const bTokens = new Set(tokenize(b));
  let score = 0;

  for (const token of aTokens) {
    if (bTokens.has(token)) score += 1;
  }

  return score;
}

export function suggestGrowthLinks(spec: GrowthRouteSpec): GrowthLinkSuggestion[] {
  const currentRoutes = buildGrowthRouteIndex();
  const candidates = currentRoutes
    .filter((item) => item.path !== spec.path)
    .map((item) => {
      const keywordA = spec.keyword?.keyword ?? spec.service?.name ?? spec.primary;
      const keywordB = item.keyword?.keyword ?? item.service?.name ?? item.primary;
      const score =
        similarity(keywordA, keywordB) +
        (item.location.slug === spec.location.slug ? 2 : 0) +
        (item.primary === spec.primary ? 3 : 0);

      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return candidates.map(({ item }) => ({
    href: item.path,
    label:
      item.kind === 'programmatic'
        ? `${item.keyword!.keyword} in ${item.location.city}`
        : item.kind === 'service-neighborhood'
          ? `${item.service!.name} in ${item.neighborhood!.name}`
          : item.kind === 'service-near-me'
            ? `${item.service!.name} near me`
            : `${item.service!.name} in ${item.location.city}`,
    reason:
      item.location.slug === spec.location.slug
        ? 'Related for the same market'
        : 'Related service intent',
  }));
}
