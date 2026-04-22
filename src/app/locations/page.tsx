import type { Metadata } from 'next';
import LocationsIndexLandingPage from '@/components/seo/LocationsIndexLandingPage';
import { buildLocationsIndexMetadata, buildLocationsIndexPageModel } from '@/features/seo/content';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const model = await buildLocationsIndexPageModel();
  return buildLocationsIndexMetadata(model);
}

export default async function LocationsIndexPage() {
  const model = await buildLocationsIndexPageModel();
  return <LocationsIndexLandingPage model={model} />;
}
