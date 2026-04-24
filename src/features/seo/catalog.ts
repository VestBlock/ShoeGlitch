import type { SeoServiceSlug, SeoServiceTemplate } from '@/features/seo/types';

export const SITE_URL = 'https://www.shoeglitch.com';

const SERVICE_TEMPLATES: Record<SeoServiceSlug, SeoServiceTemplate> = {
  'sneaker-cleaning': {
    slug: 'sneaker-cleaning',
    name: 'Sneaker Cleaning',
    shortName: 'Cleaning',
    heroKicker: 'Local sneaker cleaning',
    metaTerm: 'sneaker cleaning service',
    cityIntentLabel: 'premium sneaker cleaning',
    summaryLine: 'tracked intake, city coverage, a clear Basic/Pro/Elite menu, and a fast booking path',
    ctaPrimaryHref: '/book',
    ctaPrimaryLabel: 'Start your order',
    ctaSecondaryHref: '/coverage',
    ctaSecondaryLabel: 'Check your coverage',
  },
  'shoe-restoration': {
    slug: 'shoe-restoration',
    name: 'Shoe Restoration',
    shortName: 'Restoration',
    heroKicker: 'Local shoe restoration',
    metaTerm: 'shoe restoration service',
    cityIntentLabel: 'restoration and repair',
    summaryLine: 'restoration-first recommendations, full-tier service context, and booking-ready next steps',
    ctaPrimaryHref: '/book',
    ctaPrimaryLabel: 'Book restoration',
    ctaSecondaryHref: '/services',
    ctaSecondaryLabel: 'Compare services',
  },
  'pickup-dropoff': {
    slug: 'pickup-dropoff',
    name: 'Pickup & Drop-Off',
    shortName: 'Pickup & Drop-Off',
    heroKicker: 'Local pickup and drop-off',
    metaTerm: 'shoe pickup and drop-off',
    cityIntentLabel: 'pickup, drop-off, and mail-in logistics',
    summaryLine: 'coverage-driven fulfillment with less friction before booking',
    ctaPrimaryHref: '/coverage',
    ctaPrimaryLabel: 'Check your coverage',
    ctaSecondaryHref: '/book',
    ctaSecondaryLabel: 'Book now',
  },
};

export const seoServiceSlugs = Object.keys(SERVICE_TEMPLATES) as SeoServiceSlug[];

export function getSeoServiceTemplate(slug: SeoServiceSlug): SeoServiceTemplate {
  return SERVICE_TEMPLATES[slug];
}

export function listSeoServiceTemplates(): SeoServiceTemplate[] {
  return seoServiceSlugs.map((slug) => SERVICE_TEMPLATES[slug]);
}
