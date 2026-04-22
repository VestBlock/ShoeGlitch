import type { MetadataRoute } from 'next';
import { buildGrowthRouteIndex } from '@/lib/growth/catalog';
import { getIntelligenceRouteIndex } from '@/features/intelligence/service';
import { getReleaseRouteIndex } from '@/features/releases/content';
import { getWorthRestoringRouteIndex } from '@/features/releases/restoration-content';
import { getHowToCleanRouteIndex } from '@/features/releases/cleaning-content';
import { getReleaseAlertsRouteIndex } from '@/features/releases/alerts-content';
import { getSeoRouteIndex } from '@/features/seo/routes';
import { getOperatorSeoRouteIndex } from '@/features/operator-seo/routes';

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
  const releaseRoutes = (await getReleaseRouteIndex()).map((item) => item.path);
  const worthRestoringRoutes = (await getWorthRestoringRouteIndex()).map((item) => item.path);
  const howToCleanRoutes = (await getHowToCleanRouteIndex()).map((item) => item.path);
  const releaseAlertRoutes = (await getReleaseAlertsRouteIndex()).map((item) => item.path);
  const seoRoutes = await getSeoRouteIndex();
  const operatorSeoRoutes = await getOperatorSeoRouteIndex();

  return [
    ...staticRoutes,
    ...growthRoutes,
    ...intelligenceRoutes,
    ...releaseRoutes,
    ...worthRestoringRoutes,
    ...howToCleanRoutes,
    ...releaseAlertRoutes,
    ...seoRoutes,
    ...operatorSeoRoutes,
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'daily',
    priority: route === '' ? 1 : 0.8,
  }));
}
