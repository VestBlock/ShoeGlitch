import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OperatorSeoLandingPage from '@/components/operator-seo/OperatorSeoLandingPage';
import {
  buildOperatorMetadata,
  buildPickupDropoffOperatorCityPageModel,
} from '@/features/operator-seo/content';
import { getOperatorSeoCityParams } from '@/features/operator-seo/routes';

export const revalidate = 86400;

export async function generateStaticParams() {
  return getOperatorSeoCityParams();
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const model = await buildPickupDropoffOperatorCityPageModel(params.city);
  return model ? buildOperatorMetadata(model) : {};
}

export default async function PickupDropoffOperatorCityPage({
  params,
}: {
  params: { city: string };
}) {
  const model = await buildPickupDropoffOperatorCityPageModel(params.city);
  if (!model) notFound();

  return <OperatorSeoLandingPage model={model} />;
}
