'use client';

import type { SneakerFilterState, SneakerOpportunityKind } from '@/features/intelligence/types';

export default function FeedFilters({
  brands,
  value,
  onChange,
}: {
  brands: string[];
  value: SneakerFilterState;
  onChange: (next: SneakerFilterState) => void;
}) {
  const setField = <K extends keyof SneakerFilterState>(field: K, nextValue: SneakerFilterState[K]) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <div className="grid gap-3 rounded-[1.6rem] border border-ink/10 bg-white/80 p-4 shadow-[0_18px_48px_rgba(10,15,31,0.06)] backdrop-blur-xl md:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.7fr))]">
      <label className="block">
        <span className="label">Search</span>
        <input
          className="input"
          type="search"
          value={value.search}
          placeholder="Jordan 4, Samba, runner..."
          onChange={(event) => setField('search', event.target.value)}
        />
      </label>

      <label className="block">
        <span className="label">Brand</span>
        <select className="input" value={value.brand} onChange={(event) => setField('brand', event.target.value)}>
          <option value="all">All brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label">Why save it</span>
        <select
          className="input"
          value={value.opportunity}
          onChange={(event) => setField('opportunity', event.target.value as 'all' | SneakerOpportunityKind)}
        >
          <option value="all">All reasons</option>
          <option value="upcoming">Upcoming drops</option>
          <option value="cleaning">Easy care later</option>
          <option value="restoration">Worth restoring later</option>
          <option value="flip">Resale watch</option>
          <option value="watch">Alert priority</option>
        </select>
      </label>

      <label className="block">
        <span className="label">Sort</span>
        <select className="input" value={value.sort} onChange={(event) => setField('sort', event.target.value as SneakerFilterState['sort'])}>
          <option value="release">Soonest drop</option>
          <option value="pressure">Best to save now</option>
          <option value="market">Strongest demand</option>
          <option value="cleaning">Easy to clean later</option>
          <option value="restoration">Worth restoring later</option>
          <option value="service">Best care candidate</option>
          <option value="rarity">Collector interest</option>
        </select>
      </label>
    </div>
  );
}
