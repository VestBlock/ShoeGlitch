import type { City } from '@/types';
import { db } from '@/lib/db';

function preferMailInCity(cities: City[]) {
  return (
    cities.find((city) => city.slug === 'milwaukee' && city.active) ??
    cities.find((city) => city.active) ??
    cities[0] ??
    null
  );
}

export async function resolveNationalMailInCityId(requestedCityId?: string | null) {
  const cities = await db.cities.all();
  if (requestedCityId) {
    const requested = cities.find((city) => city.id === requestedCityId);
    if (requested?.active) return requested.id;
  }

  return preferMailInCity(cities)?.id ?? '';
}

export function resolveNationalMailInCity(cities: City[]) {
  return preferMailInCity(cities);
}
