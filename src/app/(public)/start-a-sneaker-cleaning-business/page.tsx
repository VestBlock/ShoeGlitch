import type { Metadata } from 'next';
import OperatorSeoLandingPage from '@/components/operator-seo/OperatorSeoLandingPage';
import {
  buildOperatorMetadata,
  buildStartSneakerCleaningBusinessPageModel,
} from '@/features/operator-seo/content';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const model = await buildStartSneakerCleaningBusinessPageModel();
  return buildOperatorMetadata(model);
}

export default async function StartSneakerCleaningBusinessPage() {
  const model = await buildStartSneakerCleaningBusinessPageModel();
  return <OperatorSeoLandingPage model={model} />;
}
