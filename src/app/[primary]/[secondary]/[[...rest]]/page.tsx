import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SeoLandingPage from '@/components/growth/SeoLandingPage';
import { buildGrowthRouteIndex, findGrowthRoute } from '@/lib/growth/catalog';
import { resolveGrowthContent } from '@/lib/growth/content-generator';
import { suggestGrowthLinks } from '@/lib/growth/internal-links';

type RouteParams = {
  primary: string;
  secondary: string;
  rest?: string[];
};

function resolveSpec(params: RouteParams) {
  return findGrowthRoute(params.primary, params.secondary, params.rest ?? []);
}

export async function generateStaticParams() {
  return buildGrowthRouteIndex().map((spec) => ({
    primary: spec.primary,
    secondary: spec.secondary,
    rest: spec.rest.length ? spec.rest : undefined,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const spec = resolveSpec(params);
  if (!spec) {
    return {};
  }

  const content = await resolveGrowthContent(spec);

  return {
    title: content.title,
    description: content.metaDescription,
    alternates: {
      canonical: spec.path,
    },
    openGraph: {
      title: content.title,
      description: content.metaDescription,
      url: spec.path,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.metaDescription,
    },
  };
}

export default async function GrowthRoutePage({
  params,
}: {
  params: RouteParams;
}) {
  const spec = resolveSpec(params);
  if (!spec) {
    notFound();
  }

  const content = await resolveGrowthContent(spec);
  const relatedLinks = suggestGrowthLinks(spec);

  return <SeoLandingPage spec={spec} content={content} relatedLinks={relatedLinks} />;
}
