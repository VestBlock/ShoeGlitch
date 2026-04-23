import {
  buildReleasePageModel,
} from '@/features/releases/content';
import { buildHowToCleanPageModel } from '@/features/releases/cleaning-content';
import { buildWorthRestoringPageModel } from '@/features/releases/restoration-content';
import { buildReleaseAlertsPageModel } from '@/features/releases/alerts-content';
import {
  buildCityHubPageModel,
  buildLocationsIndexPageModel,
  buildServiceAreaPageModel,
  buildServiceCityPageModel,
  buildServiceHubPageModel,
  buildServiceNearMePageModel,
} from '@/features/seo/content';
import { parseSeoRoute } from '@/features/seo/automation';
import { SITE_URL } from '@/features/seo/catalog';
import { getSneakerBySlug } from '@/features/intelligence/service';
import type { ReleasePageModel } from '@/features/releases/types';
import type { SeoLocationsIndexModel, SeoPageModel, SeoServiceHubModel } from '@/features/seo/types';
import type { SocialPageType, SocialSourceExtract } from '@/features/social/types';

function fallbackImageUrl() {
  return `${SITE_URL}/ShoeTest-poster.png`;
}

function buildSeoSocialImageUrl(
  pageType: SocialPageType,
  model: SeoPageModel | SeoServiceHubModel | SeoLocationsIndexModel,
) {
  const params = new URLSearchParams({
    title: model.title,
    eyebrow: model.eyebrow,
    location:
      'city' in model && model.city?.name
        ? model.city.name
        : model.title.includes('Locations')
          ? 'Locations'
          : 'Shoe Glitch',
    kind: 'service' in model && model.service?.slug ? model.service.slug : pageType,
  });

  return `${SITE_URL}/api/social-image?${params.toString()}`;
}

function isoOrNow(value?: string | null) {
  return value ?? new Date().toISOString();
}

function extractFromReleaseModel(pageType: SocialPageType, model: ReleasePageModel): SocialSourceExtract {
  return {
    routePath: model.path,
    canonicalUrl: model.canonicalUrl,
    pageType,
    sourceKind: 'release-engine',
    title: model.title,
    shortSummary: model.aiSummary,
    imageUrl: model.item.media.thumbnailUrl || fallbackImageUrl(),
    publishDate: model.item.release.date ?? null,
    sourceUpdatedAt: isoOrNow(model.item.lastUpdatedAt),
    metadata: {
      shoeName: model.item.name,
      brand: model.item.brand,
      model: model.item.silhouette,
      colorway: model.item.colorway,
      sku: model.item.sku,
      availability: model.item.availability,
      retailPrice: model.item.release.retailPrice,
      lowestAsk: model.item.priceSummary.lowestAsk,
      marketStrength: model.item.scores.marketStrength,
      cleaningScore: model.item.scores.cleaning,
      restorationScore: model.item.scores.restoration,
    },
  };
}

async function extractFromIntelligencePath(path: string): Promise<SocialSourceExtract | null> {
  const slug = path.replace('/intelligence/', '');
  const item = await getSneakerBySlug(slug);
  if (!item) return null;

  return {
    routePath: `/intelligence/${item.slug}`,
    canonicalUrl: `${SITE_URL}/intelligence/${item.slug}`,
    pageType: 'intelligence',
    sourceKind: 'intelligence-feed',
    title: `${item.name} intelligence`,
    shortSummary: item.rankingNote,
    imageUrl: item.media.thumbnailUrl || fallbackImageUrl(),
    publishDate: item.release.date ?? null,
    sourceUpdatedAt: isoOrNow(item.lastUpdatedAt),
    metadata: {
      shoeName: item.name,
      brand: item.brand,
      model: item.silhouette,
      colorway: item.colorway,
      sku: item.sku,
      availability: item.availability,
      retailPrice: item.release.retailPrice,
      provider: item.provider,
      marketStrength: item.scores.marketStrength,
      cleaningScore: item.scores.cleaning,
      restorationScore: item.scores.restoration,
    },
  };
}

function extractFromSeoModel(
  pageType: SocialPageType,
  model: SeoPageModel | SeoServiceHubModel | SeoLocationsIndexModel,
): SocialSourceExtract {
  const summary =
    'quickAnswer' in model && model.quickAnswer
      ? model.quickAnswer
      : model.intro;

  return {
    routePath: model.path,
    canonicalUrl: model.canonicalUrl,
    pageType,
    sourceKind: 'seo-engine',
    title: model.title,
    shortSummary: summary,
    imageUrl: buildSeoSocialImageUrl(pageType, model),
    publishDate: null,
    sourceUpdatedAt: new Date().toISOString(),
    metadata: {
      eyebrow: model.eyebrow,
      service: 'service' in model ? model.service?.slug : null,
      city: 'city' in model ? model.city?.slug : null,
      serviceAreas: 'serviceAreas' in model ? model.serviceAreas.map((area) => area.name) : [],
    },
  };
}

export async function extractSocialSourceFromPath(
  path: string,
  sourceUpdatedAtOverride?: string,
): Promise<SocialSourceExtract | null> {
  if (path.startsWith('/intelligence/')) {
    const source = await extractFromIntelligencePath(path);
    return sourceUpdatedAtOverride && source ? { ...source, sourceUpdatedAt: sourceUpdatedAtOverride } : source;
  }

  if (path.startsWith('/releases/')) {
    const slug = path.replace('/releases/', '');
    const model = await buildReleasePageModel(slug);
    if (!model) return null;
    const source = extractFromReleaseModel('release', model);
    return sourceUpdatedAtOverride ? { ...source, sourceUpdatedAt: sourceUpdatedAtOverride } : source;
  }

  if (path.startsWith('/how-to-clean/')) {
    const slug = path.replace('/how-to-clean/', '');
    const model = await buildHowToCleanPageModel(slug);
    if (!model) return null;
    const source = extractFromReleaseModel('how-to-clean', model);
    return sourceUpdatedAtOverride ? { ...source, sourceUpdatedAt: sourceUpdatedAtOverride } : source;
  }

  if (path.startsWith('/worth-restoring/')) {
    const slug = path.replace('/worth-restoring/', '');
    const model = await buildWorthRestoringPageModel(slug);
    if (!model) return null;
    const source = extractFromReleaseModel('worth-restoring', model);
    return sourceUpdatedAtOverride ? { ...source, sourceUpdatedAt: sourceUpdatedAtOverride } : source;
  }

  if (path.startsWith('/release-alerts/')) {
    const slug = path.replace('/release-alerts/', '');
    const model = await buildReleaseAlertsPageModel(slug);
    if (!model) return null;
    const source = extractFromReleaseModel('release-alerts', model);
    return sourceUpdatedAtOverride ? { ...source, sourceUpdatedAt: sourceUpdatedAtOverride } : source;
  }

  const parsed = parseSeoRoute(path);
  if (!parsed) return null;

  if (parsed.kind === 'locations-index') {
    const model = await buildLocationsIndexPageModel();
    const source = extractFromSeoModel('locations-index', model);
    return sourceUpdatedAtOverride ? { ...source, sourceUpdatedAt: sourceUpdatedAtOverride } : source;
  }

  if (parsed.kind === 'city-hub' && parsed.city) {
    const model = await buildCityHubPageModel(parsed.city);
    if (!model) return null;
    const source = extractFromSeoModel('city-hub', model);
    return sourceUpdatedAtOverride ? { ...source, sourceUpdatedAt: sourceUpdatedAtOverride } : source;
  }

  if (parsed.kind === 'service-hub' && parsed.service) {
    const model = await buildServiceHubPageModel(parsed.service);
    if (!model) return null;
    const source = extractFromSeoModel('service-hub', model);
    return sourceUpdatedAtOverride ? { ...source, sourceUpdatedAt: sourceUpdatedAtOverride } : source;
  }

  if (parsed.kind === 'service-near-me' && parsed.service) {
    const model = await buildServiceNearMePageModel(parsed.service);
    if (!model) return null;
    const source = extractFromSeoModel('service-near-me', model);
    return sourceUpdatedAtOverride ? { ...source, sourceUpdatedAt: sourceUpdatedAtOverride } : source;
  }

  if (parsed.kind === 'service-city' && parsed.service && parsed.city) {
    const model = await buildServiceCityPageModel(parsed.service, parsed.city);
    if (!model) return null;
    const source = extractFromSeoModel('service-city', model);
    return sourceUpdatedAtOverride ? { ...source, sourceUpdatedAt: sourceUpdatedAtOverride } : source;
  }

  if (parsed.kind === 'service-area' && parsed.service && parsed.city && parsed.area) {
    const model = await buildServiceAreaPageModel(parsed.service, parsed.city, parsed.area);
    if (!model) return null;
    const source = extractFromSeoModel('service-area', model);
    return sourceUpdatedAtOverride ? { ...source, sourceUpdatedAt: sourceUpdatedAtOverride } : source;
  }

  return null;
}
