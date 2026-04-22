export interface SnapshotReleasePayload {
  sourceId: string;
  headline: string;
  brandName: string;
  model: string;
  colorDescription: string;
  styleCode: string;
  launchDate: string;
  retailUsd: number;
  story: string;
  heroImage: string;
  sourceUrl: string;
  materials: string[];
  retailerLinks: Array<{ label: string; href: string; retailer: string }>;
  market?: {
    estimatedResale?: number;
    lowAsk?: number;
    lastSale?: number;
  };
}

export interface MockOpportunityPayload {
  seedId: string;
  name: string;
  brand: string;
  silhouette: string;
  colorway: string;
  sku: string;
  releaseDate: string;
  retailUsd: number;
  description: string;
  imageUrl: string;
  materials: string[];
  suggestedFlags: Array<'cleaning' | 'restoration' | 'flip' | 'watch' | 'upcoming'>;
  marketPlaceholder?: number;
}

const poster = '/ShoeTest-poster.png';

export const SNAPSHOT_RELEASES: SnapshotReleasePayload[] = [
  {
    sourceId: 'snapshot-aj4-white-navy',
    headline: 'Air Jordan 4 White Navy',
    brandName: 'Jordan',
    model: 'Air Jordan 4',
    colorDescription: 'White / Midnight Navy',
    styleCode: 'FV5029-141',
    launchDate: '2026-04-25T15:00:00.000Z',
    retailUsd: 225,
    story:
      'A clean white leather build with navy support pieces and classic Jordan 4 blocking. Strong day-one cleaning demand thanks to light uppers and visible midsoles.',
    heroImage: poster,
    sourceUrl: 'https://www.shoeglitch.com/intelligence',
    materials: ['leather', 'mesh', 'white-upper'],
    retailerLinks: [
      { label: 'Release details', href: '/intelligence/air-jordan-4-white-navy', retailer: 'Shoe Glitch feed' },
    ],
    market: {
      estimatedResale: 276,
      lowAsk: 289,
      lastSale: 268,
    },
  },
  {
    sourceId: 'snapshot-nb-1906r-silver',
    headline: 'New Balance 1906R Silver Mist',
    brandName: 'New Balance',
    model: '1906R',
    colorDescription: 'Silver Mist / Concrete',
    styleCode: 'M1906RSM',
    launchDate: '2026-05-03T15:00:00.000Z',
    retailUsd: 170,
    story:
      'Mesh-heavy runners with metallic hits tend to move quickly and pick up wear fast. Good candidate for repeat cleaning and market-watch content.',
    heroImage: poster,
    sourceUrl: 'https://www.shoeglitch.com/intelligence',
    materials: ['mesh', 'synthetic', 'silver-finish'],
    retailerLinks: [
      { label: 'Launch watch', href: '/intelligence/new-balance-1906r-silver-mist', retailer: 'Shoe Glitch feed' },
    ],
    market: {
      estimatedResale: 205,
      lowAsk: 214,
      lastSale: 198,
    },
  },
  {
    sourceId: 'snapshot-asics-k14-cream',
    headline: 'ASICS GEL-KAYANO 14 Cream Black',
    brandName: 'ASICS',
    model: 'GEL-KAYANO 14',
    colorDescription: 'Cream / Black',
    styleCode: '1203A537-103',
    launchDate: '2026-05-16T15:00:00.000Z',
    retailUsd: 165,
    story:
      'A wearable runner silhouette with a strong lifestyle audience. This one is more about steady cleaning demand than big flip upside.',
    heroImage: poster,
    sourceUrl: 'https://www.shoeglitch.com/intelligence',
    materials: ['mesh', 'synthetic', 'cream-upper'],
    retailerLinks: [
      { label: 'Watch release', href: '/intelligence/asics-gel-kayano-14-cream-black', retailer: 'Shoe Glitch feed' },
    ],
  },
];

export const MOCK_OPPORTUNITIES: MockOpportunityPayload[] = [
  {
    seedId: 'mock-samba-cream-gum',
    name: 'adidas Samba OG Cream Gum',
    brand: 'adidas',
    silhouette: 'Samba OG',
    colorway: 'Cream / Gum',
    sku: 'JQ8841',
    releaseDate: '2026-05-09T15:00:00.000Z',
    retailUsd: 120,
    description:
      'Light suede, cream leather, and a gum sole make this a strong cleaning and touch-up candidate once the first wear cycle hits.',
    imageUrl: poster,
    materials: ['suede', 'leather', 'cream-upper', 'gum-sole'],
    suggestedFlags: ['cleaning', 'watch'],
  },
  {
    seedId: 'mock-aj1-black-toe',
    name: 'Air Jordan 1 High Black Toe Reissue',
    brand: 'Jordan',
    silhouette: 'Air Jordan 1 High',
    colorway: 'Black / Varsity Red',
    sku: 'DZ5485-106',
    releaseDate: '2026-06-06T15:00:00.000Z',
    retailUsd: 185,
    description:
      'A classic retro shape with collector appeal. Restoration upside is higher here than on a general release runner, even before true market data arrives.',
    imageUrl: poster,
    materials: ['leather', 'white-upper', 'collector-lean'],
    suggestedFlags: ['restoration', 'flip', 'upcoming'],
    marketPlaceholder: 238,
  },
  {
    seedId: 'mock-nike-vomero-pearl',
    name: 'Nike Zoom Vomero 5 Pearl',
    brand: 'Nike',
    silhouette: 'Zoom Vomero 5',
    colorway: 'Pearl / Vast Grey',
    sku: 'HV6410-001',
    releaseDate: '2026-04-29T15:00:00.000Z',
    retailUsd: 160,
    description:
      'Runner demand stays strong and the light mesh package is easy to understand as a cleaning lead magnet, even without hard resale coverage yet.',
    imageUrl: poster,
    materials: ['mesh', 'synthetic', 'light-upper'],
    suggestedFlags: ['cleaning', 'upcoming'],
  },
];
