'use client';

import { usePathname } from 'next/navigation';
import GrowthTracker from '@/components/growth/GrowthTracker';

export default function SitewideGrowthTracker() {
  const pathname = usePathname();

  return (
    <GrowthTracker
      routePath={pathname || '/'}
      pageTitle="Shoe Glitch public route"
      mode="global"
    />
  );
}
