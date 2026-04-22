import type { Metadata } from 'next';
import OperatorSeoLandingPage from '@/components/operator-seo/OperatorSeoLandingPage';
import {
  buildOperatorMetadata,
  buildShoeRestorationSideHustlePageModel,
} from '@/features/operator-seo/content';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const model = await buildShoeRestorationSideHustlePageModel();
  return buildOperatorMetadata(model);
}

export default async function ShoeRestorationSideHustlePage() {
  const model = await buildShoeRestorationSideHustlePageModel();
  return <OperatorSeoLandingPage model={model} />;
}
