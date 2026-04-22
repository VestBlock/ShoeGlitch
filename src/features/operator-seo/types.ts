import type { City } from '@/types';
import type { Metadata } from 'next';

export type OperatorRoleSlug = 'cleaning' | 'restoration' | 'pickup-dropoff';

export type OperatorSeoPageKind =
  | 'operators-index'
  | 'become-operator'
  | 'operator-city'
  | 'pickup-operator-city'
  | 'business-guide'
  | 'side-hustle-guide';

export interface OperatorSeoFaq {
  question: string;
  shortAnswer: string;
  answer: string;
}

export interface OperatorSeoSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface OperatorSeoLinkSuggestion {
  href: string;
  label: string;
  description: string;
}

export interface OperatorSeoCtaBlock {
  eyebrow: string;
  headline: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

export interface OperatorSeoLeadField {
  label: string;
  helper: string;
  live: boolean;
}

export interface OperatorSeoModel {
  kind: OperatorSeoPageKind;
  path: string;
  canonicalUrl: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  quickAnswer: string;
  summaryBullets: string[];
  whoItsFor: string[];
  whatOperatorsDo: string[];
  whatShoeGlitchProvides: string[];
  operatorResponsibilities: string[];
  sections: OperatorSeoSection[];
  faqs: OperatorSeoFaq[];
  cta: OperatorSeoCtaBlock;
  links: OperatorSeoLinkSuggestion[];
  leadFields: OperatorSeoLeadField[];
  featuredCities: City[];
  city?: City;
  role?: OperatorRoleSlug;
  territorySummary?: string;
  earningsFrame?: string;
}

export type OperatorSeoMetadataBuilder = (model: OperatorSeoModel) => Metadata;
