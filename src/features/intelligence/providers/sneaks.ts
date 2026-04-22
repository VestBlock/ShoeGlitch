import type {
  NormalizedSneaker,
  ProviderHealth,
  ProviderProductResult,
  ProviderSearchInput,
  ProviderSearchResult,
  SneakerProvider,
} from '@/features/intelligence/providers/types';

type SneaksProduct = {
  shoeName?: string;
  brand?: string;
  silhoutte?: string;
  styleID?: string;
  colorway?: string;
  releaseDate?: string;
  retailPrice?: number | string;
  thumbnail?: string;
  resellLinks?: {
    stockX?: string;
    goat?: string;
    flightClub?: string;
    stadiumGoods?: string;
  };
  lowestResellPrice?: {
    stockX?: number | null;
    goat?: number | null;
    flightClub?: number | null;
    stadiumGoods?: number | null;
  };
  estimatedMarketValue?: number | null;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeSneaksProduct(product: SneaksProduct, now: Date): NormalizedSneaker {
  const retailPrice = toNumber(product.retailPrice);
  const stockxAsk = product.lowestResellPrice?.stockX ?? null;
  const goatAsk = product.lowestResellPrice?.goat ?? null;
  const lowestAsk = [stockxAsk, goatAsk, product.estimatedMarketValue ?? null]
    .filter((value): value is number => typeof value === 'number')
    .sort((a, b) => a - b)[0] ?? null;
  const marketUrl =
    product.resellLinks?.stockX ??
    product.resellLinks?.goat ??
    product.resellLinks?.flightClub ??
    product.resellLinks?.stadiumGoods ??
    null;
  const name = product.shoeName?.trim() || product.silhoutte?.trim() || product.styleID?.trim() || 'Unknown sneaker';

  return {
    id: product.styleID?.trim() || slugify(name),
    externalId: product.styleID?.trim() || slugify(name),
    provider: 'sneaks',
    sku: product.styleID?.trim() || 'UNKNOWN-SKU',
    slug: slugify(name),
    name,
    brand: product.brand?.trim() || 'Unknown brand',
    model: product.silhoutte?.trim() || name,
    colorway: product.colorway?.trim() || '',
    category: 'sneakers',
    releaseDate: product.releaseDate ?? null,
    retailPrice,
    imageUrl: product.thumbnail?.trim() || '/ShoeTest-poster.png',
    marketUrl,
    sizes: [],
    priceSummary: {
      retailPrice,
      lowestAsk,
      lastSale: null,
      averagePrice: product.estimatedMarketValue ?? null,
      currency: 'USD',
      isPlaceholder: false,
    },
    availability: product.releaseDate && new Date(product.releaseDate).getTime() > now.getTime() ? 'upcoming' : 'watch-worthy',
    updatedAt: now.toISOString(),
    description: `${name} comparison record normalized from Sneaks-API.`,
    rawSummary: {},
  };
}

function health(status: ProviderHealth['status'], message: string, now: Date): ProviderHealth {
  return {
    key: 'sneaks-api',
    label: 'Sneaks-API provider',
    status,
    message,
    lastAttemptAt: now.toISOString(),
    lastSuccessAt: status === 'healthy' ? now.toISOString() : undefined,
  };
}

async function createSneaksClient() {
  const mod = require('sneaks-api');
  return new mod();
}

function getProducts(client: any, keyword: string, limit: number): Promise<SneaksProduct[]> {
  return new Promise((resolve, reject) => {
    client.getProducts(keyword, limit, (error: Error | null, products: SneaksProduct[]) => {
      if (error) return reject(error);
      resolve(products ?? []);
    });
  });
}

function getProductPrices(client: any, styleId: string): Promise<SneaksProduct> {
  return new Promise((resolve, reject) => {
    client.getProductPrices(styleId, (error: Error | null, product: SneaksProduct) => {
      if (error) return reject(error);
      resolve(product);
    });
  });
}

export const sneaksApiProvider: SneakerProvider = {
  key: 'mock',
  label: 'Sneaks-API comparison provider',

  async search(input: ProviderSearchInput, now: Date): Promise<ProviderSearchResult> {
    try {
      const client = await createSneaksClient();
      const products = await getProducts(client, input.sku?.trim() || input.query?.trim() || '', input.limit ?? 8);

      return {
        items: products.map((product) => normalizeSneaksProduct(product, now)),
        raw: products,
        cached: false,
        health: health('healthy', `${products.length} comparison records loaded from Sneaks-API.`, now),
      };
    } catch (error) {
      return {
        items: [],
        raw: null,
        cached: false,
        health: health('degraded', error instanceof Error ? error.message : 'Sneaks-API search failed.', now),
      };
    }
  },

  async getProduct(idOrSlug: string, now: Date): Promise<ProviderProductResult> {
    try {
      const client = await createSneaksClient();
      const product = await getProductPrices(client, idOrSlug);
      return {
        item: normalizeSneaksProduct(product, now),
        raw: product,
        cached: false,
        health: health('healthy', 'Sneaks-API product detail loaded.', now),
      };
    } catch (error) {
      return {
        item: null,
        raw: null,
        cached: false,
        health: health('degraded', error instanceof Error ? error.message : 'Sneaks-API product detail failed.', now),
      };
    }
  },
};
