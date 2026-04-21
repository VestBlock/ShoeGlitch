'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { OrdersTable, buildLookups } from '@/components/OrdersTable';
import { SearchBar } from '@/components/SearchBar';
import { cn } from '@/lib/utils';
import type { Order, City, Customer } from '@/types';

const FILTERS = [
  { k: 'all', label: 'All' },
  { k: 'active', label: 'Active' },
  { k: 'flagged', label: 'Flagged' },
  { k: 'completed', label: 'Completed' },
] as const;

interface Props {
  initialOrders: Order[];
  cities: City[];
  customers: Customer[];
}

export function AdminOrdersClient({ initialOrders, cities, customers }: Props) {
  const [filter, setFilter] = useState<typeof FILTERS[number]['k']>('active');
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = initialOrders;

    // Apply filter
    if (filter === 'active') result = result.filter(o => !['completed', 'cancelled'].includes(o.status));
    if (filter === 'flagged') result = result.filter(o => o.status === 'issue_flagged');
    if (filter === 'completed') result = result.filter(o => o.status === 'completed');

    // Apply city filter
    if (cityFilter) result = result.filter(o => o.cityId === cityFilter);

    // Apply search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => 
        o.code.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        customers.find(c => c.id === o.customerId)?.name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialOrders, filter, cityFilter, search, customers]);

  const lookups = buildLookups(cities, customers);

  return (
    <>
      <div className="mb-6">
        <SearchBar placeholder="Search by order code, ID, or customer..." onSearch={setSearch} />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={cn('chip', filter === f.k && 'chip-on')}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCityFilter(null)}
          className={cn('chip', !cityFilter && 'chip-on')}
        >
          All cities
        </button>
        {cities.map((c) => (
          <button
            key={c.id}
            onClick={() => setCityFilter(c.id)}
            className={cn('chip', cityFilter === c.id && 'chip-on')}
          >
            {c.name}
          </button>
        ))}
      </div>

      <OrdersTable orders={filtered} lookups={lookups} />
    </>
  );
}
