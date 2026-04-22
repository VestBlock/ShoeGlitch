import type {
  SneakerEventRecord,
  WatchlistItemRecord,
  WatchlistMatchResult,
} from '@/features/intelligence/watchlist/types';

function normalizeText(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(value: string | null | undefined) {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1);
}

function overlapScore(left: string | null | undefined, right: string | null | undefined) {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);
  if (leftTokens.length === 0 || rightTokens.length === 0) return 0;

  const leftSet = new Set(leftTokens);
  const rightSet = new Set(rightTokens);
  let shared = 0;
  for (const token of leftSet) {
    if (rightSet.has(token)) shared += 1;
  }

  return shared / Math.max(leftSet.size, rightSet.size);
}

function eventTypeMatches(item: WatchlistItemRecord, event: SneakerEventRecord) {
  if (item.alertType === 'any') return true;
  return item.alertType === event.eventType;
}

function sizeMatches(item: WatchlistItemRecord, event: SneakerEventRecord) {
  if (!item.size) return true;
  if (!event.size) return true;
  return normalizeText(item.size) === normalizeText(event.size);
}

function targetPriceMatches(item: WatchlistItemRecord, event: SneakerEventRecord) {
  if (!item.targetPrice || !event.price) return true;
  if (event.eventType === 'price_drop') return event.price <= item.targetPrice;
  return true;
}

export function matchWatchlistItemToEvent(
  item: WatchlistItemRecord,
  event: SneakerEventRecord,
): WatchlistMatchResult {
  if (!item.isActive) {
    return { matched: false, score: 0, explanation: 'Watchlist item is inactive.' };
  }

  if (!eventTypeMatches(item, event)) {
    return { matched: false, score: 0, explanation: 'Alert type does not match event type.' };
  }

  if (!sizeMatches(item, event)) {
    return { matched: false, score: 0, explanation: 'Size does not match the event payload.' };
  }

  if (!targetPriceMatches(item, event)) {
    return { matched: false, score: 0, explanation: 'Price is still above the target threshold.' };
  }

  const itemSku = normalizeText(item.sku);
  const eventSku = normalizeText(event.sku);
  if (itemSku && eventSku && itemSku === eventSku) {
    return {
      matched: true,
      matchType: 'exact_sku',
      score: 1,
      explanation: 'Exact SKU match.',
    };
  }

  const brandExact = normalizeText(item.brand) && normalizeText(item.brand) === normalizeText(event.brand);
  if (!brandExact) {
    return { matched: false, score: 0, explanation: 'Brand mismatch.' };
  }

  const modelScore = overlapScore(item.model || item.name, event.model || event.name);
  const colorwayScore = item.colorway && event.colorway ? overlapScore(item.colorway, event.colorway) : 0;
  const nameScore = overlapScore(item.name || item.model, event.name);
  const combined = modelScore * 0.6 + nameScore * 0.25 + colorwayScore * 0.15;

  if (combined >= 0.62 || (modelScore >= 0.75 && (!item.colorway || colorwayScore >= 0.35))) {
    const explanation = item.colorway
      ? `Brand matched exactly with fuzzy model/colorway similarity (${combined.toFixed(2)}).`
      : `Brand matched exactly with strong fuzzy model similarity (${combined.toFixed(2)}).`;

    return {
      matched: true,
      matchType: 'fuzzy_identity',
      score: combined,
      explanation,
    };
  }

  return {
    matched: false,
    score: combined,
    explanation: 'Brand matched, but model/colorway similarity stayed below threshold.',
  };
}
