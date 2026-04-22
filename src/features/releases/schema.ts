import { SITE_URL } from '@/features/seo/catalog';
import type { ReleasePageModel } from '@/features/releases/types';

function positiveOrNull(value: number | null | undefined) {
  if (value == null || value <= 0) return null;
  return value;
}

function availabilitySchemaLabel(status: string) {
  if (status === 'upcoming') return 'https://schema.org/PreOrder';
  if (status === 'released' || status === 'watch-worthy') return 'https://schema.org/InStock';
  return 'https://schema.org/LimitedAvailability';
}

export function buildReleaseSchemas(model: ReleasePageModel) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Releases',
        item: `${SITE_URL}/intelligence`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: model.item.name,
        item: model.canonicalUrl,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: model.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: model.item.name,
    brand: {
      '@type': 'Brand',
      name: model.item.brand,
    },
    sku: model.item.sku,
    image: [model.item.media.thumbnailUrl],
    description: model.description,
    category: model.item.category,
    color: model.item.colorway || undefined,
    releaseDate: model.item.release.date,
    offers: {
      '@type': 'Offer',
      url: model.item.marketUrl ?? `${SITE_URL}${model.path}`,
      priceCurrency: model.item.priceSummary.currency ?? 'USD',
      price: positiveOrNull(
        model.item.priceSummary.lowestAsk ??
          model.item.priceSummary.averagePrice ??
          model.item.priceSummary.retailPrice ??
          model.item.release.retailPrice,
      ),
      availability: availabilitySchemaLabel(model.item.availability),
    },
    aggregateRating:
      model.item.scores.confidence >= 55
        ? {
            '@type': 'AggregateRating',
            ratingValue: (model.item.scores.marketStrength / 20).toFixed(1),
            bestRating: '5',
            worstRating: '1',
            ratingCount: Math.max(1, model.item.sizes.length),
          }
        : undefined,
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: model.title,
    description: model.description,
    url: model.canonicalUrl,
    about: {
      '@type': 'Thing',
      name: model.item.name,
    },
  };

  return [breadcrumbSchema, faqSchema, productSchema, webPageSchema];
}
