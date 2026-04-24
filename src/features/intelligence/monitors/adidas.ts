import { buildMonitorEntry, buildMonitorHealth, fetchMonitorPage, titleFromSlug } from '@/features/intelligence/monitors/helpers';
import type { RetailMonitorSource } from '@/features/intelligence/monitors/types';

const SOURCE_URL = 'https://www.adidas.com/us/release-dates';

export const adidasMonitorSource: RetailMonitorSource = {
  key: 'adidas',
  label: 'adidas release dates',
  sourceUrl: SOURCE_URL,

  async collect(now) {
    try {
      const { response, html } = await fetchMonitorPage(SOURCE_URL);
      const matches = [...html.matchAll(/href="(\/us\/[^"]+\/([A-Z0-9]{5,})\.html)"/g)];
      const unique = new Map<string, ReturnType<typeof buildMonitorEntry>>();

      for (const match of matches) {
        const href = match[1];
        const sku = match[2];
        const fullUrl = `https://www.adidas.com${href}`;
        const slug = href.split('/').slice(-2, -1)[0] ?? '';
        const name = titleFromSlug(slug)
          .replace(/\bShoes\b/gi, '')
          .replace(/\bSneakers\b/gi, '')
          .trim();

        const entry = buildMonitorEntry({
          source: 'adidas',
          sourceLabel: 'adidas release dates',
          brand: 'adidas',
          model: name || sku,
          name: name || sku,
          colorway: null,
          sku,
          url: fullUrl,
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
          key: 'adidas',
          label: 'adidas release dates',
          status: response.ok ? 'healthy' : 'degraded',
          message: response.ok
            ? `Captured ${unique.size} adidas release candidates from the official calendar.`
            : `adidas release calendar returned ${response.status}.`,
          sourceUrl: SOURCE_URL,
          httpStatus: response.status,
          lastSuccessAt: response.ok ? now.toISOString() : undefined,
        }),
      };
    } catch (error) {
      return {
        entries: [],
        health: buildMonitorHealth({
          key: 'adidas',
          label: 'adidas release dates',
          status: 'degraded',
          message: error instanceof Error ? error.message : 'adidas monitor failed.',
          sourceUrl: SOURCE_URL,
        }),
      };
    }
  },
};

