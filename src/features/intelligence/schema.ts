import type { SneakerFeedItem, SneakerFeedResult } from '@/features/intelligence/types';

const SITE_URL = 'https://www.shoeglitch.com';

export const INTELLIGENCE_FAQS = [
  {
    question: 'What makes a sneaker worth cleaning quickly after release?',
    shortAnswer: 'Light uppers, mesh, suede, and visible midsoles create the fastest cleaning demand.',
    answer:
      'Pairs with light uppers, textured materials, and exposed midsoles show wear quickly and are easier to map to a cleaning service CTA. The feed highlights those pairs so Shoe Glitch can turn release interest into service bookings.',
  },
  {
    question: 'What makes a pair restoration-worthy instead of just cleanable?',
    shortAnswer: 'Collector lean, premium materials, and age push a pair toward restoration value.',
    answer:
      'Restoration scores rise when a pair has premium materials, collector behavior, or enough age that touch-up, repaint, or deeper work makes sense. Cleaning is the default; restoration is for pairs with stronger long-tail value.',
  },
  {
    question: 'How should I read market strength if resale data is incomplete?',
    shortAnswer: 'Treat early market values as directional until stronger pricing confidence comes in.',
    answer:
      'When live market inputs are thin, market strength should be read as a ranking hint for what to watch next, not a guarantee. Confidence scores make that explicit and keep weaker data from pretending to be more certain than it is.',
  },
];

export function buildFeedSchemas(feed: SneakerFeedResult) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Sneaker Intelligence Feed',
      url: `${SITE_URL}/intelligence`,
      description:
        'Upcoming releases, cleaning and restoration opportunity scoring, market and collector signals, and actionable Shoe Glitch CTAs.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: feed.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/intelligence/${item.slug}`,
        name: item.name,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: INTELLIGENCE_FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ];
}

export function buildSneakerDetailSchemas(item: SneakerFeedItem) {
  const serviceAction =
    item.scores.restoration >= item.scores.cleaning
      ? { label: 'Restore this pair', href: `${SITE_URL}/book?intent=restoration&pair=${item.slug}` }
      : { label: 'Book cleaning', href: `${SITE_URL}/book?intent=cleaning&pair=${item.slug}` };

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: item.name,
      brand: {
        '@type': 'Brand',
        name: item.brand,
      },
      sku: item.sku,
      image: [`${SITE_URL}${item.media.thumbnailUrl}`],
      description: item.description,
      releaseDate: item.release.date,
      offers: {
        '@type': 'Offer',
        priceCurrency: item.release.currency,
        price: item.release.retailPrice,
        availability: 'https://schema.org/PreOrder',
        url: `${SITE_URL}/intelligence/${item.slug}`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: serviceAction.label,
      provider: {
        '@type': 'Organization',
        name: 'Shoe Glitch',
        url: SITE_URL,
      },
      areaServed: 'United States',
      description: `Service opportunity for ${item.name}: cleaning score ${item.scores.cleaning}, restoration score ${item.scores.restoration}.`,
      offers: {
        '@type': 'Offer',
        url: serviceAction.href,
        priceCurrency: 'USD',
      },
    },
  ];
}
