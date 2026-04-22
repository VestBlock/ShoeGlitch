import type { Metadata } from 'next';
import OperatorSeoLandingPage from '@/components/operator-seo/OperatorSeoLandingPage';
import { buildOperatorMetadata, buildOperatorsIndexPageModel } from '@/features/operator-seo/content';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const model = await buildOperatorsIndexPageModel();
  return buildOperatorMetadata(model);
}

export default async function OperatorsIndexPage() {
  const model = await buildOperatorsIndexPageModel();
  return <OperatorSeoLandingPage model={model} />;
}
