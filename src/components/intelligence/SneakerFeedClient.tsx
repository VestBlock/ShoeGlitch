'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import FeedFilters from '@/components/intelligence/FeedFilters';
import { FeedEmptyState, FeedHealthBanner } from '@/components/intelligence/FeedState';
import SneakerCard from '@/components/intelligence/SneakerCard';
import type { SneakerFeedItem, SneakerFeedResult, SneakerFilterState } from '@/features/intelligence/types';

const initialFilters: SneakerFilterState = {
  search: '',
  brand: 'all',
  opportunity: 'all',
  sort: 'release',
};

function sortItems(items: SneakerFeedItem[], sort: SneakerFilterState['sort']) {
  const next = [...items];

  if (sort === 'cleaning') next.sort((a, b) => b.scores.cleaning - a.scores.cleaning);
  if (sort === 'restoration') next.sort((a, b) => b.scores.restoration - a.scores.restoration);
  if (sort === 'flip') next.sort((a, b) => b.scores.flipPotential - a.scores.flipPotential);
  if (sort === 'urgency') next.sort((a, b) => b.scores.urgency - a.scores.urgency);
  if (sort === 'release') {
    next.sort((a, b) => new Date(a.release.date).getTime() - new Date(b.release.date).getTime());
  }

  return next;
}

export default function SneakerFeedClient({ feed }: { feed: SneakerFeedResult }) {
  const [filters, setFilters] = useState(initialFilters);
  const [visibleCount, setVisibleCount] = useState(6);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const brands = useMemo(() => [...new Set(feed.items.map((item) => item.brand))].sort(), [feed.items]);

  const filtered = useMemo(
    () =>
      sortItems(
        feed.items.filter((item) => {
          const haystack = `${item.name} ${item.brand} ${item.silhouette} ${item.colorway}`.toLowerCase();
          const matchesSearch = !filters.search || haystack.includes(filters.search.toLowerCase());
          const matchesBrand = filters.brand === 'all' || item.brand === filters.brand;
          const matchesOpportunity =
            filters.opportunity === 'all' || item.opportunityFlags.includes(filters.opportunity);

          return matchesSearch && matchesBrand && matchesOpportunity;
        }),
        filters.sort,
      ),
    [feed.items, filters],
  );

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    setVisibleCount(6);
  }, [filters]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + 4, filtered.length));
        }
      },
      { rootMargin: '280px 0px' },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [filtered.length, hasMore]);

  return (
    <div className="space-y-6">
      <div className="sticky top-20 z-20">
        <FeedFilters brands={brands} value={filters} onChange={setFilters} />
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.68fr)]">
        <FeedHealthBanner
          copy={`${filtered.length} sneakers ready for release watching, cleaning hooks, restoration calls, and later affiliate layers.`}
        />
        <FeedHealthBanner
          copy={
            feed.usedFallbackData
              ? 'Public-source protection is active. Market pricing is still partial, but the feed is now anchored to real release records instead of filler-only cards.'
              : 'Primary source coverage is live with no fallback records needed.'
          }
          tone={feed.usedFallbackData ? 'warn' : 'default'}
        />
      </div>

      {filtered.length === 0 ? (
        <FeedEmptyState />
      ) : (
        <div className="mx-auto max-w-[58rem] space-y-5">
          {visibleItems.map((item) => (
            <SneakerCard key={`${item.provider}-${item.id}`} item={item} />
          ))}

          <div ref={sentinelRef} className="flex items-center justify-center py-4">
            {hasMore ? (
              <div className="rounded-full border border-ink/10 bg-white/78 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/55 shadow-[0_14px_36px_rgba(10,15,31,0.05)] backdrop-blur-xl">
                Loading more releases…
              </div>
            ) : (
              <div className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/40">
                End of current feed
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
