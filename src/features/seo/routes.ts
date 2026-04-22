import { seoServiceSlugs } from '@/features/seo/catalog';
import { getActiveSeoCities, getSeoServiceAreasByCity } from '@/features/seo/data';

export function slugifyServiceArea(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export async function getSeoCityParams() {
  const cities = await getActiveSeoCities();
  return cities.map((city) => ({ city: city.slug }));
}

export async function getSeoServiceAreaParams() {
  const cities = await getActiveSeoCities();
  const pairs = await Promise.all(
    cities.map(async (city) => {
      const areas = await getSeoServiceAreasByCity(city.id);
      return areas.map((area) => ({
        city: city.slug,
        area: slugifyServiceArea(area.name),
      }));
    }),
  );

  return pairs.flat();
}

export async function getSeoRouteIndex(): Promise<string[]> {
  const cities = await getActiveSeoCities();
  const routes = new Set<string>();

  routes.add('/locations');

  for (const serviceSlug of seoServiceSlugs) {
    routes.add(`/${serviceSlug}`);
    routes.add(`/${serviceSlug}/near-me`);
  }

  for (const city of cities) {
    routes.add(`/locations/${city.slug}`);

    const serviceAreas = await getSeoServiceAreasByCity(city.id);
    for (const serviceSlug of seoServiceSlugs) {
      routes.add(`/${serviceSlug}/${city.slug}`);
      for (const area of serviceAreas) {
        routes.add(`/${serviceSlug}/${city.slug}/${slugifyServiceArea(area.name)}`);
      }
    }
  }

  return [...routes];
}
