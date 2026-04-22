import type { Metadata } from 'next';
import OperatorSeoLandingPage from '@/components/operator-seo/OperatorSeoLandingPage';
import { buildBecomeOperatorPageModel, buildOperatorMetadata } from '@/features/operator-seo/content';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const model = await buildBecomeOperatorPageModel();
  return buildOperatorMetadata(model);
}

export default async function BecomeOperatorPage() {
  const model = await buildBecomeOperatorPageModel();
  return <OperatorSeoLandingPage model={model} />;
}
