import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReleaseAlertsLandingPage from '@/components/releases/ReleaseAlertsLandingPage';
import { buildReleaseAlertsMetadata, buildReleaseAlertsPageModel, getReleaseAlertsRouteIndex } from '@/features/releases/alerts-content';

export const revalidate = 3600;

export async function generateStaticParams() {
  const routes = await getReleaseAlertsRouteIndex();
  return routes.map((route) => ({
    slug: route.path.replace('/release-alerts/', ''),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildReleaseAlertsMetadata(slug);
}

export default async function ReleaseAlertsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await buildReleaseAlertsPageModel(slug);
  if (!model) notFound();
  return <ReleaseAlertsLandingPage model={model} />;
}
