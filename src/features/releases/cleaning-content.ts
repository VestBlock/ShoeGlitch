import type { Metadata } from 'next';
import { SITE_URL } from '@/features/seo/catalog';
import { getActiveSeoCities } from '@/features/seo/data';
import { getSneakerBySlug } from '@/features/intelligence/service';
import { getReleaseEditorialBySlug } from '@/features/releases/editorial';
import type { ReleaseFaq, ReleaseLink, ReleasePageModel } from '@/features/releases/types';

function isCleaningCandidate(item: ReleasePageModel['item']) {
  return item.scores.cleaning >= 56 || item.scores.wearVisibility >= 58 || item.scores.materialSensitivity >= 56;
}

function buildCleaningFaqs(item: ReleasePageModel['item']): ReleaseFaq[] {
  return [
    {
      question: `Is ${item.name} easy to clean?`,
      shortAnswer: `${item.name} reads as a cleaning-first pair when lighter finishes, visible wear zones, and material sensitivity are stronger than the deep-restoration case.`,
      answer: `${item.name} reads as a cleaning-first pair when lighter finishes, visible wear zones, and material sensitivity are stronger than the deep-restoration case. ShoeGlitch uses those signals so the page answers the care question directly instead of leaving owners to guess what kind of maintenance the pair needs.`,
    },
    {
      question: `Why would ${item.name} need regular cleaning?`,
      shortAnswer: `Pairs like ${item.name} collect visible wear faster when the upper, mesh, sole, or lighter tones make dirt and scuffs obvious.`,
      answer: `Pairs like ${item.name} collect visible wear faster when the upper, mesh, sole, or lighter tones make dirt and scuffs obvious. That is why ShoeGlitch highlights cleanability, wear visibility, and material sensitivity alongside the release record.`,
    },
    {
      question: `Should I book cleaning for ${item.name} right after buying it?`,
      shortAnswer: `Yes, if you want to keep the pair looking sharp early instead of waiting for dirt, edge staining, and sole haze to build up.`,
      answer: `Yes, if you want to keep the pair looking sharp early instead of waiting for dirt, edge staining, and sole haze to build up. The earlier the pair enters a repeatable care routine, the easier it is to keep it out of the restoration category later.`,
    },
    {
      question: `What does ShoeGlitch know automatically about ${item.name}?`,
      shortAnswer: `Structured release data, pricing signals, SKU, and provider imagery come from sneaker data sources. Cleaning guidance is ShoeGlitch’s own intelligence layer.`,
      answer: `Structured release data, pricing signals, SKU, availability, and provider imagery come from sneaker data sources. Cleaning guidance, easy-clean recommendations, and service routing are ShoeGlitch’s own intelligence layer built on top of those facts.`,
    },
  ];
}

export async function buildHowToCleanPageModel(slug: string): Promise<ReleasePageModel | undefined> {
  const item = await getSneakerBySlug(slug, { includeNikePublic: false });
  if (!item || item.provider === 'nike-public' || !isCleaningCandidate(item)) return undefined;

  const cities = (await getActiveSeoCities()).slice(0, 2);
  const editorial = getReleaseEditorialBySlug(item.slug);

  return {
    path: `/how-to-clean/${item.slug}`,
    canonicalUrl: `${SITE_URL}/how-to-clean/${item.slug}`,
    title: `How to clean ${item.name} | ShoeGlitch care guide`,
    description: `How to clean ${item.name}: ShoeGlitch’s cleaning score, wear visibility, material sensitivity, and the smartest way to keep this pair looking sharp.`,
    h1: `How to clean ${item.name}`,
    eyebrow: 'Cleaning intelligence',
    intro:
      `${item.name} is the kind of pair where maintenance matters early. This page turns the release record into a cleaning-first care plan so the owner understands what will show dirt fast, what needs extra attention, and when to book a proper clean.`,
    aiSummary:
      `${item.name} currently scores ${item.scores.cleaning} for cleaning, ${item.scores.wearVisibility} for wear visibility, and ${item.scores.materialSensitivity} for material sensitivity.` +
      ` ShoeGlitch reads it as a pair that benefits from consistent cleaning before deeper restoration work is ever needed.`,
    summaryBullets: [
      `Cleaning score: ${item.scores.cleaning}`,
      `Wear visibility: ${item.scores.wearVisibility}`,
      `Material sensitivity: ${item.scores.materialSensitivity}`,
      `Service fit: ${item.scores.serviceFit}`,
    ],
    item,
    recommendation: {
      eyebrow: 'Cleaning decision',
      headline: 'Yes, keep this pair on a regular cleaning routine.',
      body:
        'This pair is stronger as a repeat-care shoe than a wait-until-it-gets-bad shoe. Visible wear risk, upper sensitivity, and finish preservation all point toward early maintenance instead of delayed rescue work.',
      bullets: [
        `Cleaning score ${item.scores.cleaning} means the shoe benefits from consistent maintenance, not occasional neglect.`,
        `Wear visibility ${item.scores.wearVisibility} means dirt and edge wear will show sooner than owners expect.`,
        `Material sensitivity ${item.scores.materialSensitivity} means the upper deserves a cleaning plan that respects the finish, not a generic wipe-down.`,
      ],
    },
    faqs: buildCleaningFaqs(item),
    buyingLinks: [
      {
        href: `/book?intent=cleaning&pair=${item.slug}`,
        label: 'Book cleaning',
        description: 'Move this pair into the cleaning flow before visible wear starts stacking up.',
      },
      {
        href: `/intelligence/${item.slug}`,
        label: 'Open intelligence detail',
        description: 'Compare the full signal breakdown and market layer for this pair.',
      },
      {
        href: `/customer/watchlist?sku=${encodeURIComponent(item.sku)}&brand=${encodeURIComponent(item.brand)}&model=${encodeURIComponent(item.silhouette)}&colorway=${encodeURIComponent(item.colorway)}`,
        label: 'Track this pair',
        description: 'Save the pair to your watchlist while you decide on purchase timing and service timing.',
      },
    ],
    relatedLinks: [
      {
        href: '/sneaker-cleaning',
        label: 'Sneaker cleaning hub',
        description: 'See how ShoeGlitch approaches cleaning-first pairs at the service level.',
      },
      {
        href: `/releases/${item.slug}`,
        label: 'Open release brief',
        description: 'Jump back to the release summary, pricing, and market context for this shoe.',
      },
      ...cities.map((city) => ({
        href: `/sneaker-cleaning/${city.slug}`,
        label: `Cleaning in ${city.name}`,
        description: `See the local cleaning route for ${city.name}, ${city.state}.`,
      })),
    ].slice(0, 5),
    editorial,
  };
}

export async function buildHowToCleanMetadata(slug: string): Promise<Metadata> {
  const model = await buildHowToCleanPageModel(slug);
  if (!model) {
    return {
      title: 'How to clean this shoe | Shoe Glitch',
      description: 'This ShoeGlitch cleaning page could not be found.',
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

export async function getHowToCleanRouteIndex() {
  const { getSneakerFeed } = await import('@/features/intelligence/service');
  const feed = await getSneakerFeed({ includeNikePublic: false });
  return feed.items
    .filter(isCleaningCandidate)
    .map((item) => ({
      path: `/how-to-clean/${item.slug}`,
      updatedAt: item.lastUpdatedAt,
    }));
}
