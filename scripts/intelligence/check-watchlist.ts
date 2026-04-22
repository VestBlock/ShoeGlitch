import assert from 'node:assert/strict';
import { buildAlertDeliveryKey } from '@/features/intelligence/watchlist/dedupe';
import { matchWatchlistItemToEvent } from '@/features/intelligence/watchlist/match';
import type { SneakerEventRecord, WatchlistItemRecord } from '@/features/intelligence/watchlist/types';

function watch(overrides: Partial<WatchlistItemRecord> = {}): WatchlistItemRecord {
  return {
    id: 'wl_1',
    userId: 'usr_1',
    brand: 'Jordan',
    model: 'Jordan 4',
    name: 'Air Jordan 4 White Navy',
    colorway: 'White / Midnight Navy',
    sku: 'FV5029-141',
    size: null,
    targetPrice: null,
    alertType: 'any',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function event(overrides: Partial<SneakerEventRecord> = {}): SneakerEventRecord {
  return {
    id: 'evt_1',
    source: 'kicksdb',
    sourceEventKey: 'kicksdb:jordan-4-white-navy:release',
    eventType: 'release',
    name: 'Air Jordan 4 White Navy',
    brand: 'Jordan',
    model: 'Jordan 4',
    colorway: 'White / Midnight Navy',
    sku: 'FV5029-141',
    size: null,
    price: 215,
    currency: 'USD',
    imageUrl: null,
    marketUrl: null,
    eventDate: new Date().toISOString(),
    metadata: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

const exact = matchWatchlistItemToEvent(watch(), event());
assert.equal(exact.matched, true);
assert.equal(exact.matchType, 'exact_sku');

const fuzzy = matchWatchlistItemToEvent(
  watch({ sku: null, model: 'Air Max 95', brand: 'Nike', colorway: 'Neon' }),
  event({ sku: null, brand: 'Nike', model: 'Air Max 95 OG', name: 'Nike Air Max 95 Neon', colorway: 'Neon Yellow' }),
);
assert.equal(fuzzy.matched, true);
assert.equal(fuzzy.matchType, 'fuzzy_identity');

const inactive = matchWatchlistItemToEvent(watch({ isActive: false }), event());
assert.equal(inactive.matched, false);

const missing = matchWatchlistItemToEvent(
  watch({ sku: null, brand: 'Nike', model: 'Foamposite', colorway: 'Galaxy' }),
  event({ sku: null, brand: 'Adidas', model: 'Foam Runner', colorway: null }),
);
assert.equal(missing.matched, false);

const deliveryA = buildAlertDeliveryKey('wl_1', 'evt_1');
const deliveryB = buildAlertDeliveryKey('wl_1', 'evt_1');
assert.equal(deliveryA, deliveryB);

console.log('watchlist checks passed');
