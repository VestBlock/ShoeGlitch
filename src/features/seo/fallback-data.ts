import type { City, ServiceArea } from '@/types';

export const FALLBACK_SEO_CITIES: City[] = [
  {
    id: 'fallback-city-atlanta',
    name: 'Atlanta',
    slug: 'atlanta',
    state: 'GA',
    timezone: 'America/New_York',
    active: true,
    launchDate: '2026-01-01',
    defaultPickupFee: 0,
    defaultRushFee: 0,
    defaultMailInReturnFee: 0,
  },
  {
    id: 'fallback-city-memphis',
    name: 'Memphis',
    slug: 'memphis',
    state: 'TN',
    timezone: 'America/Chicago',
    active: true,
    launchDate: '2026-01-01',
    defaultPickupFee: 0,
    defaultRushFee: 0,
    defaultMailInReturnFee: 0,
  },
  {
    id: 'fallback-city-milwaukee',
    name: 'Milwaukee',
    slug: 'milwaukee',
    state: 'WI',
    timezone: 'America/Chicago',
    active: true,
    launchDate: '2026-01-01',
    defaultPickupFee: 0,
    defaultRushFee: 0,
    defaultMailInReturnFee: 0,
  },
];

const FALLBACK_SEO_SERVICE_AREAS_BY_CITY_SLUG: Record<string, string[]> = {
  atlanta: ['Buckhead', 'Midtown + Downtown'],
  memphis: ['East Memphis', 'Midtown Core'],
  milwaukee: ['Bay View / South Side', 'Downtown + East Side', 'North Shore', 'Wauwatosa / Brookfield'],
};

export function getFallbackSeoServiceAreasByCity(cityId: string): ServiceArea[] {
  const city = FALLBACK_SEO_CITIES.find((item) => item.id === cityId);
  if (!city) return [];

  return (FALLBACK_SEO_SERVICE_AREAS_BY_CITY_SLUG[city.slug] ?? []).map((name) => ({
    id: `fallback-area-${city.slug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    cityId: city.id,
    name,
    zips: [],
    active: true,
  }));
}
