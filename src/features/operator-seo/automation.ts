import type { OperatorSeoPageKind } from '@/features/operator-seo/types';
import {
  buildBecomeOperatorPageModel,
  buildOperatorCityPageModel,
  buildOperatorsIndexPageModel,
  buildPickupDropoffOperatorCityPageModel,
  buildShoeRestorationSideHustlePageModel,
  buildStartSneakerCleaningBusinessPageModel,
} from '@/features/operator-seo/content';
import { getOperatorSeoRouteIndex } from '@/features/operator-seo/routes';

export interface OperatorSeoAutomationEntry {
  kind: OperatorSeoPageKind;
  family: 'operator-hub' | 'operator-city' | 'operator-guide';
  path: string;
  title: string;
  description: string;
  city?: string;
  role?: string;
}

export async function buildOperatorSeoAutomationManifest(): Promise<OperatorSeoAutomationEntry[]> {
  const routes = await getOperatorSeoRouteIndex();
  const entries: OperatorSeoAutomationEntry[] = [];

  for (const path of routes) {
    let model = null;

    if (path === '/operators') model = await buildOperatorsIndexPageModel();
    else if (path === '/become-an-operator') model = await buildBecomeOperatorPageModel();
    else if (path === '/start-a-sneaker-cleaning-business') {
      model = await buildStartSneakerCleaningBusinessPageModel();
    } else if (path === '/shoe-restoration-side-hustle') {
      model = await buildShoeRestorationSideHustlePageModel();
    } else if (path.startsWith('/operator-opportunities/')) {
      model = await buildOperatorCityPageModel(path.split('/').filter(Boolean)[1]!);
    } else if (path.startsWith('/pickup-dropoff-operator/')) {
      model = await buildPickupDropoffOperatorCityPageModel(path.split('/').filter(Boolean)[1]!);
    }

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
