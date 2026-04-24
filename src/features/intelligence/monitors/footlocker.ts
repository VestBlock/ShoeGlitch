import { buildMonitorEntry, buildMonitorHealth, fetchMonitorPage, stripHtml, titleFromSlug } from '@/features/intelligence/monitors/helpers';
import type { RetailMonitorSource } from '@/features/intelligence/monitors/types';

const SOURCE_URL = 'https://www.footlocker.com/release-calendar.html';

export const footLockerMonitorSource: RetailMonitorSource = {
  key: 'footlocker',
  label: 'Foot Locker release calendar',
  sourceUrl: SOURCE_URL,

  async collect(now) {
    try {
      const { response, html } = await fetchMonitorPage(SOURCE_URL);
      const matches = [
        ...html.matchAll(/<a[^>]+href="(\/release-calendar\/([a-z0-9-]+)\/([A-Z0-9]{6,}))"[^>]*>([\s\S]*?)<\/a>/gi),
      ];
      const unique = new Map<string, ReturnType<typeof buildMonitorEntry>>();

      for (const match of matches) {
        const href = match[1];
        const brand = match[2];
        const sku = match[3];
        const text = stripHtml(match[4]);
        const fallbackName = titleFromSlug(`${brand} ${sku}`);
        const name = text.length > 2 ? text : fallbackName;

        const entry = buildMonitorEntry({
          source: 'footlocker',
          sourceLabel: 'Foot Locker release calendar',
          brand: titleFromSlug(brand),
          model: name,
          name,
          colorway: null,
          sku,
          url: `https://www.footlocker.com${href}`,
          imageUrl: null,
          releaseDate: null,
          detectedAt: now.toISOString(),
          metadata: {
            sourceType: 'official-release-calendar',
          },
        });

        unique.set(entry.id, entry);
      }

      return {
        entries: [...unique.values()].slice(0, 30),
        health: buildMonitorHealth({
          key: 'footlocker',
          label: 'Foot Locker release calendar',
          status: response.ok ? 'healthy' : 'degraded',
          message: response.ok
            ? `Captured ${unique.size} Foot Locker release candidates from the official calendar.`
            : `Foot Locker release calendar returned ${response.status}.`,
          sourceUrl: SOURCE_URL,
          httpStatus: response.status,
          lastSuccessAt: response.ok ? now.toISOString() : undefined,
        }),
      };
    } catch (error) {
      return {
        entries: [],
        health: buildMonitorHealth({
          key: 'footlocker',
          label: 'Foot Locker release calendar',
          status: 'degraded',
          message: error instanceof Error ? error.message : 'Foot Locker monitor failed.',
          sourceUrl: SOURCE_URL,
        }),
      };
    }
  },
};

