import { createHash } from 'crypto';
import type { RetailMonitorEntry, RetailMonitorHealth, RetailMonitorStatus } from '@/features/intelligence/monitors/types';

export function normalizeWords(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/[_/]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9&+.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function titleFromSlug(slug: string) {
  return normalizeWords(slug.replace(/-/g, ' '));
}

export function buildMonitorEntry(input: Omit<RetailMonitorEntry, 'id'>): RetailMonitorEntry {
  const id = createHash('sha1')
    .update([input.source, input.url, input.sku ?? '', input.name].join(':'))
    .digest('hex');

  return {
    ...input,
    id,
  };
}

export function buildMonitorHealth(input: Omit<RetailMonitorHealth, 'checkedAt'> & { checkedAt?: string }): RetailMonitorHealth {
  return {
    ...input,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
  };
}

export async function fetchMonitorPage(url: string) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      accept: 'text/html,application/xhtml+xml',
    },
    next: { revalidate: 60 * 20 },
  });

  const html = await response.text();
  return { response, html };
}

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function statusFromHttp(code: number): RetailMonitorStatus {
  return code >= 200 && code < 300 ? 'healthy' : 'degraded';
}

