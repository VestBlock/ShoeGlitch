import { db } from '@/lib/db';
import { resolveServicePrice, isRushEligible } from '@/lib/pricing';
import type { Service } from '@/types';

export interface ResolvedService extends Service {
  resolvedPrice: number;
  rushEligibleInCity: boolean;
}

export async function resolveCatalogForCity(cityId: string): Promise<{
  primary: ResolvedService[];
  addOns: ResolvedService[];
}> {
  const [primaryBase, addOnBase] = await Promise.all([
    db.services.primary(),
    db.services.addOns(),
  ]);

  const attach = async (s: Service): Promise<ResolvedService> => ({
    ...s,
    resolvedPrice: await resolveServicePrice(cityId, s.id),
    rushEligibleInCity: await isRushEligible(cityId, s.id),
  });

  const [primary, addOns] = await Promise.all([
    Promise.all(primaryBase.map(attach)),
    Promise.all(addOnBase.map(attach)),
  ]);

  return { primary, addOns };
}

export async function listActiveCities() {
  return db.cities.active();
}

export async function getServiceBySlug(slug: string) {
  return db.services.bySlug(slug);
}
