import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalLandingPage from '@/components/seo/LocalLandingPage';
import { buildCityHubPageModel, buildSeoMetadata } from '@/features/seo/content';
import { getSeoCityParams } from '@/features/seo/routes';

export const revalidate = 86400;

export async function generateStaticParams() {
  return getSeoCityParams();
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const model = await buildCityHubPageModel(params.city);
  return model ? buildSeoMetadata(model) : {};
}

export default async function CityLocationPage({
  params,
}: {
  params: { city: string };
}) {
  const model = await buildCityHubPageModel(params.city);
  if (!model) notFound();

  return <LocalLandingPage model={model} />;
}
