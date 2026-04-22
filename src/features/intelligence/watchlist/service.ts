import { sendSneakerWatchlistAlert } from '@/lib/email';
import { buildAlertDeliveryKey } from '@/features/intelligence/watchlist/dedupe';
import { loadCurrentSneakerEvents, buildMockSneakerEvents } from '@/features/intelligence/watchlist/events';
import { matchWatchlistItemToEvent } from '@/features/intelligence/watchlist/match';
import { watchlistStore } from '@/features/intelligence/watchlist/store';
import type {
  AlertHistoryItem,
  SneakerEventRecord,
  WatchlistItemRecord,
} from '@/features/intelligence/watchlist/types';

function watchlistLabel(item: WatchlistItemRecord) {
  return [item.brand, item.model, item.colorway].filter(Boolean).join(' · ');
}

export async function getWatchlistDashboard(userId: string): Promise<{
  items: WatchlistItemRecord[];
  history: AlertHistoryItem[];
}> {
  const [items, history] = await Promise.all([
    watchlistStore.listByUser(userId),
    watchlistStore.listAlertHistoryByUser(userId, 20),
  ]);

  return { items, history };
}

export async function processSneakerEvents(events: SneakerEventRecord[]) {
  const activeItems = await watchlistStore.listActive();
  const results = {
    processedEvents: 0,
    matchedItems: 0,
    sentAlerts: 0,
    skippedDuplicates: 0,
    failedAlerts: 0,
  };

  for (const event of events) {
    const savedEvent = await watchlistStore.upsertEvent(event);
    results.processedEvents += 1;

    for (const item of activeItems) {
      const match = matchWatchlistItemToEvent(item, savedEvent);
      if (!match.matched || !match.matchType) continue;

      results.matchedItems += 1;
      const key = buildAlertDeliveryKey(item.id, savedEvent.id);
      const existingDelivery = await watchlistStore.findDeliveryByKey(key);
      if (existingDelivery) {
        results.skippedDuplicates += 1;
        continue;
      }

      await watchlistStore.createMatch({
        watchlistItemId: item.id,
        sneakerEventId: savedEvent.id,
        matchType: match.matchType,
        matchScore: match.score,
        explanation: match.explanation,
      });

      const user = await watchlistStore.getUserProfile(item.userId);
      if (!user) {
        await watchlistStore.createDelivery({
          watchlistItemId: item.id,
          sneakerEventId: savedEvent.id,
          userId: item.userId,
          channel: 'email',
          provider: 'resend',
          deliveryKey: key,
          status: 'failed',
          errorMessage: 'User email not found.',
          payload: { eventType: savedEvent.eventType, matchExplanation: match.explanation },
          sentAt: null,
        });
        results.failedAlerts += 1;
        continue;
      }

      try {
        const sent = await sendSneakerWatchlistAlert({
          toEmail: user.email,
          customerName: user.name,
          sneakerName: savedEvent.name,
          brand: savedEvent.brand,
          imageUrl: savedEvent.imageUrl ?? undefined,
          eventType: savedEvent.eventType,
          eventDate: savedEvent.eventDate,
          price: savedEvent.price ?? undefined,
          ctaUrl: savedEvent.marketUrl ?? `https://shoeglitch.com/intelligence`,
          watchLabel: watchlistLabel(item),
        });

        if (!sent) {
          await watchlistStore.createDelivery({
            watchlistItemId: item.id,
            sneakerEventId: savedEvent.id,
            userId: item.userId,
            channel: 'email',
            provider: 'resend',
            deliveryKey: key,
            status: 'failed',
            errorMessage: 'RESEND_API_KEY not configured.',
            payload: { eventType: savedEvent.eventType, matchExplanation: match.explanation },
            sentAt: null,
          });
          results.failedAlerts += 1;
          continue;
        }

        await watchlistStore.createDelivery({
          watchlistItemId: item.id,
          sneakerEventId: savedEvent.id,
          userId: item.userId,
          channel: 'email',
          provider: 'resend',
          deliveryKey: key,
          status: 'sent',
          errorMessage: null,
          payload: { eventType: savedEvent.eventType, matchExplanation: match.explanation },
          sentAt: new Date().toISOString(),
        });
        results.sentAlerts += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Watchlist email failed.';
        await watchlistStore.createDelivery({
          watchlistItemId: item.id,
          sneakerEventId: savedEvent.id,
          userId: item.userId,
          channel: 'email',
          provider: 'resend',
          deliveryKey: key,
          status: 'failed',
          errorMessage: message,
          payload: { eventType: savedEvent.eventType, matchExplanation: match.explanation },
          sentAt: null,
        });
        results.failedAlerts += 1;
      }
    }
  }

  return results;
}

export async function runMockWatchlistScan() {
  const liveEvents = await loadCurrentSneakerEvents(18);
  const events = liveEvents.length > 0 ? liveEvents : buildMockSneakerEvents();
  return processSneakerEvents(events);
}
