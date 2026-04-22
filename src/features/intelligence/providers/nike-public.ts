import {
  normalizeNikePublicProduct,
  type NikePublicLaunchRecord,
  type NikePublicProductRecord,
  type NikePublicThreadRecord,
} from '@/features/intelligence/providers/normalize';
import type {
  ProviderHealth,
  ProviderProductResult,
  ProviderSearchInput,
  ProviderSearchResult,
  SneakerProvider,
} from '@/features/intelligence/providers/types';

interface NikeLaunchState {
  productWall?: {
    threadIds?: string[];
  };
  product?: {
    threads?: {
      data?: {
        items?: Record<string, NikePublicThreadRecord>;
      };
    };
    products?: {
      data?: {
        items?: Record<string, NikePublicProductRecord>;
      };
    };
    launchViews?: {
      data?: {
        items?: Record<string, NikePublicLaunchRecord>;
      };
    };
  };
}

async function loadNikeLaunchState(): Promise<NikeLaunchState> {
  const response = await fetch('https://www.nike.com/launch', {
    headers: {
      'user-agent': 'Mozilla/5.0',
      accept: 'text/html,application/xhtml+xml',
    },
    next: { revalidate: 60 * 30 },
  });

  if (!response.ok) {
    throw new Error(`Nike launch page request failed with ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) {
    throw new Error('Nike launch payload was not found on page.');
  }

  const nextData = JSON.parse(match[1]) as {
    props?: {
      pageProps?: {
        initialState?: string;
      };
    };
  };
  const initialState = nextData.props?.pageProps?.initialState;
  if (!initialState) {
    throw new Error('Nike launch initial state was missing.');
  }

  return JSON.parse(initialState) as NikeLaunchState;
}

function health(status: ProviderHealth['status'], message: string, now: Date): ProviderHealth {
  return {
    key: 'nike-public',
    label: 'Nike SNKRS public provider',
    status,
    message,
    lastAttemptAt: now.toISOString(),
    lastSuccessAt: status === 'healthy' ? now.toISOString() : undefined,
  };
}

function buildItems(state: NikeLaunchState) {
  const threadIds = state.productWall?.threadIds ?? [];
  const threads = state.product?.threads?.data?.items ?? {};
  const products = state.product?.products?.data?.items ?? {};
  const launchViews = state.product?.launchViews?.data?.items ?? {};

  return threadIds
    .map((threadId) => threads[threadId])
    .filter((thread): thread is NikePublicThreadRecord => Boolean(thread?.productId && products[thread.productId]))
    .map((thread) => {
      const product = products[thread.productId as string];
      const launch = launchViews[product.id] ?? null;
      return normalizeNikePublicProduct(thread, product, launch);
    });
}

export const nikePublicProvider: SneakerProvider = {
  key: 'nike-public',
  label: 'Nike SNKRS public provider',

  async search(input: ProviderSearchInput, now: Date): Promise<ProviderSearchResult> {
    const state = await loadNikeLaunchState();
    const items = buildItems(state);
    const query = (input.sku?.trim() || input.query?.trim() || '').toLowerCase();
    const filtered = query
      ? items.filter((item) => `${item.name} ${item.brand} ${item.sku} ${item.colorway}`.toLowerCase().includes(query))
      : items;

    return {
      items: filtered.slice(0, input.limit ?? 12),
      raw: {
        source: 'nike-public',
        total: items.length,
      },
      cached: false,
      health: health('healthy', `${filtered.length} Nike public release records matched.`, now),
    };
  },

  async getProduct(idOrSlug: string, now: Date): Promise<ProviderProductResult> {
    const state = await loadNikeLaunchState();
    const items = buildItems(state);
    const item = items.find((entry) => entry.externalId === idOrSlug || entry.slug === idOrSlug || entry.sku === idOrSlug) ?? null;

    return {
      item,
      raw: {
        source: 'nike-public',
        matched: item?.externalId ?? null,
      },
      cached: false,
      health: health(
        item ? 'healthy' : 'degraded',
        item ? 'Nike public release detail loaded.' : 'Nike public release provider did not match that product.',
        now,
      ),
    };
  },
};
