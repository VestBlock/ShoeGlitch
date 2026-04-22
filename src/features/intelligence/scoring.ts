import type { MarketplacePriceSnapshot, ScoreRecord, SneakerFeedItem } from '@/features/intelligence/types';

interface ScoreInput {
  releaseDate: string;
  retailPrice: number;
  market: MarketplacePriceSnapshot;
  materials: string[];
  opportunityFlags: SneakerFeedItem['opportunityFlags'];
  sourceType: SneakerFeedItem['sourceType'];
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function daysUntil(date: string, now: Date) {
  return Math.round((new Date(date).getTime() - now.getTime()) / 86400000);
}

export function computeCleaningScore(input: ScoreInput) {
  const { materials, opportunityFlags } = input;
  let score = 36;

  if (materials.some((material) => ['white-upper', 'cream-upper', 'light-upper'].includes(material))) score += 22;
  if (materials.some((material) => ['mesh', 'suede', 'nubuck'].includes(material))) score += 18;
  if (materials.includes('gum-sole')) score += 7;
  if (opportunityFlags.includes('cleaning')) score += 12;

  return clamp(score);
}

export function computeRestorationScore(input: ScoreInput, now: Date) {
  const { materials, opportunityFlags } = input;
  const releaseAge = Math.max(0, -daysUntil(input.releaseDate, now));
  let score = 28;

  if (materials.some((material) => ['leather', 'suede', 'nubuck'].includes(material))) score += 16;
  if (materials.includes('collector-lean')) score += 14;
  if (releaseAge > 120) score += 14;
  if (releaseAge > 365) score += 8;
  if (opportunityFlags.includes('restoration')) score += 12;

  return clamp(score);
}

export function computeFlipPotential(input: ScoreInput) {
  const { market, retailPrice, sourceType, opportunityFlags } = input;
  const estimate = market.estimatedResale ?? market.lowAsk ?? market.lastSale ?? null;
  const spread = estimate ? estimate - retailPrice : 0;
  const spreadRatio = retailPrice > 0 ? spread / retailPrice : 0;

  let score = 26 + spreadRatio * 95;
  if (opportunityFlags.includes('flip')) score += 12;
  if (sourceType === 'snapshot') score += 8;
  if (market.isPlaceholder) score -= 10;

  return clamp(score);
}

export function computeUrgency(input: ScoreInput, now: Date) {
  const distance = daysUntil(input.releaseDate, now);
  let score = 24;

  if (distance <= 2) score = 95;
  else if (distance <= 7) score = 86;
  else if (distance <= 14) score = 74;
  else if (distance <= 30) score = 62;
  else if (distance <= 60) score = 48;
  else if (distance < 0) score = 38;

  if (input.opportunityFlags.includes('upcoming')) score += 6;

  return clamp(score);
}

export function buildScoreRecord(input: ScoreInput, now: Date): ScoreRecord {
  const cleaning = computeCleaningScore(input);
  const restoration = computeRestorationScore(input, now);
  const flipPotential = computeFlipPotential(input);
  const urgency = computeUrgency(input, now);

  let confidence = 60;
  if (input.sourceType === 'snapshot') confidence += 14;
  if (!input.market.isPlaceholder) confidence += 12;
  if (input.market.estimatedResale || input.market.lowAsk || input.market.lastSale) confidence += 8;

  return {
    cleaning,
    restoration,
    flipPotential,
    urgency,
    confidence: clamp(confidence),
  };
}
