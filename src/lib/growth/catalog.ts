import type {
  GrowthCategorySeed,
  GrowthKeywordSeed,
  GrowthLocationSeed,
  GrowthRouteSpec,
  GrowthServiceSeed,
} from '@/lib/growth/types';

export const growthCategories: GrowthCategorySeed[] = [
  {
    slug: 'sneaker-cleaning',
    niche: 'premium sneaker care',
    serviceName: 'Sneaker Cleaning',
    enabled: true,
    commercialOffer: 'free shoe care quote',
  },
  {
    slug: 'shoe-restoration',
    niche: 'shoe restoration',
    serviceName: 'Shoe Restoration',
    enabled: true,
    commercialOffer: 'restoration assessment',
  },
  {
    slug: 'credit-repair',
    niche: 'credit repair',
    serviceName: 'Credit Repair',
    enabled: false,
    commercialOffer: 'free credit analysis',
  },
  {
    slug: 'business-funding',
    niche: 'business funding',
    serviceName: 'Business Funding',
    enabled: false,
    commercialOffer: 'funding readiness review',
  },
];

export const growthKeywordSeeds: GrowthKeywordSeed[] = [
  {
    slug: 'jordan-cleaning',
    keyword: 'Jordan cleaning',
    intent: 'commercial',
    niche: 'premium sneaker care',
    commercialAngle: 'Get premium Jordan cleaning with pickup, drop-off, or mail-in support.',
    problem: 'scuffed midsoles, dingy uppers, and worn presentation',
  },
  {
    slug: 'designer-sneaker-cleaning',
    keyword: 'designer sneaker cleaning',
    intent: 'transactional',
    niche: 'designer sneaker care',
    commercialAngle: 'Protect premium materials with detail-first cleaning and restoration.',
    problem: 'luxury materials that need careful handling',
  },
  {
    slug: 'suede-shoe-cleaning',
    keyword: 'suede shoe cleaning',
    intent: 'informational',
    niche: 'suede shoe care',
    commercialAngle: 'Restore nap, color, and finish without over-wetting delicate suede.',
    problem: 'flattened suede, salt marks, and uneven texture',
  },
  {
    slug: 'sole-whitening',
    keyword: 'sole whitening',
    intent: 'commercial',
    niche: 'sole restoration',
    commercialAngle: 'Bring yellowed soles back with a cleaner, brighter finish.',
    problem: 'oxidized or yellowed translucent soles',
  },
  {
    slug: 'shoe-restoration-cost',
    keyword: 'shoe restoration cost',
    intent: 'informational',
    niche: 'restoration pricing',
    commercialAngle: 'Understand what drives restoration pricing before you book.',
    problem: 'unclear pricing and uncertain turnaround expectations',
  },
  {
    slug: 'sneaker-cleaning-service',
    keyword: 'sneaker cleaning service',
    intent: 'transactional',
    niche: 'sneaker cleaning',
    commercialAngle: 'Book a tracked, photo-backed sneaker cleaning service online.',
    problem: 'finding a service you can trust with premium pairs',
  },
];

export const growthLocations: GrowthLocationSeed[] = [
  {
    city: 'Milwaukee',
    state: 'WI',
    slug: 'milwaukee',
    neighborhoods: [
      { name: 'Third Ward', slug: 'third-ward' },
      { name: 'Bay View', slug: 'bay-view' },
      { name: 'East Side', slug: 'east-side' },
    ],
  },
  {
    city: 'Memphis',
    state: 'TN',
    slug: 'memphis',
    neighborhoods: [
      { name: 'Downtown', slug: 'downtown' },
      { name: 'Midtown', slug: 'midtown' },
      { name: 'Cordova', slug: 'cordova' },
    ],
  },
  {
    city: 'Atlanta',
    state: 'GA',
    slug: 'atlanta',
    neighborhoods: [
      { name: 'Buckhead', slug: 'buckhead' },
      { name: 'Midtown', slug: 'midtown' },
      { name: 'Old Fourth Ward', slug: 'old-fourth-ward' },
    ],
  },
];

export const growthServices: GrowthServiceSeed[] = [
  {
    slug: 'sneaker-cleaning',
    name: 'Sneaker Cleaning',
    offer: 'free sneaker cleaning quote',
    nearMeLabel: 'Sneaker cleaning near me',
  },
  {
    slug: 'shoe-restoration',
    name: 'Shoe Restoration',
    offer: 'free restoration assessment',
    nearMeLabel: 'Shoe restoration near me',
  },
];

export function buildGrowthRouteIndex(): GrowthRouteSpec[] {
  const specs: GrowthRouteSpec[] = [];

  for (const category of growthCategories.filter((item) => item.enabled)) {
    for (const keyword of growthKeywordSeeds) {
      for (const location of growthLocations) {
        specs.push({
          kind: 'programmatic',
          path: `/${category.slug}/${keyword.slug}/${location.slug}`,
          primary: category.slug,
          secondary: keyword.slug,
          rest: [location.slug],
          category,
          keyword,
          location,
          intent: keyword.intent,
        });
      }
    }
  }

  for (const service of growthServices) {
    specs.push({
      kind: 'service-near-me',
      path: `/${service.slug}/near-me`,
      primary: service.slug,
      secondary: 'near-me',
      rest: [],
      service,
      location: growthLocations[0],
      intent: 'transactional',
    });

    for (const location of growthLocations) {
      specs.push({
        kind: 'service-city',
        path: `/${service.slug}/${location.slug}`,
        primary: service.slug,
        secondary: location.slug,
        rest: [],
        service,
        location,
        intent: 'transactional',
      });

      for (const neighborhood of location.neighborhoods) {
        specs.push({
          kind: 'service-neighborhood',
          path: `/${service.slug}/${location.slug}/${neighborhood.slug}`,
          primary: service.slug,
          secondary: location.slug,
          rest: [neighborhood.slug],
          service,
          location,
          neighborhood,
          intent: 'transactional',
        });
      }
    }
  }

  return specs;
}

export function findGrowthRoute(
  primary: string,
  secondary: string,
  rest: string[] = [],
): GrowthRouteSpec | undefined {
  return buildGrowthRouteIndex().find(
    (spec) =>
      spec.primary === primary &&
      spec.secondary === secondary &&
      spec.rest.join('/') === rest.join('/'),
  );
}
