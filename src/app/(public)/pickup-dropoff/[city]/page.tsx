import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalLandingPage from '@/components/seo/LocalLandingPage';
import ServiceHubLandingPage from '@/components/seo/ServiceHubLandingPage';
import { buildSeoMetadata, buildServiceCityPageModel, buildServiceHubMetadata, buildServiceNearMePageModel } from '@/features/seo/content';
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
  if (params.city === 'near-me') {
    const model = await buildServiceNearMePageModel('pickup-dropoff');
    return buildServiceHubMetadata(model);
  }

  const model = await buildServiceCityPageModel('pickup-dropoff', params.city);
  return model ? buildSeoMetadata(model) : {};
}

export default async function PickupDropoffCityPage({
  params,
}: {
  params: { city: string };
}) {
  if (params.city === 'near-me') {
    const model = await buildServiceNearMePageModel('pickup-dropoff');
    return <ServiceHubLandingPage model={model} />;
  }

  const model = await buildServiceCityPageModel('pickup-dropoff', params.city);
  if (!model) notFound();

  return <LocalLandingPage model={model} />;
}
