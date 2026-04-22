import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import HowToCleanLandingPage from '@/components/releases/HowToCleanLandingPage';
import { buildHowToCleanMetadata, buildHowToCleanPageModel, getHowToCleanRouteIndex } from '@/features/releases/cleaning-content';

export const revalidate = 3600;

export async function generateStaticParams() {
  const routes = await getHowToCleanRouteIndex();
  return routes.map((route) => ({
    slug: route.path.replace('/how-to-clean/', ''),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildHowToCleanMetadata(slug);
}

export default async function HowToCleanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await buildHowToCleanPageModel(slug);
  if (!model) notFound();
  return <HowToCleanLandingPage model={model} />;
}
