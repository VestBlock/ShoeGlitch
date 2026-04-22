import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import WorthRestoringLandingPage from '@/components/releases/WorthRestoringLandingPage';
import { buildWorthRestoringMetadata, buildWorthRestoringPageModel, getWorthRestoringRouteIndex } from '@/features/releases/restoration-content';

export const revalidate = 3600;

export async function generateStaticParams() {
  const routes = await getWorthRestoringRouteIndex();
  return routes.map((route) => ({
    slug: route.path.replace('/worth-restoring/', ''),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildWorthRestoringMetadata(slug);
}

export default async function WorthRestoringPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await buildWorthRestoringPageModel(slug);
  if (!model) notFound();
  return <WorthRestoringLandingPage model={model} />;
}
