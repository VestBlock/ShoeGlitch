'use client';

import { useEffect } from 'react';

export default function GrowthTracker({
  routePath,
  pageTitle,
}: {
  routePath: string;
  pageTitle: string;
}) {
  useEffect(() => {
    void fetch('/api/growth/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routePath,
        eventName: 'page_view',
        metadata: { pageTitle },
      }),
    }).catch(() => undefined);

    const onClick = (event: MouseEvent) => {
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
          },
        }),
      }).catch(() => undefined);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [pageTitle, routePath]);

  return null;
}
