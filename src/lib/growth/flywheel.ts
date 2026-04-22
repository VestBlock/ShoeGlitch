import { buildGrowthRouteIndex } from '@/lib/growth/catalog';
import { resolveGrowthContent } from '@/lib/growth/content-generator';

export async function buildGrowthGenerationQueue(limit?: number) {
  const routes = buildGrowthRouteIndex();
  return typeof limit === 'number' ? routes.slice(0, limit) : routes;
}

export async function materializeGrowthPages(limit?: number) {
  const routes = await buildGrowthGenerationQueue(limit);
  const pages = [];

  for (const route of routes) {
    const payload = await resolveGrowthContent(route, {
      persist: true,
      preferLiveGeneration: true,
    });
    pages.push({ route: route.path, title: payload.title });
  }

  return pages;
}
