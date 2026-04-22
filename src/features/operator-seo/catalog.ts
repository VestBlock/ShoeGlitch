import type { OperatorRoleSlug } from '@/features/operator-seo/types';
import { SITE_URL } from '@/features/seo/catalog';

export { SITE_URL };

export const operatorRoleTemplates: Record<
  OperatorRoleSlug,
  {
    slug: OperatorRoleSlug;
    name: string;
    shortName: string;
    operatorLabel: string;
    cityIntent: string;
    primaryTier: 'starter' | 'pro' | 'luxury';
    defaultApplyLabel: string;
  }
> = {
  cleaning: {
    slug: 'cleaning',
    name: 'Sneaker Cleaning Operator',
    shortName: 'Cleaning',
    operatorLabel: 'cleaning operator',
    cityIntent: 'mobile sneaker cleaning opportunity',
    primaryTier: 'starter',
    defaultApplyLabel: 'Apply for cleaning',
  },
  restoration: {
    slug: 'restoration',
    name: 'Shoe Restoration Operator',
    shortName: 'Restoration',
    operatorLabel: 'restoration operator',
    cityIntent: 'shoe restoration business opportunity',
    primaryTier: 'pro',
    defaultApplyLabel: 'Apply for restoration',
  },
  'pickup-dropoff': {
    slug: 'pickup-dropoff',
    name: 'Pickup & Drop-Off Operator',
    shortName: 'Pickup & Drop-Off',
    operatorLabel: 'pickup and drop-off operator',
    cityIntent: 'pickup and drop-off side hustle opportunity',
    primaryTier: 'starter',
    defaultApplyLabel: 'Apply for pickup routes',
  },
};

export function listOperatorRoleTemplates() {
  return Object.values(operatorRoleTemplates);
}
