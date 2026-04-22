import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalLandingPage from '@/components/seo/LocalLandingPage';
import { buildSeoMetadata, buildServiceAreaPageModel } from '@/features/seo/content';
import { getSeoServiceAreaParams } from '@/features/seo/routes';

export const revalidate = 86400;

export async function generateStaticParams() {
  return getSeoServiceAreaParams();
}

export async function generateMetadata({
  params,
}: {
  params: { city: string; area: string };
}): Promise<Metadata> {
  const model = await buildServiceAreaPageModel('pickup-dropoff', params.city, params.area);
  return model ? buildSeoMetadata(model) : {};
}

export default async function PickupDropoffAreaPage({
  params,
}: {
  params: { city: string; area: string };
}) {
  const model = await buildServiceAreaPageModel('pickup-dropoff', params.city, params.area);
  if (!model) notFound();

  return <LocalLandingPage model={model} />;
}
