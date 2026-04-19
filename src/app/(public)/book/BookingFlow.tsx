'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zipLookupAction, quoteAction } from './actions';
import { startStripeCheckoutAction } from './stripe-actions';
import type { Quote } from '@/lib/pricing';
import type { ResolvedService } from '@/services/catalog';
import type { City } from '@/types';
import { Badge, StatusDot } from '@/components/ui';
import { cn } from '@/lib/utils';

type Step = 0 | 1 | 2 | 3 | 4 | 5;

interface Props {
  cities: City[];
  servicesByCity: Record<string, { primary: ResolvedService[]; addOns: ResolvedService[] }>;
}

const SHOE_CATEGORIES = [
  { id: 'sneakers', label: 'Sneakers' },
  { id: 'designer_sneakers', label: 'Designer Sneakers' },
  { id: 'womens_heels', label: "Women's Heels" },
  { id: 'red_bottom_heels', label: 'Red-Bottom Heels' },
  { id: 'boots', label: 'Boots' },
  { id: 'kids', label: 'Kids' },
  { id: 'other', label: 'Other' },
] as const;

const STEPS = [
  'Location',
  'Fulfillment',
  'Shoes',
  'Service',
  'Details',
  'Review',
];

export function BookingFlow({ cities, servicesByCity }: Props) {
  const search = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<Step>(0);

  // State shape mirrors the server action schema.
  const [cityId, setCityId] = useState<string>(search.get('city') ?? '');
  const [serviceAreaId, setServiceAreaId] = useState<string | undefined>(undefined);
  const [zip, setZip] = useState('');
  const [zipChecked, setZipChecked] = useState(false);
  const [zipMessage, setZipMessage] = useState<string | null>(null);

  const initialMode = search.get('mode') as 'pickup' | 'dropoff' | 'mailin' | null;
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'dropoff' | 'mailin'>(
    initialMode ?? 'pickup',
  );

  const [shoeCategory, setShoeCategory] =
    useState<(typeof SHOE_CATEGORIES)[number]['id']>('sneakers');
  const [pairCount, setPairCount] = useState(1);

  const initialService = search.get('service');
  const [primaryServiceId, setPrimaryServiceId] = useState<string>('');
  const [addOnServiceIds, setAddOnServiceIds] = useState<string[]>([]);
  const [isRush, setIsRush] = useState(false);

  const [notes, setNotes] = useState('');
  const [conditionIssues, setConditionIssues] = useState('');
  const [address, setAddress] = useState({ line1: '', line2: '', city: '', state: '', zip: '' });
  const [couponCode, setCouponCode] = useState('');

  const [q, setQuote] = useState<Quote | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentCity = useMemo(() => cities.find((c) => c.id === cityId), [cities, cityId]);
  const catalog = cityId ? servicesByCity[cityId] : undefined;

  // Set a default service once the city is picked (or from URL param)
  useEffect(() => {
    if (!catalog) return;
    if (primaryServiceId) return;
    if (initialService) {
      const m = catalog.primary.find((s) => s.slug === initialService);
      if (m) { setPrimaryServiceId(m.id); return; }
    }
    setPrimaryServiceId(catalog.primary[0]?.id ?? '');
  }, [catalog, initialService, primaryServiceId]);

  // Recompute quote whenever inputs change
  useEffect(() => {
    if (!cityId || !primaryServiceId) { setQuote(null); return; }
    startTransition(async () => {
      const res = await quoteAction({
        cityId,
        primaryServiceId,
        addOnServiceIds,
        fulfillmentMethod,
        shoeCategory,
        pairCount,
        isRush,
        couponCode: couponCode || undefined,
      });
      setQuote(res);
    });
  }, [cityId, primaryServiceId, addOnServiceIds, fulfillmentMethod, shoeCategory, pairCount, isRush, couponCode]);

  const checkZip = async () => {
    const r = await zipLookupAction(zip);
    setZipChecked(true);
    if (r.covered) {
      setCityId(r.cityId!);
      setServiceAreaId(r.serviceAreaId);
      setZipMessage(`✓ ${r.cityName} · ${r.serviceAreaName}`);
      setAddress((a) => ({ ...a, zip, city: r.cityName ?? '', state: cities.find(c => c.id === r.cityId)?.state ?? '' }));
    } else {
      setZipMessage(r.reason ?? 'No coverage');
      setFulfillmentMethod('mailin');
    }
  };

  const toggleAddOn = (id: string) => {
    setAddOnServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const canContinue: Record<Step, boolean> = {
    0: Boolean(cityId) || fulfillmentMethod === 'mailin',
    1: Boolean(fulfillmentMethod && cityId),
    2: Boolean(shoeCategory && pairCount >= 1),
    3: Boolean(primaryServiceId),
    4: fulfillmentMethod !== 'pickup' || (address.line1 && address.zip ? true : false),
    5: true,
  };

  const submit = () => {
    startTransition(async () => {
      await startStripeCheckoutAction({
        cityId,
        serviceAreaId,
        fulfillmentMethod,
        shoeCategory,
        pairCount,
        primaryServiceId,
        addOnServiceIds,
        isRush,
        couponCode: couponCode || undefined,
        notes: notes || undefined,
        conditionIssues: conditionIssues || undefined,
        addressLine1: address.line1,
        addressLine2: address.line2,
        addressCity: address.city,
        addressState: address.state,
        addressZip: address.zip,
      });
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main column */}
      <div className="lg:col-span-2">
        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center gap-1 flex-wrap">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => i < step && setStep(i as Step)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition',
                  i === step && 'bg-ink text-bone',
                  i < step && 'bg-bone-soft text-ink cursor-pointer hover:bg-ink/10',
                  i > step && 'text-ink/30',
                )}
              >
                <span className="font-mono">0{i + 1}</span>
                <span>{s}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 rail"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
        </div>

        {/* STEP 0 — Location */}
        {step === 0 && (
          <Panel title="Where are we cleaning?" subtitle="Enter your ZIP or pick a city. Mail-in works from anywhere.">
            <label className="label">Your ZIP code</label>
            <div className="flex gap-3 max-w-md">
              <input
                className="input"
                inputMode="numeric"
                maxLength={5}
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="e.g. 38112"
              />
              <button onClick={checkZip} className="btn-primary shrink-0">Check</button>
            </div>
            {zipChecked && (
              <p className={cn('mt-3 text-sm', cityId ? 'text-neon' : 'text-glitch')}>{zipMessage}</p>
            )}

            <div className="mt-10">
              <label className="label">Or pick a city</label>
              <div className="flex flex-wrap gap-2">
                {cities.filter(c => c.active).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCityId(c.id); setServiceAreaId(undefined); }}
                    className={cn('chip', cityId === c.id && 'chip-on')}
                  >
                    {c.name}, {c.state}
                  </button>
                ))}
                <button
                  onClick={() => { setFulfillmentMethod('mailin'); setCityId(cities[0]?.id ?? ''); }}
                  className={cn('chip', fulfillmentMethod === 'mailin' && !cityId && 'chip-on')}
                >
                  📦 Mail-in from anywhere
                </button>
              </div>
            </div>
          </Panel>
        )}

        {/* STEP 1 — Fulfillment */}
        {step === 1 && (
          <Panel title="How do you want to get them to us?">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { k: 'pickup' as const, t: 'Local Pickup', d: 'We come to your door.', fee: `$${currentCity?.defaultPickupFee ?? 0}` },
                { k: 'dropoff' as const, t: 'Drop-Off', d: 'Bring them to our hub.', fee: 'Free' },
                { k: 'mailin' as const, t: 'Mail-In', d: 'Ship them in, we ship back.', fee: `$${currentCity?.defaultMailInReturnFee ?? 0} return` },
              ].map((m) => (
                <button
                  key={m.k}
                  onClick={() => setFulfillmentMethod(m.k)}
                  className={cn(
                    'card p-6 text-left card-lift',
                    fulfillmentMethod === m.k && 'ring-2 ring-ink',
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="h-display text-2xl">{m.t}</h4>
                    <Badge>{m.fee}</Badge>
                  </div>
                  <p className="text-sm text-ink/60">{m.d}</p>
                </button>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isRush} onChange={(e) => setIsRush(e.target.checked)} className="h-5 w-5 accent-glitch" />
                <span className="text-sm">Rush service <span className="text-ink/50">(+${currentCity?.defaultRushFee ?? 0})</span></span>
              </label>
            </div>
          </Panel>
        )}

        {/* STEP 2 — Shoes */}
        {step === 2 && (
          <Panel title="Tell us about the shoes.">
            <label className="label">Category</label>
            <div className="flex flex-wrap gap-2 mb-8">
              {SHOE_CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setShoeCategory(c.id)}
                  className={cn('chip', shoeCategory === c.id && 'chip-on')}>{c.label}</button>
              ))}
            </div>
            <label className="label">How many pairs?</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setPairCount((n) => Math.max(1, n - 1))} className="btn-outline w-12 h-12 p-0 text-xl">−</button>
              <div className="h-display text-5xl min-w-[60px] text-center">{pairCount}</div>
              <button onClick={() => setPairCount((n) => Math.min(10, n + 1))} className="btn-outline w-12 h-12 p-0 text-xl">+</button>
            </div>
          </Panel>
        )}

        {/* STEP 3 — Service */}
        {step === 3 && catalog && (
          <Panel title="Pick your service." subtitle={`Pricing reflects ${currentCity?.name}.`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {catalog.primary.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPrimaryServiceId(s.id)}
                  className={cn('card p-5 text-left card-lift', primaryServiceId === s.id && 'ring-2 ring-ink')}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="h-display text-2xl">{s.name}</h4>
                    <div className="h-display text-xl">${s.resolvedPrice}</div>
                  </div>
                  <p className="text-xs text-ink/50 italic mt-1">{s.tagline}</p>
                  <p className="text-xs text-ink/70 mt-2 line-clamp-2">{s.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-10">
              <label className="label">Add-ons (optional)</label>
              <div className="flex flex-wrap gap-2">
                {catalog.addOns.map((a) => (
                  <button key={a.id} onClick={() => toggleAddOn(a.id)}
                    className={cn('chip', addOnServiceIds.includes(a.id) && 'chip-on')}>
                    {a.name} <span className="opacity-70">+${a.resolvedPrice}</span>
                  </button>
                ))}
              </div>
            </div>
          </Panel>
        )}

        {/* STEP 4 — Details */}
        {step === 4 && (
          <Panel title="Details & logistics.">
            {fulfillmentMethod === 'pickup' && (
              <>
                <label className="label">Pickup address</label>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
                  <input className="input md:col-span-6" placeholder="Street address" value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
                  <input className="input md:col-span-6" placeholder="Apt / suite (optional)" value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
                  <input className="input md:col-span-3" placeholder="City" value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                  <input className="input md:col-span-1" placeholder="ST" value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })} maxLength={2} />
                  <input className="input md:col-span-2" placeholder="ZIP" value={address.zip}
                    onChange={(e) => setAddress({ ...address, zip: e.target.value })} maxLength={5} />
                </div>
              </>
            )}

            {fulfillmentMethod === 'mailin' && (
              <div className="card p-5 mb-6 bg-bone-soft">
                <p className="text-sm"><strong>You'll ship to:</strong> {currentCity?.hubAddress ?? 'Our central hub'} — packing instructions are emailed after booking.</p>
              </div>
            )}

            <label className="label">Condition issues (optional)</label>
            <textarea className="input mb-6 min-h-[80px]" placeholder="e.g. scuff on left toe, yellowing on sole, loose stitching…"
              value={conditionIssues} onChange={(e) => setConditionIssues(e.target.value)} />

            <label className="label">Notes for the cleaner (optional)</label>
            <textarea className="input mb-6 min-h-[80px]" placeholder="Anything special we should know?"
              value={notes} onChange={(e) => setNotes(e.target.value)} />

            <label className="label">Coupon code</label>
            <input className="input max-w-xs" placeholder="FIRST10"
              value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
          </Panel>
        )}

        {/* STEP 5 — Review */}
        {step === 5 && q && (
          <Panel title="Review & confirm.">
            <div className="card p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-mono text-xs text-ink/40">SUMMARY</div>
                  <h4 className="h-display text-3xl">{currentCity?.name}</h4>
                </div>
                <Badge tone="glitch">{fulfillmentMethod.toUpperCase()}</Badge>
              </div>
              <div className="space-y-1 text-sm">
                <Row label="Shoes" value={`${pairCount}× ${SHOE_CATEGORIES.find(c => c.id === shoeCategory)?.label}`} />
                {address.line1 && <Row label="Pickup" value={`${address.line1}, ${address.city}`} />}
                {isRush && <Row label="Rush" value="Yes" />}
              </div>
            </div>
            <p className="text-sm text-ink/60">By confirming, you authorize payment for the total shown in the summary.</p>
          </Panel>
        )}

        {/* Step controls */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
            className="btn-ghost"
            disabled={step === 0}
          >
            ← Back
          </button>
          {step < 5 ? (
            <button
              onClick={() => setStep((s) => Math.min(5, s + 1) as Step)}
              className="btn-glitch"
              disabled={!canContinue[step]}
            >
              Continue →
            </button>
          ) : (
            <button onClick={submit} disabled={isPending || !q || q.errors.length > 0} className="btn-glitch">
              {isPending ? 'Redirecting…' : `Pay $${q?.total ?? 0} →`}
            </button>
          )}
        </div>
      </div>

      {/* Sidebar — live quote */}
      <aside className="lg:col-span-1">
        <div className="card-ink p-6 sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <span className="badge-dark border-bone/20">Live quote</span>
            {isPending && <StatusDot tone="live" />}
          </div>
          {q ? (
            <>
              <div className="text-xs uppercase tracking-widest text-bone/50 mb-1">Total</div>
              <div className="h-display text-6xl mb-6">${q.total}</div>
              <div className="space-y-2 text-sm border-t border-bone/10 pt-4">
                {q.lines.map((l, i) => (
                  <div key={i} className="flex justify-between">
                    <span className={cn('text-bone/70', l.kind === 'discount' && 'text-neon')}>{l.label}</span>
                    <span className="font-mono">{l.amount < 0 ? '-' : ''}${Math.abs(l.amount)}</span>
                  </div>
                ))}
              </div>
              {q.errors.length > 0 && (
                <div className="mt-4 p-3 rounded bg-glitch/20 text-glitch text-xs">
                  {q.errors.join(' ')}
                </div>
              )}
            </>
          ) : (
            <p className="text-bone/60 text-sm">Complete step 1 to see pricing.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="animate-slide-up">
      <h2 className="h-display text-4xl md:text-5xl mb-2">{title}</h2>
      {subtitle && <p className="text-ink/60 mb-8">{subtitle}</p>}
      {!subtitle && <div className="mb-8" />}
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink/60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
