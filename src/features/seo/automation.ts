import {
  buildCityHubPageModel,
  buildLocationsIndexPageModel,
  buildServiceAreaPageModel,
  buildServiceCityPageModel,
  buildServiceHubPageModel,
  buildServiceNearMePageModel,
} from '@/features/seo/content';
import {
  buildBecomeOperatorPageModel,
  buildOperatorCityPageModel,
  buildOperatorsIndexPageModel,
  buildPickupDropoffOperatorCityPageModel,
  buildShoeRestorationSideHustlePageModel,
  buildStartSneakerCleaningBusinessPageModel,
} from '@/features/operator-seo/content';
import type { OperatorSeoPageKind } from '@/features/operator-seo/types';
import { getSeoRouteIndex } from '@/features/seo/routes';
import type { SeoPageKind, SeoServiceSlug } from '@/features/seo/types';
import { getOperatorSeoRouteIndex } from '@/features/operator-seo/routes';

export interface SeoAutomationEntry {
  kind: SeoPageKind | OperatorSeoPageKind;
  family: 'hub' | 'city' | 'area' | 'near-me' | 'operator-hub' | 'operator-city' | 'operator-guide';
  path: string;
  title: string;
  description: string;
  city?: string;
  service?: SeoServiceSlug;
  area?: string;
  role?: string;
}

export function parseSeoRoute(
  path: string,
): { kind: SeoPageKind; city?: string; service?: SeoServiceSlug; area?: string } | null {
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 1 && segments[0] === 'locations') {
    return { kind: 'locations-index' };
  }

  if (
    segments.length === 1 &&
    (segments[0] === 'sneaker-cleaning' || segments[0] === 'shoe-restoration' || segments[0] === 'pickup-dropoff')
  ) {
    return {
      kind: 'service-hub',
      service: segments[0] as SeoServiceSlug,
    };
  }

  if (
    segments.length === 2 &&
    (segments[0] === 'sneaker-cleaning' || segments[0] === 'shoe-restoration' || segments[0] === 'pickup-dropoff') &&
    segments[1] === 'near-me'
  ) {
    return {
      kind: 'service-near-me',
      service: segments[0] as SeoServiceSlug,
    };
  }

  if (segments[0] === 'locations' && segments[1]) {
    return { kind: 'city-hub', city: segments[1] };
  }

  if (
    segments.length === 3 &&
    (segments[0] === 'sneaker-cleaning' || segments[0] === 'shoe-restoration' || segments[0] === 'pickup-dropoff')
  ) {
    return {
      kind: 'service-area',
      service: segments[0] as SeoServiceSlug,
      city: segments[1],
      area: segments[2],
    };
  }

  if (
    (segments[0] === 'sneaker-cleaning' ||
      segments[0] === 'shoe-restoration' ||
      segments[0] === 'pickup-dropoff') &&
    segments[1]
  ) {
    return {
      kind: 'service-city',
      service: segments[0] as SeoServiceSlug,
      city: segments[1],
    };
  }

  return null;
}

export async function buildSeoAutomationManifest(): Promise<SeoAutomationEntry[]> {
  const [routes, operatorRoutes] = await Promise.all([getSeoRouteIndex(), getOperatorSeoRouteIndex()]);
  const entries: SeoAutomationEntry[] = [];

  for (const path of routes) {
    const parsed = parseSeoRoute(path);
    if (!parsed) continue;

    const model =
      parsed.kind === 'locations-index'
        ? await buildLocationsIndexPageModel()
        : parsed.kind === 'city-hub'
          ? await buildCityHubPageModel(parsed.city!)
          : parsed.kind === 'service-hub'
            ? await buildServiceHubPageModel(parsed.service!)
            : parsed.kind === 'service-near-me'
              ? await buildServiceNearMePageModel(parsed.service!)
              : parsed.kind === 'service-area'
                ? await buildServiceAreaPageModel(parsed.service!, parsed.city!, parsed.area!)
                : await buildServiceCityPageModel(parsed.service!, parsed.city!);

    if (!model) continue;

    entries.push({
      kind: model.kind,
      family:
        model.kind === 'service-hub' || model.kind === 'locations-index'
          ? 'hub'
          : model.kind === 'service-near-me'
            ? 'near-me'
            : model.kind === 'service-area'
              ? 'area'
              : 'city',
      path: model.path,
      title: model.title,
      description: model.description,
      city: 'city' in model ? model.city.slug : undefined,
      service: 'service' in model ? model.service?.slug : undefined,
      area: model.kind === 'service-area' ? model.serviceAreas[0]?.name : undefined,
    });
  }

  for (const path of operatorRoutes) {
    let model = null;

    if (path === '/operators') model = await buildOperatorsIndexPageModel();
    else if (path === '/become-an-operator') model = await buildBecomeOperatorPageModel();
    else if (path === '/start-a-sneaker-cleaning-business')
      model = await buildStartSneakerCleaningBusinessPageModel();
    else if (path === '/shoe-restoration-side-hustle')
      model = await buildShoeRestorationSideHustlePageModel();
    else if (path.startsWith('/operator-opportunities/'))
      model = await buildOperatorCityPageModel(path.split('/').filter(Boolean)[1]!);
    else if (path.startsWith('/pickup-dropoff-operator/'))
      model = await buildPickupDropoffOperatorCityPageModel(path.split('/').filter(Boolean)[1]!);

    if (!model) continue;

    entries.push({
      kind: model.kind,
      family:
        model.kind === 'operator-city' || model.kind === 'pickup-operator-city'
          ? 'operator-city'
          : model.kind === 'business-guide' || model.kind === 'side-hustle-guide'
            ? 'operator-guide'
            : 'operator-hub',
      path: model.path,
      title: model.title,
      description: model.description,
      city: model.city?.slug,
      role: model.role,
    });
  }

  return entries.sort((a, b) => a.path.localeCompare(b.path));
}
