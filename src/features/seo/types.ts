import type { City, ServiceArea } from '@/types';
import type { Metadata } from 'next';

export type SeoServiceSlug = 'sneaker-cleaning' | 'shoe-restoration' | 'pickup-dropoff';
export type SeoPageKind =
  | 'service-city'
  | 'service-area'
  | 'city-hub'
  | 'locations-index'
  | 'service-hub'
  | 'service-near-me';

export interface SeoServiceTemplate {
  slug: SeoServiceSlug;
  name: string;
  shortName: string;
  heroKicker: string;
  metaTerm: string;
  cityIntentLabel: string;
  summaryLine: string;
  ctaPrimaryHref: string;
  ctaPrimaryLabel: string;
  ctaSecondaryHref: string;
  ctaSecondaryLabel: string;
}

export interface SeoFaq {
  question: string;
  shortAnswer: string;
  answer: string;
}

export interface SeoSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface SeoLinkSuggestion {
  href: string;
  label: string;
  description: string;
}

export interface SeoCtaBlock {
  eyebrow: string;
  headline: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

export interface SeoPageModel {
  kind: Extract<SeoPageKind, 'service-city' | 'service-area' | 'city-hub'>;
  path: string;
  canonicalUrl: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  quickAnswer: string;
  summaryBullets: string[];
  sections: SeoSection[];
  faqs: SeoFaq[];
  cta: SeoCtaBlock;
  links: SeoLinkSuggestion[];
  city: City;
  serviceAreas: ServiceArea[];
  service?: SeoServiceTemplate;
}

export interface SeoServiceHubModel {
  kind: 'service-hub' | 'service-near-me';
  path: string;
  canonicalUrl: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  quickAnswer: string;
  summaryBullets: string[];
  sections: SeoSection[];
  faqs: SeoFaq[];
  cta: SeoCtaBlock;
  links: SeoLinkSuggestion[];
  service: SeoServiceTemplate;
  featuredCities: City[];
}

export interface SeoLocationsIndexModel {
  kind: 'locations-index';
  path: string;
  canonicalUrl: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  quickAnswer: string;
  summaryBullets: string[];
  sections: SeoSection[];
  faqs: SeoFaq[];
  cta: SeoCtaBlock;
  links: SeoLinkSuggestion[];
  featuredCities: City[];
}

export type SeoMetadataBuilder = (model: SeoPageModel) => Metadata;
