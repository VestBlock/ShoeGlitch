'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __shoeGlitchGrowthSpecificRoutes?: Set<string>;
  }
}

export default function GrowthTracker({
  routePath,
  pageTitle,
  mode = 'specific',
}: {
  routePath: string;
  pageTitle: string;
  mode?: 'specific' | 'global';
}) {
  useEffect(() => {
    window.__shoeGlitchGrowthSpecificRoutes ??= new Set<string>();
    if (mode === 'specific') {
      window.__shoeGlitchGrowthSpecificRoutes.add(routePath);
    }

    const sendPageView = () => {
      if (mode === 'global' && window.__shoeGlitchGrowthSpecificRoutes?.has(routePath)) {
        return;
      }

      void fetch('/api/growth/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routePath,
          eventName: 'page_view',
          metadata: { pageTitle, trackerMode: mode },
        }),
      }).catch(() => undefined);
    };

    const timer = window.setTimeout(sendPageView, mode === 'global' ? 120 : 0);

    const onClick = (event: MouseEvent) => {
      if (mode === 'global' && window.__shoeGlitchGrowthSpecificRoutes?.has(routePath)) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const cta = target?.closest<HTMLElement>('[data-growth-cta]');
      if (!cta) return;

      void fetch('/api/growth/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routePath,
          eventName: 'cta_click',
          ctaLabel: cta.dataset.growthCta ?? cta.textContent?.trim() ?? 'unknown',
          metadata: {
            href: cta.getAttribute('href'),
            trackerMode: mode,
          },
        }),
      }).catch(() => undefined);
    };

    document.addEventListener('click', onClick);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('click', onClick);
    };
  }, [mode, pageTitle, routePath]);

  return null;
}
