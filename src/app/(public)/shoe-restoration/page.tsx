import type { Metadata } from 'next';
import ServiceHubLandingPage from '@/components/seo/ServiceHubLandingPage';
import { buildServiceHubMetadata, buildServiceHubPageModel } from '@/features/seo/content';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const model = await buildServiceHubPageModel('shoe-restoration');
  return buildServiceHubMetadata(model);
}

export default async function ShoeRestorationHubPage() {
  const model = await buildServiceHubPageModel('shoe-restoration');
  return <ServiceHubLandingPage model={model} />;
}
