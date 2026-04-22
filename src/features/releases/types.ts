import type { SneakerFeedItem } from '@/features/intelligence/types';

export interface ReleaseEditorialBlock {
  title: string;
  paragraphs: string[];
}

export interface ReleaseEditorialEnrichment {
  status: 'unreviewed' | 'draft' | 'reviewed';
  reviewNote: string;
  lastReviewedAt?: string;
  historyOfSilhouette?: ReleaseEditorialBlock;
  culturalContext?: ReleaseEditorialBlock;
  designerNotes?: ReleaseEditorialBlock;
  releaseSignificance?: ReleaseEditorialBlock;
}

export interface ReleaseLink {
  href: string;
  label: string;
  description: string;
}

export interface ReleaseFaq {
  question: string;
  shortAnswer: string;
  answer: string;
}

export interface ReleaseRecommendation {
  eyebrow: string;
  headline: string;
  body: string;
  bullets: string[];
}

export interface ReleasePageModel {
  path: string;
  canonicalUrl: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  aiSummary: string;
  summaryBullets: string[];
  item: SneakerFeedItem;
  recommendation: ReleaseRecommendation;
  faqs: ReleaseFaq[];
  buyingLinks: ReleaseLink[];
  relatedLinks: ReleaseLink[];
  editorial: ReleaseEditorialEnrichment;
}

export interface ReleaseAutomationCounts {
  releasePages: number;
  worthRestoringPages: number;
  howToCleanPages: number;
  releaseAlertPages: number;
  total: number;
}
