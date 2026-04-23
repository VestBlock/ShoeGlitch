import type { CleanerTier } from '@/types';

export type OperatorTierId = CleanerTier;

export interface OperatorTierDefinition {
  id: OperatorTierId;
  name: string;
  price: number;
  platformFeeRange: string;
  payoutRange: string;
  defaultPayoutRate: number;
  tagline: string;
  marketingSupport: string;
  territory: string;
  includes: string[];
  unlocks: string[];
  featured?: boolean;
}

export const OPERATOR_TIERS: Record<OperatorTierId, OperatorTierDefinition> = {
  starter: {
    id: 'starter',
    name: 'Basic',
    price: 349,
    platformFeeRange: '35-40%',
    payoutRange: '60-65%',
    defaultPayoutRate: 0.62,
    tagline: 'Self-marketed entry tier for basic cleaning jobs.',
    marketingSupport: 'Operator-led local marketing',
    territory: 'Open territory with no exclusivity',
    includes: [
      'Branded apron + 3 towels',
      'Brush set (horsehair, soft, stiff)',
      'Cleaning solution (60-day supply)',
      'Cleaner app access',
      'Fresh Start + Full Reset certification',
      'Open-market routing as jobs are available',
    ],
    unlocks: ['Fresh Start', 'Full Reset', 'Lace Lab', 'Detail Fix'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 599,
    platformFeeRange: '20-25%',
    payoutRange: '75-80%',
    defaultPayoutRate: 0.78,
    tagline: 'Lower platform fee, stronger tools, and serious service capability.',
    marketingSupport: 'Operator-led local marketing',
    territory: 'Priority consideration, but not exclusive',
    includes: [
      'Everything in Basic',
      'Steam brush + steamer',
      'Fabric-specific tools (suede, mesh, knit)',
      'Ice box + Ice Recovery solution',
      'Material-safe chemistry pack',
      'Revival certification training',
      'Priority routing as performance and city demand allow',
    ],
    unlocks: ['All Basic services', 'Fabric Rescue', 'Revival Package', 'Ice Recovery', 'Fresh Core', 'Street Shield'],
    featured: true,
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    price: 899,
    platformFeeRange: '5-10%',
    payoutRange: '90-95%',
    defaultPayoutRate: 0.92,
    tagline: 'Lowest platform fee, local ad support, and exclusive territory review.',
    marketingSupport: 'ShoeGlitch-supported digital ad spend in your area',
    territory: 'Exclusive territory, subject to approval and performance standards',
    includes: [
      'Everything in Pro',
      'Commercial steam cleaner brush system for premium/high-volume jobs',
      'Ice box + Ice Recovery solution',
      'Fine detail brush set (sizes 0-6)',
      'Louboutin-matched red lacquer + black/custom',
      'Sole prep solution + masking tape',
      'Drying rack',
      'Sole color certification + mentorship',
      'Area-level digital ad support after activation',
    ],
    unlocks: ['All Pro services', 'Sole Color', 'Red Bottom Touch-Up', 'Full Sole Repaint'],
  },
};

export const OPERATOR_TIER_LIST = [OPERATOR_TIERS.starter, OPERATOR_TIERS.pro, OPERATOR_TIERS.luxury];

export function getOperatorTierDefinition(tier: string | null | undefined): OperatorTierDefinition {
  if (tier === 'starter' || tier === 'pro' || tier === 'luxury') {
    return OPERATOR_TIERS[tier];
  }
  return OPERATOR_TIERS.pro;
}

