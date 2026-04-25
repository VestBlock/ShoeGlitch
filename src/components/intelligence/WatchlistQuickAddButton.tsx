'use client';

import { useMemo, useState } from 'react';
import type { SneakerFeedItem } from '@/features/intelligence/types';
import RiveCheckmark from '@/components/intelligence/RiveCheckmark';

type State = 'idle' | 'saving' | 'saved' | 'error';

export default function WatchlistQuickAddButton({ item, compact = false }: { item: SneakerFeedItem; compact?: boolean }) {
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      brand: item.brand,
      model: item.silhouette,
      name: item.name,
      colorway: item.colorway,
      sku: item.sku,
      alertType: 'any' as const,
      isActive: true,
    }),
    [item],
  );

  async function handleSave() {
    if (state === 'saving' || state === 'saved') return;

    setState('saving');
    setMessage(null);

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        window.location.href = `/login?next=${next}`;
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error?.formErrors?.[0] ?? data?.error ?? 'Could not save this pair.');
      }

      setState('saved');
      setMessage(data?.existing ? 'Already in your watchlist.' : 'Saved to your watchlist.');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Could not save this pair.');
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleSave}
        className={compact ? 'btn-glitch min-h-[2.9rem] px-4 text-xs' : 'btn-glitch'}
        disabled={state === 'saving' || state === 'saved'}
      >
        <span className="flex items-center gap-2">
          {state === 'saved' ? <RiveCheckmark className="h-5 w-5 border-white/18 bg-white/12" /> : null}
          <span>{state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : 'Save to watchlist'}</span>
        </span>
      </button>
      {message ? (
        <div className={`text-right text-[11px] leading-4 ${state === 'error' ? 'text-glitch' : 'text-ink/50'}`}>
          {message}
        </div>
      ) : null}
    </div>
  );
}
