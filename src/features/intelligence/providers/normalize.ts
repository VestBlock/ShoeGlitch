import type { NormalizedSneaker, NormalizedSneakerSize } from '@/features/intelligence/providers/types';

export interface KicksDbProductRecord {
  id: string;
  title?: string;
  brand?: string;
  model?: string;
  description?: string;
  image?: string;
  sku?: string;
  slug?: string;
  product_type?: string;
  category?: string;
  secondary_category?: string;
  link?: string;
  min_price?: number | null;
  avg_price?: number | null;
  max_price?: number | null;
  retail_price?: number | null;
  release_date?: string | null;
  updated_at?: string | null;
  upcoming?: boolean;
  rank?: number | null;
  weekly_orders?: number | null;
  variants?: Array<{
    id: string;
    size?: string;
    size_type?: string;
    lowest_ask?: number | null;
    currency?: string | null;
    market?: string | null;
    last_sale?: number | null;
  }>;
}

export interface NikePublicThreadRecord {
  id: string;
  title?: string;
  seo?: {
    slug?: string;
    title?: string;
  };
  coverCard?: {
    subtitle?: string;
    title?: string;
    defaultURL?: string;
    landscapeURL?: string;
    portraitURL?: string;
    notifyMeURL?: string;
  };
  productId?: string | null;
}

export interface NikePublicSkuRecord {
  id: string;
  available?: boolean;
  level?: string;
  nike_size?: string;
  country_specifications?: Array<{
    localized_size?: string;
  }>;
}

export interface NikePublicProductRecord {
  id: string;
  title?: string;
  subtitle?: string;
  styleColor?: string;
  imageSrc?: string;
  launchStatus?: string;
  productType?: string;
  merchStatus?: string;
  currency?: string;
  currentPrice?: number | null;
  fullPrice?: number | null;
  msrp?: number | null;
  commerceStartDate?: string | null;
  skus?: NikePublicSkuRecord[];
}

export interface NikePublicLaunchRecord {
  productId: string;
  startEntryDate?: string | null;
  stopEntryDate?: string | null;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferColorway(title: string, model: string) {
  if (!title) return '';
  const suffix = title.replace(model, '').trim();
  return suffix.replace(/^[-–'\s]+|[-–'\s]+$/g, '') || '';
}

function normalizeSizes(product: KicksDbProductRecord): NormalizedSneakerSize[] {
  return (product.variants ?? []).map((variant) => ({
    label:
      variant.size && variant.size_type
        ? `${variant.size_type.toUpperCase()} ${variant.size}`
        : variant.size ?? 'Unknown size',
    market: variant.market ?? null,
    lowestAsk: variant.lowest_ask ?? null,
    lastSale: variant.last_sale ?? null,
    currency: variant.currency ?? 'USD',
  }));
}

function inferAvailability(product: KicksDbProductRecord, releaseDate: string | null) {
  if (product.upcoming) return 'upcoming' as const;
  if (releaseDate && new Date(releaseDate).getTime() > Date.now()) return 'upcoming' as const;
  if ((product.weekly_orders ?? 0) > 20 || (product.min_price ?? 0) > 0) return 'watch-worthy' as const;
  if (releaseDate) return 'released' as const;
  return 'unknown' as const;
}

export function normalizeKicksDbProduct(product: KicksDbProductRecord): NormalizedSneaker {
  const model = product.model?.trim() || product.secondary_category?.trim() || product.title?.trim() || 'Unknown model';
  const title = product.title?.trim() || `${product.brand ?? ''} ${model}`.trim() || 'Unknown sneaker';
  const releaseDate = product.release_date ?? null;

  return {
    id: `${product.id}`,
    externalId: `${product.id}`,
    provider: 'kicksdb',
    sku: product.sku?.trim() || 'UNKNOWN-SKU',
    slug: product.slug?.trim() || slugify(title),
    name: title,
    brand: product.brand?.trim() || 'Unknown brand',
    model,
    colorway: inferColorway(title, model),
    category: product.product_type?.trim() || product.category?.trim() || 'sneakers',
    releaseDate,
    retailPrice: product.retail_price ?? null,
    imageUrl: product.image?.trim() || '/ShoeTest-poster.png',
    marketUrl: product.link?.trim() || null,
    sizes: normalizeSizes(product),
    priceSummary: {
      retailPrice: product.retail_price ?? null,
      lowestAsk: product.min_price ?? null,
      lastSale: null,
      averagePrice: product.avg_price ?? null,
      currency: 'USD',
      isPlaceholder: false,
    },
    availability: inferAvailability(product, releaseDate),
    updatedAt: product.updated_at ?? new Date().toISOString(),
    description: product.description?.trim() || `${title} market record from KicksDB.`,
    rawSummary: {
      rank: product.rank ?? null,
      weeklyOrders: product.weekly_orders ?? null,
      upcoming: product.upcoming ?? null,
    },
  };
}

function inferNikeBrandName(product: NikePublicProductRecord, thread: NikePublicThreadRecord) {
  const text = `${product.title ?? ''} ${thread.title ?? ''} ${thread.coverCard?.subtitle ?? ''}`.trim();
  if (/jordan/i.test(text)) return 'Jordan';
  if (/converse/i.test(text)) return 'Converse';
  if (/air force|air max|dunk|kobe|pegasus|vomero|nike/i.test(text)) return 'Nike';
  return 'Nike';
}

function inferNikeModel(product: NikePublicProductRecord) {
  const title = product.title?.trim() ?? 'Unknown sneaker';
  return title;
}

function inferNikeColorway(product: NikePublicProductRecord) {
  return product.styleColor?.trim() ?? '';
}

function normalizeNikeSizes(product: NikePublicProductRecord): NormalizedSneakerSize[] {
  return (product.skus ?? []).map((sku) => ({
    label: sku.country_specifications?.[0]?.localized_size ?? sku.nike_size ?? 'Unknown size',
    market: sku.level ?? null,
    lowestAsk: null,
    lastSale: null,
    currency: product.currency ?? 'USD',
  }));
}

function inferNikeAvailability(product: NikePublicProductRecord, releaseDate: string | null) {
  if (releaseDate && new Date(releaseDate).getTime() > Date.now()) return 'upcoming' as const;
  if ((product.skus ?? []).some((sku) => sku.available)) return 'released' as const;
  if (product.launchStatus === 'ACTIVE') return 'watch-worthy' as const;
  return 'unknown' as const;
}

export function normalizeNikePublicProduct(
  thread: NikePublicThreadRecord,
  product: NikePublicProductRecord,
  launch: NikePublicLaunchRecord | null,
): NormalizedSneaker {
  const title = product.title?.trim() || thread.title?.trim() || thread.seo?.title?.trim() || 'Unknown sneaker';
  const releaseDate = launch?.startEntryDate ?? product.commerceStartDate ?? null;
  const retailPrice = product.msrp ?? product.fullPrice ?? product.currentPrice ?? null;

  return {
    id: product.id,
    externalId: product.id,
    provider: 'nike-public',
    sku: product.styleColor?.trim() || product.id,
    slug: thread.seo?.slug?.trim() || slugify(title),
    name: title,
    brand: inferNikeBrandName(product, thread),
    model: inferNikeModel(product),
    colorway: inferNikeColorway(product),
    category: product.productType?.trim() || product.subtitle?.trim() || 'sneakers',
    releaseDate,
    retailPrice,
    imageUrl:
      thread.coverCard?.landscapeURL?.trim() ||
      thread.coverCard?.defaultURL?.trim() ||
      thread.coverCard?.portraitURL?.trim() ||
      thread.coverCard?.notifyMeURL?.trim() ||
      product.imageSrc?.trim() ||
      '/ShoeTest-poster.png',
    marketUrl: thread.seo?.slug ? `https://www.nike.com/launch/t/${thread.seo.slug}` : 'https://www.nike.com/launch',
    sizes: normalizeNikeSizes(product),
    priceSummary: {
      retailPrice,
      lowestAsk: null,
      lastSale: null,
      averagePrice: null,
      currency: product.currency ?? 'USD',
      isPlaceholder: true,
    },
    availability: inferNikeAvailability(product, releaseDate),
    updatedAt: new Date().toISOString(),
    description:
      `${title} release tracked from Nike SNKRS public launch data.` +
      (thread.coverCard?.subtitle ? ` ${thread.coverCard.subtitle}.` : ''),
    rawSummary: {
      rank: null,
      weeklyOrders: null,
      upcoming: releaseDate ? new Date(releaseDate).getTime() > Date.now() : null,
    },
  };
}
