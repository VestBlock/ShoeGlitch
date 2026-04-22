import type { GrowthPageContent, GrowthRouteSpec } from '@/lib/growth/types';

const SITE_URL = 'https://www.shoeglitch.com';

export function buildGrowthSchemas(spec: GrowthRouteSpec, content: GrowthPageContent) {
  const canonicalUrl = `${SITE_URL}${spec.path}`;
  const localArea = spec.neighborhood
    ? `${spec.neighborhood.name}, ${spec.location.city}, ${spec.location.state}`
    : `${spec.location.city}, ${spec.location.state}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to book ${content.h1}`,
    description: content.quickAnswer,
    step: content.howToSteps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Shoe Glitch',
    url: canonicalUrl,
    image: `${SITE_URL}/ShoeTest-poster.png`,
    description: content.metaDescription,
    areaServed: [localArea],
    serviceArea: {
      '@type': 'Place',
      name: localArea,
    },
    sameAs: [SITE_URL],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: spec.category?.serviceName ?? spec.service?.name ?? content.h1,
    serviceType: spec.category?.slug ?? spec.service?.slug ?? spec.primary,
    provider: {
      '@type': 'Organization',
      name: 'Shoe Glitch',
      url: SITE_URL,
    },
    areaServed: localArea,
    description: content.quickAnswer,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/book`,
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD',
        valueAddedTaxIncluded: false,
      },
    },
  };

  return [faqSchema, howToSchema, localBusinessSchema, serviceSchema];
}
