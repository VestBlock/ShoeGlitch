import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReleaseLandingPage from '@/components/releases/ReleaseLandingPage';
import { buildReleaseMetadata, buildReleasePageModel, getReleaseRouteIndex } from '@/features/releases/content';

export const revalidate = 3600;

export async function generateStaticParams() {
  const routes = await getReleaseRouteIndex();
  return routes.map((route) => ({
    slug: route.path.replace('/releases/', ''),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildReleaseMetadata(slug);
}

export default async function ReleaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await buildReleasePageModel(slug);

  if (!model) notFound();

  return <ReleaseLandingPage model={model} />;
}
