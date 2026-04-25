import type { MarketplacePriceSnapshot, ScoreRecord, SneakerFeedItem } from '@/features/intelligence/types';

interface ScoreInput {
  releaseDate: string;
  retailPrice: number;
  market: MarketplacePriceSnapshot;
  materials: string[];
  opportunityFlags: SneakerFeedItem['opportunityFlags'];
  sourceType: SneakerFeedItem['sourceType'];
  weeklyOrders?: number | null;
  rank?: number | null;
  sizesCount?: number;
}

interface ReasonedScore {
  value: number;
  reasons: string[];
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function avg(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function daysUntil(date: string, now: Date) {
  return Math.round((new Date(date).getTime() - now.getTime()) / 86400000);
}

function countTraits(materials: string[], traits: string[]) {
  return traits.filter((trait) => materials.includes(trait)).length;
}

function hasAny(materials: string[], traits: string[]) {
  return traits.some((trait) => materials.includes(trait));
}

function pushReason(reasons: string[], condition: boolean, reason: string) {
  if (condition && !reasons.includes(reason)) reasons.push(reason);
}

function marketEstimate(market: MarketplacePriceSnapshot) {
  return market.estimatedResale ?? market.lowAsk ?? market.lastSale ?? 0;
}

function spreadRatio(input: ScoreInput) {
  const estimate = marketEstimate(input.market);
  if (!estimate || input.retailPrice <= 0) return 0;
  return (estimate - input.retailPrice) / input.retailPrice;
}

function buildCleaningScore(input: ScoreInput): ReasonedScore {
  const reasons: string[] = [];
  const texturedCount = countTraits(input.materials, ['mesh', 'suede', 'nubuck', 'canvas', 'knit', 'patent']);
  const rarityCount = countTraits(input.materials, ['collector-lean', 'collab-lean', 'limited-lean', 'premium-lean']);
  let score = 16;

  if (hasAny(input.materials, ['light-upper', 'cream-upper'])) score += 20;
  if (input.materials.includes('white-midsole')) score += 12;
  score += Math.min(texturedCount * 8, 24);
  if (hasAny(input.materials, ['runner-lean', 'daily-wear'])) score += 10;
  if (input.materials.includes('gum-sole')) score += 5;
  if (input.opportunityFlags.includes('cleaning')) score += 8;
  score -= rarityCount * 3;

  pushReason(reasons, hasAny(input.materials, ['light-upper', 'cream-upper']), 'light colorway shows dirt fast');
  pushReason(reasons, texturedCount > 0, 'texture-heavy upper benefits from care');
  pushReason(reasons, input.materials.includes('white-midsole'), 'visible midsole picks up wear quickly');
  pushReason(reasons, hasAny(input.materials, ['runner-lean', 'daily-wear']), 'daily-wear profile creates repeat cleaning demand');
  pushReason(reasons, rarityCount > 0, 'collector lean dampens aggressive cleaning calls');

  return { value: clamp(score), reasons: reasons.slice(0, 3) };
}

function buildRestorationScore(input: ScoreInput, now: Date): ReasonedScore {
  const reasons: string[] = [];
  const releaseAge = Math.max(0, -daysUntil(input.releaseDate, now));
  const rarityCount = countTraits(input.materials, ['collector-lean', 'collab-lean', 'limited-lean', 'premium-lean', 'retro-lean']);
  const premiumTextureCount = countTraits(input.materials, ['leather', 'suede', 'nubuck', 'patent']);
  const estimate = marketEstimate(input.market);
  let score = 16;

  score += Math.min(premiumTextureCount * 8, 24);
  score += Math.min(rarityCount * 10, 30);
  if (releaseAge > 180) score += 8;
  if (releaseAge > 365) score += 10;
  if (releaseAge > 730) score += 10;
  if (hasAny(input.materials, ['white-midsole', 'icy-sole', 'aged-sole'])) score += 10;
  if (estimate >= 350) score += 8;
  if (input.opportunityFlags.includes('restoration')) score += 8;

  pushReason(reasons, premiumTextureCount > 0, 'premium materials reward restoration work');
  pushReason(reasons, rarityCount > 0, 'collector rarity adds preservation value');
  pushReason(reasons, releaseAge > 365, 'older release increases restoration upside');
  pushReason(reasons, hasAny(input.materials, ['white-midsole', 'icy-sole', 'aged-sole']), 'sole aging raises restoration need');
  pushReason(reasons, estimate >= 350, 'higher market value supports deeper work');

  return { value: clamp(score), reasons: reasons.slice(0, 3) };
}

function buildMarketStrengthScore(input: ScoreInput): ReasonedScore {
  const reasons: string[] = [];
  const ratio = spreadRatio(input);
  const estimate = marketEstimate(input.market);
  let score = 18 + ratio * 72;

  score += Math.min((input.weeklyOrders ?? 0) * 0.35, 16);
  if ((input.rank ?? 99999) < 1000) score += 10;
  else if ((input.rank ?? 99999) < 2500) score += 6;
  if (!input.market.isPlaceholder) score += 8;
  if (estimate >= 300) score += 6;
  if (input.opportunityFlags.includes('flip')) score += 6;

  pushReason(reasons, ratio >= 0.25, 'strong retail-to-market spread');
  pushReason(reasons, (input.weeklyOrders ?? 0) >= 10, 'weekly order flow supports demand');
  pushReason(reasons, (input.rank ?? 99999) < 2500, 'market rank is still elevated');
  pushReason(reasons, !input.market.isPlaceholder, 'live market data is present');
  pushReason(reasons, estimate >= 300, 'market price remains premium');

  return { value: clamp(score), reasons: reasons.slice(0, 3) };
}

function buildLiquidityScore(input: ScoreInput): ReasonedScore {
  const reasons: string[] = [];
  const sizeDepth = input.sizesCount ?? 0;
  let score = 14;

  score += Math.min((input.weeklyOrders ?? 0) * 0.55, 28);
  if ((input.rank ?? 99999) < 1000) score += 14;
  else if ((input.rank ?? 99999) < 3000) score += 8;
  if (sizeDepth >= 8) score += 10;
  else if (sizeDepth >= 4) score += 6;
  if (!input.market.isPlaceholder) score += 10;

  pushReason(reasons, (input.weeklyOrders ?? 0) >= 12, 'orders suggest active movement');
  pushReason(reasons, (input.rank ?? 99999) < 3000, 'rank supports easier exits');
  pushReason(reasons, sizeDepth >= 4, 'variant coverage is broad enough to read');
  pushReason(reasons, !input.market.isPlaceholder, 'size-level pricing is available');

  return { value: clamp(score), reasons: reasons.slice(0, 3) };
}

function buildRarityScore(input: ScoreInput): ReasonedScore {
  const reasons: string[] = [];
  let score = 18;

  score += countTraits(input.materials, ['collab-lean']) * 26;
  score += countTraits(input.materials, ['limited-lean']) * 18;
  score += countTraits(input.materials, ['collector-lean', 'premium-lean', 'retro-lean']) * 10;
  if (marketEstimate(input.market) >= 350) score += 10;
  if ((input.rank ?? 99999) < 1500) score += 8;

  pushReason(reasons, input.materials.includes('collab-lean'), 'collaboration profile boosts rarity');
  pushReason(reasons, input.materials.includes('limited-lean'), 'limited signal lifts scarcity');
  pushReason(reasons, input.materials.includes('collector-lean'), 'collector silhouette carries long-tail value');
  pushReason(reasons, marketEstimate(input.market) >= 350, 'premium market pricing reinforces rarity');

  return { value: clamp(score), reasons: reasons.slice(0, 3) };
}

function buildMaterialSensitivityScore(input: ScoreInput): ReasonedScore {
  const reasons: string[] = [];
  let score = 18;

  score += countTraits(input.materials, ['suede', 'nubuck']) * 18;
  score += countTraits(input.materials, ['canvas', 'knit', 'mesh']) * 8;
  score += countTraits(input.materials, ['patent']) * 10;
  if (hasAny(input.materials, ['light-upper', 'cream-upper'])) score += 10;

  pushReason(reasons, hasAny(input.materials, ['suede', 'nubuck']), 'delicate materials need careful handling');
  pushReason(reasons, hasAny(input.materials, ['canvas', 'knit', 'mesh']), 'textile upper is easy to mark up');
  pushReason(reasons, input.materials.includes('patent'), 'patent finish can show edge wear quickly');
  pushReason(reasons, hasAny(input.materials, ['light-upper', 'cream-upper']), 'lighter tones amplify material issues');

  return { value: clamp(score), reasons: reasons.slice(0, 3) };
}

function buildSoleRiskScore(input: ScoreInput, now: Date): ReasonedScore {
  const reasons: string[] = [];
  const releaseAge = Math.max(0, -daysUntil(input.releaseDate, now));
  let score = 12;

  if (input.materials.includes('icy-sole')) score += 22;
  if (input.materials.includes('white-midsole')) score += 16;
  if (input.materials.includes('aged-sole')) score += 18;
  if (input.materials.includes('gum-sole')) score += 8;
  if (releaseAge > 365) score += 12;
  if (releaseAge > 730) score += 8;

  pushReason(reasons, input.materials.includes('icy-sole'), 'translucent sole can yellow over time');
  pushReason(reasons, input.materials.includes('white-midsole'), 'white midsole shows wear quickly');
  pushReason(reasons, input.materials.includes('aged-sole'), 'aged sole already hints at finish work');
  pushReason(reasons, releaseAge > 365, 'older release raises sole-care risk');

  return { value: clamp(score), reasons: reasons.slice(0, 3) };
}

function buildWearVisibilityScore(input: ScoreInput): ReasonedScore {
  const reasons: string[] = [];
  let score = 18;

  if (hasAny(input.materials, ['light-upper', 'cream-upper'])) score += 24;
  if (hasAny(input.materials, ['mesh', 'canvas', 'knit', 'suede'])) score += 16;
  if (input.materials.includes('white-midsole')) score += 12;
  if (hasAny(input.materials, ['daily-wear', 'runner-lean'])) score += 10;

  pushReason(reasons, hasAny(input.materials, ['light-upper', 'cream-upper']), 'light upper shows scuffs immediately');
  pushReason(reasons, hasAny(input.materials, ['mesh', 'canvas', 'knit', 'suede']), 'textured upper catches visible wear');
  pushReason(reasons, input.materials.includes('white-midsole'), 'midsole dirt reads fast on-foot');
  pushReason(reasons, hasAny(input.materials, ['daily-wear', 'runner-lean']), 'frequent wear profile accelerates visible dirt');

  return { value: clamp(score), reasons: reasons.slice(0, 3) };
}

function buildReleasePressureScore(input: ScoreInput, now: Date): ReasonedScore {
  const reasons: string[] = [];
  const distance = daysUntil(input.releaseDate, now);
  const ratio = spreadRatio(input);
  let score = 16;

  if (distance >= 0) {
    if (distance <= 2) score = 94;
    else if (distance <= 7) score = 84;
    else if (distance <= 14) score = 72;
    else if (distance <= 30) score = 58;
    else score = 34;
  } else {
    if ((input.weeklyOrders ?? 0) >= 18) score += 18;
    if (ratio >= 0.18) score += 16;
  }

  if (input.opportunityFlags.includes('upcoming')) score += 4;

  pushReason(reasons, distance >= 0 && distance <= 7, 'release window is close');
  pushReason(reasons, distance > 7 && distance <= 30, 'release is approaching soon');
  pushReason(reasons, distance < 0 && (input.weeklyOrders ?? 0) >= 18, 'post-release market is still moving');
  pushReason(reasons, ratio >= 0.18, 'spread keeps attention elevated');

  return { value: clamp(score), reasons: reasons.slice(0, 3) };
}

function buildConfidenceScore(input: ScoreInput): ReasonedScore {
  const reasons: string[] = [];
  let score = 44;

  if (input.sourceType === 'snapshot') score += 16;
  if (!input.market.isPlaceholder) score += 16;
  if (input.market.estimatedResale || input.market.lowAsk || input.market.lastSale) score += 10;
  if ((input.weeklyOrders ?? 0) > 0) score += 6;
  if ((input.rank ?? 99999) < 5000) score += 6;
  if ((input.sizesCount ?? 0) >= 4) score += 4;

  pushReason(reasons, input.sourceType === 'snapshot', 'snapshot provider is stable');
  pushReason(reasons, !input.market.isPlaceholder, 'live market fields are available');
  pushReason(reasons, Boolean(input.weeklyOrders && input.weeklyOrders > 0), 'demand metrics are present');
  pushReason(reasons, Boolean((input.rank ?? 99999) < 5000), 'rank data supports calibration');

  return { value: clamp(score), reasons: reasons.slice(0, 3) };
}

function buildCompositeScore(values: number[], reasons: string[]): ReasonedScore {
  return {
    value: clamp(avg(values)),
    reasons: [...new Set(reasons)].slice(0, 3),
  };
}

export function buildScoreRecord(input: ScoreInput, now: Date): ScoreRecord {
  const cleaning = buildCleaningScore(input);
  const restoration = buildRestorationScore(input, now);
  const marketStrength = buildMarketStrengthScore(input);
  const liquidity = buildLiquidityScore(input);
  const rarity = buildRarityScore(input);
  const materialSensitivity = buildMaterialSensitivityScore(input);
  const soleRisk = buildSoleRiskScore(input, now);
  const wearVisibility = buildWearVisibilityScore(input);
  const releasePressure = buildReleasePressureScore(input, now);
  const confidence = buildConfidenceScore(input);

  const flipPotential = buildCompositeScore(
    [marketStrength.value, liquidity.value, rarity.value, releasePressure.value, confidence.value],
    [...marketStrength.reasons, ...liquidity.reasons, ...rarity.reasons],
  );
  const serviceFit = buildCompositeScore(
    [cleaning.value, restoration.value, materialSensitivity.value, soleRisk.value, wearVisibility.value],
    [...cleaning.reasons, ...restoration.reasons, ...materialSensitivity.reasons],
  );
  const marketWatchFit = buildCompositeScore(
    [marketStrength.value, liquidity.value, rarity.value, releasePressure.value, confidence.value],
    [...marketStrength.reasons, ...rarity.reasons, ...releasePressure.reasons],
  );
  const preservationValue = buildCompositeScore(
    [restoration.value, rarity.value, materialSensitivity.value, soleRisk.value, confidence.value],
    [...restoration.reasons, ...rarity.reasons, ...soleRisk.reasons],
  );

  return {
    cleaning: cleaning.value,
    restoration: restoration.value,
    flipPotential: flipPotential.value,
    urgency: releasePressure.value,
    releasePressure: releasePressure.value,
    confidence: confidence.value,
    marketStrength: marketStrength.value,
    liquidity: liquidity.value,
    rarity: rarity.value,
    materialSensitivity: materialSensitivity.value,
    soleRisk: soleRisk.value,
    wearVisibility: wearVisibility.value,
    serviceFit: serviceFit.value,
    marketWatchFit: marketWatchFit.value,
    preservationValue: preservationValue.value,
    reasons: {
      cleaning: cleaning.reasons,
      restoration: restoration.reasons,
      flipPotential: flipPotential.reasons,
      urgency: releasePressure.reasons,
      releasePressure: releasePressure.reasons,
      confidence: confidence.reasons,
      marketStrength: marketStrength.reasons,
      liquidity: liquidity.reasons,
      rarity: rarity.reasons,
      materialSensitivity: materialSensitivity.reasons,
      soleRisk: soleRisk.reasons,
      wearVisibility: wearVisibility.reasons,
      serviceFit: serviceFit.reasons,
      marketWatchFit: marketWatchFit.reasons,
      preservationValue: preservationValue.reasons,
    },
  };
}
