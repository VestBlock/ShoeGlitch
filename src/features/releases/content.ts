import type { Metadata } from 'next';
import { getSneakerBySlug } from '@/features/intelligence/service';
import { getActiveSeoCities } from '@/features/seo/data';
import { SITE_URL } from '@/features/seo/catalog';
import { getReleaseEditorialBySlug } from '@/features/releases/editorial';
import type { ReleaseFaq, ReleaseLink, ReleasePageModel, ReleaseRecommendation } from '@/features/releases/types';

function normalizedRetail(value: number | null | undefined) {
  if (value == null || value <= 0) return null;
  return value;
}

function formatCurrency(value: number | null | undefined, currency = 'USD') {
  if (value == null || value <= 0) return 'TBD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function buildBuyingLinks(model: ReleasePageModel['item']): ReleaseLink[] {
  return [
    ...(model.marketUrl
      ? [
          {
            href: model.marketUrl,
            label: 'Track market availability',
            description: 'Open the live market page for pricing and release availability signals.',
          },
        ]
      : []),
    {
      href: `/customer/watchlist?sku=${encodeURIComponent(model.sku)}&brand=${encodeURIComponent(model.brand)}&model=${encodeURIComponent(model.silhouette)}&colorway=${encodeURIComponent(model.colorway)}`,
      label: 'Join release alerts',
      description: 'Save this pair to your ShoeGlitch watchlist and get release or restock alerts.',
    },
    {
      href: model.primaryCta.href,
      label: model.primaryCta.label,
      description: 'Turn sneaker interest into the next ShoeGlitch action instead of losing the lead.',
    },
  ].slice(0, 3);
}

async function buildRelatedLinks(model: ReleasePageModel['item']): Promise<ReleaseLink[]> {
  const cities = (await getActiveSeoCities()).slice(0, 2);
  const servicePrimary =
    model.scores.restoration >= model.scores.cleaning
      ? {
          href: '/shoe-restoration',
          label: 'Shoe restoration hub',
          description: 'See how ShoeGlitch handles pairs that deserve deeper repair and finish work.',
        }
      : {
          href: '/sneaker-cleaning',
          label: 'Sneaker cleaning hub',
          description: 'See how ShoeGlitch cleans pairs like this before wear turns expensive.',
        };

  return [
    servicePrimary,
    {
      href: '/pickup-dropoff',
      label: 'Pickup and drop-off options',
      description: 'Check the logistics path for getting this pair into the workflow quickly.',
    },
    {
      href: `/intelligence/${model.slug}`,
      label: 'Open intelligence detail',
      description: 'Compare the full scoring breakdown and release signals in the intelligence feed.',
    },
    ...cities.map((city) => ({
      href: `${model.scores.cleaning >= model.scores.restoration ? '/sneaker-cleaning' : '/shoe-restoration'}/${city.slug}`,
      label: `${model.scores.cleaning >= model.scores.restoration ? 'Cleaning' : 'Restoration'} in ${city.name}`,
      description: `See the local service route for ${city.name}, ${city.state}.`,
    })),
  ].slice(0, 5);
}

function buildRecommendation(model: ReleasePageModel['item']): ReleaseRecommendation {
  if (model.scores.marketWatchFit >= 74 && model.availability === 'upcoming') {
    return {
      eyebrow: 'Should you buy this?',
      headline: 'Watch first, then buy with a plan.',
      body:
        'This release looks strongest as a monitored drop. The market and release pressure are doing enough work that the smarter move is to save it, track the release, and buy when your size and price line up.',
      bullets: [
        `Release pressure is ${model.scores.releasePressure}, so timing matters more than impulse.`,
        `Market strength is ${model.scores.marketStrength}, which makes this pair worth watching even before full size-level sales data settles.`,
        `If you buy, pair it with a watchlist or immediate post-release care plan instead of treating it like a throwaway pickup.`,
      ],
    };
  }

  if (model.scores.restoration >= 70 || model.scores.preservationValue >= 70) {
    return {
      eyebrow: 'Should you buy this?',
      headline: 'Buy it if you plan to preserve it.',
      body:
        'This pair reads more like a longer-term hold than a quick flip. The value is in protecting the finish, managing sole risk, and treating it like a pair worth maintaining properly.',
      bullets: [
        `Restoration upside is ${model.scores.restoration}, which signals this pair deserves more than basic wipe-down care.`,
        `Collector and preservation signals are elevated enough that long-term condition matters.`,
        `This is the kind of pair that benefits from restoration-aware ownership instead of neglect.`,
      ],
    };
  }

  return {
    eyebrow: 'Should you buy this?',
    headline: 'Yes, if you want a wearable pair with easy service upside.',
    body:
      'This release makes the most sense as a wearable pickup. It is not just about the drop; it is about how easy the pair is to clean, maintain, and keep looking sharp once it is on foot.',
    bullets: [
      `Cleanability lands at ${model.scores.cleaning}, which makes this pair friendly to ongoing care.`,
      `Wear visibility and material sensitivity give ShoeGlitch a clear service story after purchase.`,
      `If you buy, the best next step is getting the pair into a repeatable cleaning or protection routine early.`,
    ],
  };
}

function buildFaqs(model: ReleasePageModel['item']): ReleaseFaq[] {
  const retail = formatCurrency(
    normalizedRetail(model.release.retailPrice) ?? normalizedRetail(model.priceSummary.retailPrice),
    model.release.currency,
  );
  const ask = formatCurrency(model.priceSummary.lowestAsk ?? model.priceSummary.averagePrice, model.priceSummary.currency);
  const releaseDate = new Date(model.release.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return [
    {
      question: `When does ${model.name} release?`,
      shortAnswer: `${model.name} is currently tracked for ${releaseDate}.`,
      answer: `${model.name} is currently tracked for ${releaseDate}. ShoeGlitch is using structured provider data first, then layering service and market interpretation on top so the page answers the release question and the care question at the same time.`,
    },
    {
      question: `What is the retail price for ${model.name}?`,
      shortAnswer: `The current MSRP signal for ${model.name} is ${retail}.`,
      answer: `The current MSRP signal for ${model.name} is ${retail}. If live market data is available, ShoeGlitch also compares that retail anchor to current ask and average market levels instead of showing a release page without buying context.`,
    },
    {
      question: `Is ${model.name} worth cleaning or restoring after you buy it?`,
      shortAnswer:
        model.scores.restoration >= model.scores.cleaning
          ? `${model.name} leans restoration-first because the preservation and sole-risk signals are stronger than the easy-clean profile.`
          : `${model.name} leans cleaning-first because the visible wear profile is stronger than the deeper restoration case.`,
      answer:
        model.scores.restoration >= model.scores.cleaning
          ? `${model.name} leans restoration-first because the preservation, rarity, and sole-risk signals are stronger than the easy-clean profile. That makes it a better long-term care pair than a basic quick-clean pair.`
          : `${model.name} leans cleaning-first because the visible wear profile, upper finish, and day-to-day maintenance story are stronger than the deeper restoration case. That is why ShoeGlitch treats it as an easy care candidate first.`,
    },
    {
      question: `Where can I track availability or price for ${model.name}?`,
      shortAnswer: `ShoeGlitch surfaces the current release and market summary here, then links you to the live market or your watchlist flow.`,
      answer: `ShoeGlitch surfaces the current release and market summary here, then links you to the live market or your watchlist flow. That lets the page act like an answer-engine-friendly release brief instead of a dead-end sneaker blog post.`,
    },
    {
      question: `What does ShoeGlitch know automatically versus editorially about ${model.name}?`,
      shortAnswer: `Release date, MSRP, images, SKU, and market signals come from structured provider data. Silhouette history and cultural context are manual enrichment fields.`,
      answer: `Release date, MSRP, images, SKU, availability, and market signals come from structured provider data. Silhouette history, cultural context, designer notes, and release significance are separate editorial fields that require manual review and are not assumed from provider data automatically.`,
    },
  ];
}

export async function buildReleasePageModel(slug: string): Promise<ReleasePageModel | undefined> {
  const item = await getSneakerBySlug(slug, { includeNikePublic: false });
  if (!item) return undefined;

  const path = `/releases/${item.slug}`;
  const editorial = getReleaseEditorialBySlug(item.slug);
  const recommendation = buildRecommendation(item);
  const faqs = buildFaqs(item);
  const retailLabel = formatCurrency(
    normalizedRetail(item.release.retailPrice) ?? normalizedRetail(item.priceSummary.retailPrice),
    item.release.currency,
  );

  const model: ReleasePageModel = {
    path,
    canonicalUrl: `${SITE_URL}${path}`,
    title: `${item.name} release date, price, market summary, and ShoeGlitch care read`,
    description: `${item.name} release date, MSRP, market summary, cleaning score, restoration score, and ShoeGlitch guidance on whether this pair is worth buying, watching, or preserving.`,
    h1: item.name,
    eyebrow: `${item.brand} release brief`,
    intro: `${item.name} is being tracked as a ShoeGlitch release page, not a generic sneaker post. The point is to answer the release question quickly, show what the market is doing, and make the right next action obvious.`,
    aiSummary:
      `${item.name} is a ${item.availability} ${item.brand} release with a retail anchor of ${retailLabel}.` +
      ` ShoeGlitch currently reads this pair as ${item.scores.cleaning >= item.scores.restoration ? 'cleaning-friendly' : 'restoration-worthy'},` +
      ` with market strength ${item.scores.marketStrength} and confidence ${item.scores.confidence}.`,
    summaryBullets: [
      `Release date: ${new Date(item.release.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      `MSRP: ${retailLabel}`,
      `Current market summary: ${formatCurrency(item.priceSummary.lowestAsk ?? item.priceSummary.averagePrice, item.priceSummary.currency)}`,
      item.scores.restoration >= item.scores.cleaning
        ? `ShoeGlitch read: stronger restoration and preservation case than easy-clean case.`
        : `ShoeGlitch read: stronger cleaning and repeat-care case than deep restoration case.`,
    ],
    item,
    recommendation,
    faqs,
    buyingLinks: buildBuyingLinks(item),
    relatedLinks: await buildRelatedLinks(item),
    editorial,
  };

  return model;
}

export async function buildReleaseMetadata(slug: string): Promise<Metadata> {
  const model = await buildReleasePageModel(slug);
  if (!model) {
    return {
      title: 'Release not found | Shoe Glitch',
      description: 'This ShoeGlitch release brief could not be found.',
    };
  }

  return {
    title: model.title,
    description: model.description,
    alternates: {
      canonical: model.canonicalUrl,
    },
    openGraph: {
      title: model.title,
      description: model.description,
      url: model.canonicalUrl,
      images: [{ url: model.item.media.thumbnailUrl }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: model.title,
      description: model.description,
      images: [model.item.media.thumbnailUrl],
    },
  };
}

export async function getReleaseRouteIndex() {
  const { getSneakerFeed } = await import('@/features/intelligence/service');
  const feed = await getSneakerFeed({ includeNikePublic: false });
  return feed.items.map((item) => ({
    path: `/releases/${item.slug}`,
    updatedAt: item.lastUpdatedAt,
  }));
}
