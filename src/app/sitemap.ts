import type { MetadataRoute } from 'next';
import { buildGrowthRouteIndex } from '@/lib/growth/catalog';
import { getIntelligenceRouteIndex } from '@/features/intelligence/service';

const SITE_URL = 'https://www.shoeglitch.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/services',
    '/coverage',
    '/mail-in',
    '/book',
    '/operator',
    '/privacy',
    '/terms',
    '/refund-policy',
    '/intelligence',
  ];

  const growthRoutes = buildGrowthRouteIndex().map((item) => item.path);
  const intelligenceRoutes = (await getIntelligenceRouteIndex()).map((item) => item.path);

  return [...staticRoutes, ...growthRoutes, ...intelligenceRoutes].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'daily',
    priority: route === '' ? 1 : 0.8,
  }));
}
