import { getActiveSeoCities } from '@/features/seo/data';

export async function getOperatorSeoCityParams() {
  const cities = await getActiveSeoCities();
  return cities.map((city) => ({ city: city.slug }));
}

export async function getOperatorSeoRouteIndex(): Promise<string[]> {
  const cities = await getActiveSeoCities();
  const routes = new Set<string>([
    '/operators',
    '/become-an-operator',
    '/start-a-sneaker-cleaning-business',
    '/shoe-restoration-side-hustle',
  ]);

  for (const city of cities) {
    routes.add(`/operator-opportunities/${city.slug}`);
    routes.add(`/pickup-dropoff-operator/${city.slug}`);
  }

  return [...routes];
}
