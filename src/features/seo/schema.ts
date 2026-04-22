import { SITE_URL } from '@/features/seo/catalog';
import type { SeoLocationsIndexModel, SeoPageModel, SeoServiceHubModel } from '@/features/seo/types';

export function buildSeoSchemas(model: SeoPageModel) {
  const cityLabel = `${model.city.name}, ${model.city.state}`;
  const areaServedName = model.kind === 'service-area' && model.serviceAreas[0] ? `${model.serviceAreas[0].name}, ${cityLabel}` : cityLabel;

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
        name: model.kind === 'city-hub' ? 'Locations' : model.service?.name ?? 'Service',
        item:
          model.kind === 'city-hub'
            ? `${SITE_URL}/locations`
            : `${SITE_URL}/${model.service?.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: model.kind === 'service-area' ? model.city.name : model.h1,
        item:
          model.kind === 'service-area'
            ? `${SITE_URL}/${model.service?.slug}/${model.city.slug}`
            : model.canonicalUrl,
      },
      ...(model.kind === 'service-area'
        ? [
            {
              '@type': 'ListItem',
              position: 4,
              name: model.h1,
              item: model.canonicalUrl,
            },
          ]
        : []),
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

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Shoe Glitch',
    url: model.canonicalUrl,
    image: `${SITE_URL}/ShoeTest-poster.png`,
    description: model.description,
    areaServed: [areaServedName],
    serviceArea: {
      '@type': 'Place',
      name: areaServedName,
    },
  };

  const serviceSchema =
    model.service
      ? {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: model.service.name,
          serviceType: model.service.slug,
          provider: {
            '@type': 'Organization',
            name: 'Shoe Glitch',
            url: SITE_URL,
          },
          areaServed: areaServedName,
          description: model.quickAnswer,
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}${model.cta.primaryHref}`,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        }
      : null;

  return [breadcrumbSchema, faqSchema, localBusinessSchema, serviceSchema].filter(Boolean);
}

export function buildServiceHubSchemas(model: SeoServiceHubModel) {
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
        name: model.service.name,
        item: `${SITE_URL}/${model.service.slug}`,
      },
      ...(model.kind === 'service-near-me'
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: `${model.service.name} near me`,
              item: model.canonicalUrl,
            },
          ]
        : []),
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

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: model.service.name,
    serviceType: model.service.slug,
    provider: {
      '@type': 'Organization',
      name: 'Shoe Glitch',
      url: SITE_URL,
    },
    areaServed: model.featuredCities.map((city) => `${city.name}, ${city.state}`),
    description: model.quickAnswer,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}${model.cta.primaryHref}`,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  return [breadcrumbSchema, faqSchema, serviceSchema];
}

export function buildLocationsIndexSchemas(model: SeoLocationsIndexModel) {
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
        name: model.h1,
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

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shoe Glitch',
    url: SITE_URL,
    image: `${SITE_URL}/ShoeTest-poster.png`,
    description: model.description,
    areaServed: model.featuredCities.map((city) => `${city.name}, ${city.state}`),
  };

  return [breadcrumbSchema, faqSchema, organizationSchema];
}
