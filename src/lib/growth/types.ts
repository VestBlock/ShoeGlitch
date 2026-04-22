export type GrowthIntent = 'informational' | 'commercial' | 'transactional';

export type GrowthRouteKind =
  | 'programmatic'
  | 'service-city'
  | 'service-near-me'
  | 'service-neighborhood';

export interface GrowthLocationSeed {
  city: string;
  state: string;
  slug: string;
  neighborhoods: Array<{
    name: string;
    slug: string;
  }>;
}

export interface GrowthCategorySeed {
  slug: string;
  niche: string;
  serviceName: string;
  enabled: boolean;
  commercialOffer: string;
}

export interface GrowthKeywordSeed {
  slug: string;
  keyword: string;
  intent: GrowthIntent;
  niche: string;
  commercialAngle: string;
  problem: string;
}

export interface GrowthServiceSeed {
  slug: string;
  name: string;
  offer: string;
  nearMeLabel: string;
}

export interface GrowthRouteSpec {
  kind: GrowthRouteKind;
  path: string;
  primary: string;
  secondary: string;
  rest: string[];
  category?: GrowthCategorySeed;
  keyword?: GrowthKeywordSeed;
  service?: GrowthServiceSeed;
  location: GrowthLocationSeed;
  neighborhood?: {
    name: string;
    slug: string;
  };
  intent: GrowthIntent;
}

export interface GrowthFaq {
  question: string;
  shortAnswer: string;
  answer: string;
}

export interface GrowthSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GrowthCtaBlock {
  eyebrow: string;
  headline: string;
  body: string;
  offer: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

export interface GrowthHowToStep {
  name: string;
  text: string;
}

export interface GrowthPageContent {
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  quickAnswer: string;
  longAnswer: string;
  summaryBullets: string[];
  sections: GrowthSection[];
  faqs: GrowthFaq[];
  cta: GrowthCtaBlock;
  howToSteps: GrowthHowToStep[];
}

export interface GrowthLinkSuggestion {
  href: string;
  label: string;
  reason: string;
}

export interface PersistedGrowthPageRecord {
  route_path: string;
  route_kind: GrowthRouteKind;
  category_slug: string | null;
  keyword_slug: string | null;
  service_slug: string | null;
  location_slug: string;
  neighborhood_slug: string | null;
  payload: GrowthPageContent;
  generated_at?: string;
  updated_at?: string;
}

export interface GrowthLeadPayload {
  routePath: string;
  offer: string;
  name?: string;
  email: string;
  phone?: string;
  zip?: string;
  notes?: string;
}

export interface GrowthEventPayload {
  routePath: string;
  eventName: string;
  ctaLabel?: string;
  metadata?: Record<string, unknown>;
}
