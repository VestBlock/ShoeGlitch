import type { Metadata } from 'next';
import { SITE_URL } from '@/features/seo/catalog';
import { getActiveSeoCities } from '@/features/seo/data';
import { getSneakerBySlug } from '@/features/intelligence/service';
import { getReleaseEditorialBySlug } from '@/features/releases/editorial';
import type { ReleaseFaq, ReleasePageModel } from '@/features/releases/types';

function isAlertCandidate(item: ReleasePageModel['item']) {
  return item.scores.marketWatchFit >= 56 || item.scores.releasePressure >= 52 || item.availability === 'upcoming';
}

function buildAlertFaqs(item: ReleasePageModel['item']): ReleaseFaq[] {
  return [
    {
      question: `Can I get alerts for ${item.name}?`,
      shortAnswer: `Yes. ShoeGlitch can route this pair into your watchlist so release, restock, and pricing movement can come back to you instead of getting lost.`,
      answer: `Yes. ShoeGlitch can route this pair into your watchlist so release, restock, and pricing movement can come back to you instead of getting lost. This page exists to turn market interest into a saved action, not a forgotten tab.`,
    },
    {
      question: `Why is ${item.name} alert-worthy?`,
      shortAnswer: `${item.name} qualifies when release timing, market watch fit, and size-level uncertainty make tracking smarter than guessing.`,
      answer: `${item.name} qualifies when release timing, market watch fit, and size-level uncertainty make tracking smarter than guessing. ShoeGlitch uses those release and market signals to decide when alerting makes more sense than browsing passively.`,
    },
    {
      question: `What kind of alerts should I set for ${item.name}?`,
      shortAnswer: `Release, restock, or any-alert modes work best depending on whether you care about timing, size access, or a future buy opportunity.`,
      answer: `Release, restock, or any-alert modes work best depending on whether you care about timing, size access, or a future buy opportunity. ShoeGlitch is structured so those alert types can expand later into premium watchlists, SMS, or push without changing the core content system.`,
    },
    {
      question: `Does this page come from provider data or manual editorial?`,
      shortAnswer: `The release facts and market layer come from structured sneaker data. Alert recommendations and future manual context live in ShoeGlitch’s own content layer.`,
      answer: `The release facts, market layer, and product details come from structured sneaker data. Alert recommendations, conversion CTAs, and future silhouette context live in ShoeGlitch’s own content layer so the page is useful for both search and retention.`,
    },
  ];
}

export async function buildReleaseAlertsPageModel(slug: string): Promise<ReleasePageModel | undefined> {
  const item = await getSneakerBySlug(slug);
  if (!item || !isAlertCandidate(item)) return undefined;

  const cities = (await getActiveSeoCities()).slice(0, 2);
  const editorial = getReleaseEditorialBySlug(item.slug);

  return {
    path: `/release-alerts/${item.slug}`,
    canonicalUrl: `${SITE_URL}/release-alerts/${item.slug}`,
    title: `${item.name} alerts, release watch, and restock tracking | ShoeGlitch`,
    description: `Track ${item.name} with ShoeGlitch release alerts, market-watch guidance, restock coverage, and the next best action once the pair moves.`,
    h1: `${item.name} release alerts`,
    eyebrow: 'Alert intelligence',
    intro:
      `${item.name} is a pair that makes more sense as an alert target than a one-time product glance. This page turns structured release data into a watchlist-ready surface so visitors can track the drop, restocks, and future market movement with a clear next action.`,
    aiSummary:
      `${item.name} currently scores ${item.scores.marketWatchFit} for market watch fit, ${item.scores.releasePressure} for release pressure, and ${item.scores.marketStrength} for market strength.` +
      ` ShoeGlitch reads it as a pair that should be saved and monitored rather than checked once and forgotten.`,
    summaryBullets: [
      `Market watch fit: ${item.scores.marketWatchFit}`,
      `Release pressure: ${item.scores.releasePressure}`,
      `Market strength: ${item.scores.marketStrength}`,
      `Availability: ${item.availability}`,
    ],
    item,
    recommendation: {
      eyebrow: 'Alert decision',
      headline: 'Yes, put this pair on your watchlist.',
      body:
        'This pair has enough release timing pressure and market uncertainty that a watchlist is more useful than casual browsing. The best move is to save it now, then let release and restock signals bring you back when the timing is better.',
      bullets: [
        `Market watch fit ${item.scores.marketWatchFit} means the pair is more valuable when tracked than when guessed at.`,
        `Release pressure ${item.scores.releasePressure} means timing and availability matter more than a single snapshot view.`,
        `Market strength ${item.scores.marketStrength} means this is not a dead catalog entry; it is a moving target worth monitoring.`,
      ],
    },
    faqs: buildAlertFaqs(item),
    buyingLinks: [
      {
        href: `/customer/watchlist?sku=${encodeURIComponent(item.sku)}&brand=${encodeURIComponent(item.brand)}&model=${encodeURIComponent(item.silhouette)}&colorway=${encodeURIComponent(item.colorway)}`,
        label: 'Join release alerts',
        description: 'Save this pair to your ShoeGlitch watchlist and let release or restock changes come back to you.',
      },
      {
        href: `/releases/${item.slug}`,
        label: 'Open release brief',
        description: 'See the full structured release and pricing context for this pair.',
      },
      {
        href: `/book?intent=cleaning&pair=${item.slug}`,
        label: 'Plan post-release care',
        description: 'Turn release interest into a real post-purchase care plan instead of stopping at the drop.',
      },
    ],
    relatedLinks: [
      {
        href: '/intelligence',
        label: 'Sneaker intelligence feed',
        description: 'Compare this pair against the broader feed of release and service signals.',
      },
      {
        href: `/intelligence/${item.slug}`,
        label: 'Open intelligence detail',
        description: 'See the full scoring breakdown for this shoe in the intelligence product.',
      },
      ...cities.map((city) => ({
        href: `/pickup-dropoff/${city.slug}`,
        label: `Pickup and drop-off in ${city.name}`,
        description: `See the local service route for ${city.name}, ${city.state}, if you plan to book after release.`,
      })),
    ].slice(0, 5),
    editorial,
  };
}

export async function buildReleaseAlertsMetadata(slug: string): Promise<Metadata> {
  const model = await buildReleaseAlertsPageModel(slug);
  if (!model) {
    return {
      title: 'Release alerts | Shoe Glitch',
      description: 'This ShoeGlitch release-alert page could not be found.',
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

export async function getReleaseAlertsRouteIndex() {
  const { getSneakerFeed } = await import('@/features/intelligence/service');
  const feed = await getSneakerFeed();
  return feed.items
    .filter(isAlertCandidate)
    .map((item) => ({
      path: `/release-alerts/${item.slug}`,
      updatedAt: item.lastUpdatedAt,
    }));
}
