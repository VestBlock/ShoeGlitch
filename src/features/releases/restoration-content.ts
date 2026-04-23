import type { Metadata } from 'next';
import { SITE_URL } from '@/features/seo/catalog';
import { getActiveSeoCities } from '@/features/seo/data';
import { getSneakerBySlug } from '@/features/intelligence/service';
import { getReleaseEditorialBySlug } from '@/features/releases/editorial';
import type { ReleaseFaq, ReleaseLink, ReleasePageModel } from '@/features/releases/types';

function formatCurrency(value: number | null | undefined, currency = 'USD') {
  if (value == null || value <= 0) return 'TBD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function isWorthRestoring(item: ReleasePageModel['item']) {
  return item.scores.restoration >= 68 || item.scores.preservationValue >= 70 || item.scores.soleRisk >= 60;
}

function buildWorthRestoringFaqs(item: ReleasePageModel['item']): ReleaseFaq[] {
  const releaseDate = new Date(item.release.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return [
    {
      question: `Is ${item.name} worth restoring instead of just cleaning?`,
      shortAnswer: `${item.name} reads as restoration-worthy when preservation value, sole risk, and long-term collector signals are stronger than the quick-clean profile.`,
      answer: `${item.name} reads as restoration-worthy when preservation value, sole risk, and long-term collector signals are stronger than the quick-clean profile. ShoeGlitch uses those signals so this page can answer the care question directly instead of forcing the visitor to guess whether restoration is overkill.`,
    },
    {
      question: `Why would ${item.name} need restoration after release?`,
      shortAnswer: `Pairs can be worth restoring because of premium materials, aging risk, yellowing, sole issues, or collector value, not just because they are old.`,
      answer: `Pairs can be worth restoring because of premium materials, aging risk, yellowing, sole issues, or collector value, not just because they are old. For ${item.name}, ShoeGlitch is using those structured signals to show why long-term care matters from the beginning.`,
    },
    {
      question: `When did ${item.name} release?`,
      shortAnswer: `${item.name} is currently tracked for ${releaseDate}.`,
      answer: `${item.name} is currently tracked for ${releaseDate}. Release timing matters because older pairs, retros, and collector-driven models often move from basic maintenance into real restoration territory much faster than everyday general-release pairs.`,
    },
    {
      question: `Should I buy ${item.name} if I plan to preserve it?`,
      shortAnswer: `Yes, if you are buying it as a pair you intend to maintain, protect, and keep visually sharp instead of wearing it into neglect.`,
      answer: `Yes, if you are buying it as a pair you intend to maintain, protect, and keep visually sharp instead of wearing it into neglect. This page exists to connect the release decision to the service decision right away.`,
    },
  ];
}

export async function buildWorthRestoringPageModel(slug: string): Promise<ReleasePageModel | undefined> {
  const item = await getSneakerBySlug(slug, { includeNikePublic: false });
  if (!item || item.provider === 'nike-public' || !isWorthRestoring(item)) return undefined;

  const cities = (await getActiveSeoCities()).slice(0, 2);
  const editorial = getReleaseEditorialBySlug(item.slug);

  return {
    path: `/worth-restoring/${item.slug}`,
    canonicalUrl: `${SITE_URL}/worth-restoring/${item.slug}`,
    title: `${item.name} worth restoring? ShoeGlitch restoration read`,
    description: `Is ${item.name} worth restoring? ShoeGlitch breaks down the restoration score, preservation value, sole risk, and the service case for saving this pair properly.`,
    h1: `${item.name}: worth restoring?`,
    eyebrow: 'Restoration intelligence',
    intro:
      `${item.name} is the kind of release where the care question matters almost as much as the release question. This page turns the product record into a ShoeGlitch restoration decision instead of a generic product recap.`,
    aiSummary:
      `${item.name} currently scores ${item.scores.restoration} for restoration, ${item.scores.preservationValue} for preservation value, and ${item.scores.soleRisk} for sole risk.` +
      ` ShoeGlitch reads it as a stronger restoration candidate than a simple routine-clean candidate.`,
    summaryBullets: [
      `Restoration score: ${item.scores.restoration}`,
      `Preservation value: ${item.scores.preservationValue}`,
      `Sole risk: ${item.scores.soleRisk}`,
      `Market summary: ${formatCurrency(item.priceSummary.lowestAsk ?? item.priceSummary.averagePrice, item.priceSummary.currency)}`,
    ],
    item,
    recommendation: {
      eyebrow: 'Restoration decision',
      headline: 'Yes, this pair deserves a preservation plan.',
      body:
        'This is the kind of shoe where condition matters. The combination of collector value, finish risk, and long-term care upside is high enough that restoration is part of ownership, not an afterthought.',
      bullets: [
        `Restoration score ${item.scores.restoration} means the pair has real finish and preservation upside.`,
        `Preservation value ${item.scores.preservationValue} suggests this is a pair owners will care about keeping sharp over time.`,
        `Sole risk ${item.scores.soleRisk} means waiting too long can make the job harder and more expensive.`,
      ],
    },
    faqs: buildWorthRestoringFaqs(item),
    buyingLinks: [
      {
        href: `/book?intent=restoration&pair=${item.slug}`,
        label: 'Book restoration',
        description: 'Move this pair into the restoration flow instead of waiting for damage to compound.',
      },
      {
        href: `/releases/${item.slug}`,
        label: 'Open release brief',
        description: 'See the full release, pricing, and market summary for this pair.',
      },
      ...(item.marketUrl
        ? [
            {
              href: item.marketUrl,
              label: 'Track live market',
              description: 'Open the market page for the pair while evaluating long-term preservation value.',
            },
          ]
        : []),
    ].slice(0, 3),
    relatedLinks: [
      {
        href: '/shoe-restoration',
        label: 'Shoe restoration hub',
        description: 'See how ShoeGlitch frames restoration work and collector-care decisions.',
      },
      {
        href: `/intelligence/${item.slug}`,
        label: 'Open intelligence detail',
        description: 'Compare the full signal breakdown in the intelligence feed.',
      },
      ...cities.map((city) => ({
        href: `/shoe-restoration/${city.slug}`,
        label: `Restoration in ${city.name}`,
        description: `See the local restoration route for ${city.name}, ${city.state}.`,
      })),
    ].slice(0, 5),
    editorial,
  };
}

export async function buildWorthRestoringMetadata(slug: string): Promise<Metadata> {
  const model = await buildWorthRestoringPageModel(slug);
  if (!model) {
    return {
      title: 'Worth restoring? | Shoe Glitch',
      description: 'This ShoeGlitch restoration page could not be found.',
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

export async function getWorthRestoringRouteIndex() {
  const { getSneakerFeed } = await import('@/features/intelligence/service');
  const feed = await getSneakerFeed({ includeNikePublic: false });
  return feed.items
    .filter(isWorthRestoring)
    .map((item) => ({
      path: `/worth-restoring/${item.slug}`,
      updatedAt: item.lastUpdatedAt,
    }));
}
