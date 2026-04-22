'use client';

import { useMemo, useState } from 'react';
import { formatDate } from '@/lib/utils';
import type {
  AlertHistoryItem,
  WatchlistAlertType,
  WatchlistItemRecord,
} from '@/features/intelligence/watchlist/types';

const BRAND_OPTIONS = ['Nike', 'Jordan', 'Adidas', 'New Balance', 'ASICS', 'Converse', 'Puma', 'Reebok', 'Vans', 'Other'];

interface WatchlistFormState {
  brandChoice: string;
  customBrand: string;
  model: string;
  name: string;
  colorway: string;
  sku: string;
  size: string;
  targetPrice: string;
  alertType: WatchlistAlertType;
  isActive: boolean;
}

const emptyForm: WatchlistFormState = {
  brandChoice: 'Nike',
  customBrand: '',
  model: '',
  name: '',
  colorway: '',
  sku: '',
  size: '',
  targetPrice: '',
  alertType: 'any',
  isActive: true,
};

function toFormState(item?: Partial<WatchlistItemRecord> | null): WatchlistFormState {
  if (!item) return emptyForm;
  const knownBrand = item.brand && BRAND_OPTIONS.includes(item.brand) ? item.brand : item.brand ? 'Other' : 'Nike';
  return {
    brandChoice: knownBrand,
    customBrand: knownBrand === 'Other' ? item.brand ?? '' : '',
    model: item.model ?? '',
    name: item.name ?? '',
    colorway: item.colorway ?? '',
    sku: item.sku ?? '',
    size: item.size ?? '',
    targetPrice: item.targetPrice != null ? String(item.targetPrice) : '',
    alertType: item.alertType ?? 'any',
    isActive: item.isActive ?? true,
  };
}

function payloadFromState(state: WatchlistFormState) {
  return {
    brand: state.brandChoice === 'Other' ? state.customBrand.trim() : state.brandChoice,
    model: state.model.trim(),
    name: state.name.trim() || null,
    colorway: state.colorway.trim() || null,
    sku: state.sku.trim() || null,
    size: state.size.trim() || null,
    targetPrice: state.targetPrice.trim() ? Number(state.targetPrice) : null,
    alertType: state.alertType,
    isActive: state.isActive,
  };
}

function deliveryLabel(status: AlertHistoryItem['delivery']['status']) {
  if (status === 'sent') return 'Sent';
  if (status === 'skipped_duplicate') return 'Skipped duplicate';
  return 'Failed';
}

export default function WatchlistManager({
  initialItems,
  initialHistory,
  prefill,
}: {
  initialItems: WatchlistItemRecord[];
  initialHistory: AlertHistoryItem[];
  prefill?: Partial<WatchlistItemRecord> | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [history] = useState(initialHistory);
  const [form, setForm] = useState<WatchlistFormState>(() => toFormState(prefill));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(prefill ? 'Pair details pulled in from the intelligence feed.' : null);
  const [error, setError] = useState<string | null>(null);

  const resolvedBrand = useMemo(
    () => (form.brandChoice === 'Other' ? form.customBrand.trim() : form.brandChoice),
    [form.brandChoice, form.customBrand],
  );

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const payload = payloadFromState(form);
      if (!payload.brand || !payload.model) {
        throw new Error('Brand and shoe title are required.');
      }

      const response = await fetch(editingId ? `/api/watchlist/${editingId}` : '/api/watchlist', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.formErrors?.[0] ?? data.error ?? 'Could not save watchlist item.');

      const nextItem = data.item as WatchlistItemRecord;
      setItems((current) =>
        editingId ? current.map((item) => (item.id === editingId ? nextItem : item)) : [nextItem, ...current],
      );
      setMessage(editingId ? 'Watchlist item updated.' : 'Watchlist item saved.');
      setEditingId(null);
      setForm(emptyForm);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save watchlist item.');
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(id: string) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? 'Could not remove watchlist item.');
      }
      setItems((current) => current.filter((item) => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      setMessage('Watchlist item removed.');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not remove watchlist item.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(item: WatchlistItemRecord) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/watchlist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not update watchlist item.');
      setItems((current) => current.map((entry) => (entry.id === item.id ? data.item : entry)));
      setMessage(item.isActive ? 'Watch paused.' : 'Watch reactivated.');
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Could not update watchlist item.');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item: WatchlistItemRecord) {
    setEditingId(item.id);
    setForm(toFormState(item));
    setMessage(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-ink/10 bg-white/84 p-6 shadow-[0_18px_48px_rgba(10,15,31,0.06)] backdrop-blur-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Sneaker watchlist</div>
            <h2 className="h-display mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] text-ink">
              Save pairs and catch releases, restocks, or price drops.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink/64">
            Build a list around the pairs you care about, then let Shoe Glitch send alerts when a matching event lands.
          </p>
        </div>

        {message ? (
          <div className="mt-5 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mt-5 rounded-[1rem] border border-glitch/18 bg-glitch/[0.06] px-4 py-3 text-sm text-ink">
            {error}
          </div>
        ) : null}

        <form className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={submitForm}>
          <label className="block">
            <span className="label">Brand</span>
            <select
              className="input"
              value={form.brandChoice}
              onChange={(event) => setForm((current) => ({ ...current, brandChoice: event.target.value }))}
            >
              {BRAND_OPTIONS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

          {form.brandChoice === 'Other' ? (
            <label className="block">
              <span className="label">Custom brand</span>
              <input
                className="input"
                value={form.customBrand}
                onChange={(event) => setForm((current) => ({ ...current, customBrand: event.target.value }))}
                placeholder="Maison Mihara, Salomon..."
              />
            </label>
          ) : null}

          <label className="block">
            <span className="label">Shoe title</span>
            <input
              className="input"
              value={form.model}
              onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
              placeholder="Jordan 5, Air Max 95, Foamposite..."
            />
          </label>

          <label className="block">
            <span className="label">Display name</span>
            <input
              className="input"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Optional if you want a cleaner label"
            />
          </label>

          <label className="block">
            <span className="label">Colorway</span>
            <input
              className="input"
              value={form.colorway}
              onChange={(event) => setForm((current) => ({ ...current, colorway: event.target.value }))}
              placeholder="Black / Metallic Silver"
            />
          </label>

          <label className="block">
            <span className="label">SKU</span>
            <input
              className="input"
              value={form.sku}
              onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
              placeholder="FV5029-141"
            />
          </label>

          <label className="block">
            <span className="label">Size</span>
            <input
              className="input"
              value={form.size}
              onChange={(event) => setForm((current) => ({ ...current, size: event.target.value }))}
              placeholder="10.5"
            />
          </label>

          <label className="block">
            <span className="label">Target price</span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              value={form.targetPrice}
              onChange={(event) => setForm((current) => ({ ...current, targetPrice: event.target.value }))}
              placeholder="Optional"
            />
          </label>

          <label className="block">
            <span className="label">Alert type</span>
            <select
              className="input"
              value={form.alertType}
              onChange={(event) => setForm((current) => ({ ...current, alertType: event.target.value as WatchlistAlertType }))}
            >
              <option value="any">Any event</option>
              <option value="release">Release only</option>
              <option value="restock">Restock only</option>
              <option value="price_drop">Price drop only</option>
            </select>
          </label>

          <div className="md:col-span-2 xl:col-span-4 flex flex-wrap items-center gap-3 pt-2">
            <button disabled={busy} className="btn-glitch min-w-[12rem]">
              {busy ? 'Saving…' : editingId ? 'Update watch →' : 'Save to watchlist →'}
            </button>
            {editingId ? (
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(prefill ? toFormState(prefill) : emptyForm);
                  setMessage(null);
                  setError(null);
                }}
              >
                Cancel edit
              </button>
            ) : null}
            <div className="text-sm text-ink/58">
              Current selection: <strong>{resolvedBrand || 'Brand'}</strong> · {form.model || 'Shoe title'}
            </div>
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white/84 p-6 shadow-[0_18px_48px_rgba(10,15,31,0.06)] backdrop-blur-xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Current watchlist</div>
          <h3 className="h-display mt-4 text-[clamp(1.8rem,3vw,2.8rem)] leading-[0.95] text-ink">Pairs you are monitoring.</h3>

          {items.length === 0 ? (
            <div className="mt-6 rounded-[1.3rem] border border-dashed border-ink/15 bg-bone-soft px-5 py-8 text-sm text-ink/64">
              No watches yet. Save a pair from the intelligence feed or build one manually above.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-[1.3rem] border border-ink/10 bg-bone-soft px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-glitch/85">
                        {item.isActive ? 'Active watch' : 'Paused watch'}
                      </div>
                      <div className="mt-2 text-xl font-semibold text-ink">
                        {[item.brand, item.model, item.colorway].filter(Boolean).join(' · ')}
                      </div>
                      <div className="mt-2 text-sm text-ink/60">
                        {item.sku ? `SKU ${item.sku}` : 'No SKU yet'}{item.size ? ` · Size ${item.size}` : ''}{item.targetPrice ? ` · Target $${item.targetPrice}` : ''}{` · ${item.alertType.replace('_', ' ')}`}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn-outline min-h-[2.7rem] px-3 text-xs" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="btn-outline min-h-[2.7rem] px-3 text-xs" onClick={() => toggleActive(item)}>
                        {item.isActive ? 'Pause' : 'Reactivate'}
                      </button>
                      <button type="button" className="btn-outline min-h-[2.7rem] px-3 text-xs" onClick={() => removeItem(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white/84 p-6 shadow-[0_18px_48px_rgba(10,15,31,0.06)] backdrop-blur-xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Alert history</div>
          <h3 className="h-display mt-4 text-[clamp(1.8rem,3vw,2.8rem)] leading-[0.95] text-ink">Emails already sent.</h3>

          {history.length === 0 ? (
            <div className="mt-6 rounded-[1.3rem] border border-dashed border-ink/15 bg-bone-soft px-5 py-8 text-sm text-ink/64">
              No alerts have fired yet. Once a release, restock, or price event matches your watchlist, it will show up here.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {history.map(({ delivery, event, watchlistItem }) => (
                <div key={delivery.id} className="rounded-[1.3rem] border border-ink/10 bg-bone-soft px-5 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-glitch/85">
                    {deliveryLabel(delivery.status)}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-ink">{event.name}</div>
                  <div className="mt-2 text-sm text-ink/62">
                    {event.eventType.replace('_', ' ')} · {formatDate(event.eventDate)} · watching {watchlistItem.brand} {watchlistItem.model}
                  </div>
                  {event.price ? <div className="mt-2 text-sm text-ink/58">Event price ${event.price}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
