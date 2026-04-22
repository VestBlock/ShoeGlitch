import { SITE_URL } from '@/features/operator-seo/catalog';
import type { OperatorSeoModel } from '@/features/operator-seo/types';

export function buildOperatorSeoSchemas(model: OperatorSeoModel) {
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
        name:
          model.kind === 'operators-index'
            ? 'Operators'
            : model.kind === 'become-operator'
              ? 'Become an operator'
              : model.kind === 'business-guide'
                ? 'Start a sneaker cleaning business'
                : model.kind === 'side-hustle-guide'
                  ? 'Shoe restoration side hustle'
                  : model.city
                    ? model.city.name
                    : model.h1,
        item:
          model.kind === 'operators-index'
            ? `${SITE_URL}/operators`
            : model.kind === 'become-operator'
              ? `${SITE_URL}/become-an-operator`
              : model.kind === 'business-guide'
                ? `${SITE_URL}/start-a-sneaker-cleaning-business`
                : model.kind === 'side-hustle-guide'
                  ? `${SITE_URL}/shoe-restoration-side-hustle`
                  : model.canonicalUrl,
      },
      ...(model.kind === 'operator-city' || model.kind === 'pickup-operator-city'
        ? [
            {
              '@type': 'ListItem',
              position: 3,
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

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shoe Glitch',
    url: SITE_URL,
    image: `${SITE_URL}/ShoeTest-poster.png`,
    description: model.description,
    areaServed:
      model.city != null
        ? [`${model.city.name}, ${model.city.state}`]
        : model.featuredCities.map((city) => `${city.name}, ${city.state}`),
  };

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: model.h1,
    url: model.canonicalUrl,
    description: model.quickAnswer,
    about: model.role ? model.role : 'operator opportunity',
  };

  return [breadcrumbSchema, faqSchema, organizationSchema, webpageSchema];
}
