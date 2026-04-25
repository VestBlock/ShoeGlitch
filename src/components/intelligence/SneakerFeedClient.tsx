'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
  if (sort === 'market') next.sort((a, b) => b.scores.marketStrength - a.scores.marketStrength);
  if (sort === 'rarity') next.sort((a, b) => b.scores.rarity - a.scores.rarity);
  if (sort === 'service') next.sort((a, b) => b.scores.serviceFit - a.scores.serviceFit);
  if (sort === 'pressure') next.sort((a, b) => b.scores.releasePressure - a.scores.releasePressure);
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

  const feedItemVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.985 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1] as const,
        delay: Math.min(index * 0.06, 0.34),
      },
    }),
  };

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
      <motion.div
        className="sticky top-16 z-20 md:top-20"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <FeedFilters brands={brands} value={filters} onChange={setFilters} />
      </motion.div>

      <motion.div
        className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.68fr)]"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,20,44,0.92),rgba(10,15,31,0.98))] p-4 shadow-[0_24px_70px_rgba(10,15,31,0.16)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(0,229,255,0.20),transparent_26%),radial-gradient(circle_at_88%_30%,rgba(255,77,109,0.15),transparent_28%)]" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.3em] text-cyan/80">Pairs worth watching</div>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-bone">{filtered.length}</div>
            <div className="mt-2 max-w-lg text-sm leading-6 text-bone/68">
              Save a pair, follow the drop, and stay ready for the next release, restock, or price change that matters.
            </div>
          </div>
        </div>

        <FeedHealthBanner
          copy={
            feed.usedFallbackData
              ? 'Some prices are still catching up, but the feed is still anchored to live release timing and current retailer updates.'
              : 'Release timing and retailer updates are flowing across the current feed.'
          }
          tone={feed.usedFallbackData ? 'warn' : 'default'}
        />
      </motion.div>

      {filtered.length === 0 ? (
        <FeedEmptyState />
      ) : (
        <div className="mx-auto max-w-[58rem] space-y-5">
          {visibleItems.map((item, index) => (
            <motion.div
              key={`${item.provider}-${item.id}`}
              custom={index}
              variants={feedItemVariants}
              initial="hidden"
              animate="visible"
            >
              <SneakerCard item={item} />
            </motion.div>
          ))}

          <div ref={sentinelRef} className="flex items-center justify-center py-4">
            {hasMore ? (
              <div className="rounded-full border border-ink/10 bg-white/78 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/55 shadow-[0_14px_36px_rgba(10,15,31,0.05)] backdrop-blur-xl">
                Loading more pairs…
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
