import type { ReleaseEditorialEnrichment } from '@/features/releases/types';

const RELEASE_EDITORIAL: Record<string, ReleaseEditorialEnrichment> = {};

export function getReleaseEditorialBySlug(slug: string): ReleaseEditorialEnrichment {
  return (
    RELEASE_EDITORIAL[slug] ?? {
      status: 'unreviewed',
      reviewNote:
        'Manual editorial context has not been published for this release yet. ShoeGlitch is currently showing the structured release layer and service intelligence only.',
    }
  );
}
