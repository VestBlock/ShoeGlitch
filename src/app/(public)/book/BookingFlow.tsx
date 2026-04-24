'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zipLookupAction, quoteAction } from './actions';
import { startStripeCheckoutAction } from './stripe-actions';
import { uploadPreOrderPhotos } from '@/lib/storage';
import {
  MAIL_IN_BOX_KIT_DELAY,
  MAIL_IN_BOX_KIT_NAME,
  MAIL_IN_BOX_KIT_PRICE,
} from '@/lib/mail-in-config';
import {
  PICKUP_WINDOW_OPTIONS,
  type PickupWindow,
  pickupWindowLabel,
} from '@/lib/pickup-window';
import type { Quote } from '@/lib/pricing';
import type { ResolvedService } from '@/services/catalog';
import type { City } from '@/types';
import { Badge, StatusDot } from '@/components/ui';
import { cn } from '@/lib/utils';

type Step = 0 | 1 | 2 | 3 | 4 | 5;

interface Props {
  cities: City[];
  servicesByCity: Record<string, { primary: ResolvedService[]; addOns: ResolvedService[] }>;
  mailInCityId: string;
  mailInHubAddressLabel: string;
  initialCustomer?: {
    name: string;
    email: string;
    phone?: string;
  } | null;
}

type SelectedPhoto = {
  file: File;
  preview: string;
};

const SHOE_CATEGORIES = [
  { id: 'sneakers', label: 'Sneakers' },
  { id: 'designer_sneakers', label: 'Designer Sneakers' },
  { id: 'womens_heels', label: "Women's Heels" },
  { id: 'red_bottom_heels', label: 'Red-Bottom Heels' },
  { id: 'boots', label: 'Boots' },
  { id: 'kids', label: 'Kids' },
  { id: 'other', label: 'Other' },
] as const;

const SHOE_BRANDS = [
  'Nike',
  'Jordan',
  'adidas',
  'New Balance',
  'ASICS',
  'Converse',
  'Puma',
  'Reebok',
  'Vans',
  'Other',
] as const;

const STEPS = [
  'Location',
  'Fulfillment',
  'Shoes',
  'Service',
  'Details',
  'Review',
];

const SERVICE_ALIASES: Record<string, string> = {
  'fresh-start': 'basic',
  'full-reset': 'pro',
  'revival-package': 'elite',
  'fabric-rescue': 'pro',
  'ice-recovery': 'elite',
  'sole-color': 'elite',
  'red-bottom-touchup': 'elite',
  'full-sole-repaint': 'elite',
};

const BOOKING_TIER_DETAILS: Record<string, { label: string; includes: string[] }> = {
  basic: {
    label: 'Routine refresh',
    includes: ['Steam Clean baseline', 'Upper and sole cleaning', 'Lace cleaning'],
  },
  pro: {
    label: 'Most popular',
    includes: ['Everything in Basic', 'De-crease method', 'Light paint touch-ups'],
  },
  elite: {
    label: 'Full restoration',
    includes: ['Everything in Pro', 'Ice method work', 'Basic-color repaint touch-ups'],
  },
};

export function BookingFlow({
  cities,
  servicesByCity,
  mailInCityId,
  mailInHubAddressLabel,
  initialCustomer,
}: Props) {
  const search = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<Step>(0);

  // State shape mirrors the server action schema.
  const initialMode = search.get('mode') as 'pickup' | 'dropoff' | 'mailin' | null;
  const [cityId, setCityId] = useState<string>(
    search.get('city') ?? (initialMode === 'mailin' ? mailInCityId : ''),
  );
  const [serviceAreaId, setServiceAreaId] = useState<string | undefined>(undefined);
  const [zip, setZip] = useState('');
  const [zipChecked, setZipChecked] = useState(false);
  const [zipMessage, setZipMessage] = useState<string | null>(null);

  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'dropoff' | 'mailin'>(
    initialMode ?? 'pickup',
  );
  const [mailInBoxKit, setMailInBoxKit] = useState(false);

  const [shoeCategory, setShoeCategory] =
    useState<(typeof SHOE_CATEGORIES)[number]['id']>('sneakers');
  const [shoeBrand, setShoeBrand] = useState<string>('Nike');
  const [customShoeBrand, setCustomShoeBrand] = useState('');
  const [shoeModelName, setShoeModelName] = useState('');
  const [pairCount, setPairCount] = useState(1);

  const initialService = search.get('service');
  const [primaryServiceId, setPrimaryServiceId] = useState<string>('');
  const [addOnServiceIds, setAddOnServiceIds] = useState<string[]>([]);
  const [isRush, setIsRush] = useState(false);

  const [notes, setNotes] = useState('');
  const [conditionIssues, setConditionIssues] = useState('');
  const [pickupWindow, setPickupWindow] = useState<PickupWindow>('morning');
  const [contactName, setContactName] = useState(initialCustomer?.name ?? '');
  const [contactEmail, setContactEmail] = useState(initialCustomer?.email ?? '');
  const [contactPhone, setContactPhone] = useState(initialCustomer?.phone ?? '');
  const [address, setAddress] = useState({ line1: '', line2: '', city: '', state: '', zip: '' });
  const [couponCode, setCouponCode] = useState('');
  const [beforePhotos, setBeforePhotos] = useState<SelectedPhoto[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  const [q, setQuote] = useState<Quote | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentCity = useMemo(() => cities.find((c) => c.id === cityId), [cities, cityId]);
  const mailInCity = useMemo(
    () => cities.find((c) => c.id === mailInCityId) ?? currentCity ?? null,
    [cities, currentCity, mailInCityId],
  );
  const effectiveCity = fulfillmentMethod === 'mailin' ? mailInCity : currentCity;
  const catalog = cityId ? servicesByCity[cityId] : undefined;
  const resolvedShoeBrand = useMemo(
    () => (shoeBrand === 'Other' ? customShoeBrand.trim() : shoeBrand.trim()),
    [customShoeBrand, shoeBrand],
  );
  const resolvedShoeTitle = shoeModelName.trim();
  const hasValidContactEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim());
  const selectedPrimaryService = useMemo(
    () => catalog?.primary.find((service) => service.id === primaryServiceId) ?? null,
    [catalog, primaryServiceId],
  );
  const quickSummary = useMemo(
    () =>
      [
        fulfillmentMethod === 'mailin'
          ? 'Nationwide mail-in'
          : currentCity
            ? `${currentCity.name}`
            : null,
        fulfillmentMethod ? fulfillmentMethod.replace('mailin', 'mail-in') : null,
        pairCount ? `${pairCount} pair${pairCount > 1 ? 's' : ''}` : null,
        selectedPrimaryService?.name ?? null,
      ].filter(Boolean) as string[],
    [currentCity, fulfillmentMethod, pairCount, selectedPrimaryService],
  );

  // Set a default service once the city is picked (or from URL param)
  useEffect(() => {
    if (!catalog) return;
    if (primaryServiceId) return;
    if (initialService) {
      const normalizedService = SERVICE_ALIASES[initialService] ?? initialService;
      const m = catalog.primary.find((s) => s.slug === normalizedService);
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
        mailInBoxKit,
        shoeCategory,
        pairCount,
        isRush,
        couponCode: couponCode || undefined,
      });
      setQuote(res);
    });
  }, [cityId, primaryServiceId, addOnServiceIds, fulfillmentMethod, mailInBoxKit, shoeCategory, pairCount, isRush, couponCode]);

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
      setCityId(mailInCityId);
      setServiceAreaId(undefined);
    }
  };

  const toggleAddOn = (id: string) => {
    setAddOnServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;

    const remaining = 5 - beforePhotos.length;
    if (selected.length > remaining) {
      setSubmitError(`You can attach up to 5 photos total. Remove one before adding more.`);
      return;
    }

    const nextPhotos = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setBeforePhotos((prev) => [...prev, ...nextPhotos]);
    setSubmitError(null);
    event.target.value = '';
  };

  const removePhoto = (index: number) => {
    setBeforePhotos((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const canContinue: Record<Step, boolean> = {
    0: Boolean(cityId) || fulfillmentMethod === 'mailin',
    1: Boolean(fulfillmentMethod && (fulfillmentMethod === 'mailin' ? mailInCityId : cityId)),
    2: Boolean(shoeCategory && pairCount >= 1 && resolvedShoeBrand && resolvedShoeTitle),
    3: Boolean(primaryServiceId),
    4:
      Boolean(contactName.trim() && hasValidContactEmail) &&
      (fulfillmentMethod === 'dropoff' ||
      Boolean(
        address.line1 &&
          address.city &&
          address.state &&
          address.zip &&
          (fulfillmentMethod !== 'pickup' || pickupWindow),
      )),
    5: true,
  };

  const submit = () => {
    setSubmitError(null);
    setIsSubmittingCheckout(true);

    startTransition(async () => {
      try {
        const beforeImageUrls =
          beforePhotos.length > 0
            ? await uploadPreOrderPhotos(beforePhotos.map((photo) => photo.file))
            : [];

        await startStripeCheckoutAction({
          cityId,
          serviceAreaId,
          fulfillmentMethod,
          mailInBoxKit,
          contactName,
          contactEmail,
          contactPhone: contactPhone || undefined,
          shoeCategory,
          shoeBrand,
          customShoeBrand: shoeBrand === 'Other' ? customShoeBrand.trim() : undefined,
          shoeModelName: resolvedShoeTitle || undefined,
          customShoeType: resolvedShoeTitle || undefined,
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
          pickupWindow: fulfillmentMethod === 'pickup' ? pickupWindow : undefined,
          beforeImages: beforeImageUrls,
        });
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Checkout failed');
        setIsSubmittingCheckout(false);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main column */}
      <div className="lg:col-span-2">
        {/* Stepper */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-glitch/80">
                Step {step + 1} of {STEPS.length}
              </div>
              <div className="mt-1 text-sm text-ink/58">
                {step < STEPS.length - 1
                  ? 'Move one decision at a time and keep the quote live as you go.'
                  : 'Final review before checkout.'}
              </div>
            </div>
            {quickSummary.length > 0 ? (
              <div className="hidden max-w-[18rem] flex-wrap justify-end gap-2 md:flex">
                {quickSummary.slice(0, 3).map((item) => (
                  <span key={item} className="rounded-full border border-ink/10 bg-white px-3 py-2 text-xs font-medium text-ink/68">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
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
          {quickSummary.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2 md:hidden">
              {quickSummary.slice(0, 3).map((item) => (
                <span key={item} className="rounded-full border border-ink/10 bg-white px-3 py-2 text-xs font-medium text-ink/68">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
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
              <label className="label">Choose a local city for pickup/drop-off</label>
              <div className="flex flex-wrap gap-2">
                {cities.filter(c => c.active).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCityId(c.id); setServiceAreaId(undefined); setFulfillmentMethod('pickup'); }}
                    className={cn('chip', fulfillmentMethod !== 'mailin' && cityId === c.id && 'chip-on')}
                  >
                    {c.name}, {c.state}
                  </button>
                ))}
                <button
                  onClick={() => { setFulfillmentMethod('mailin'); setCityId(mailInCityId); setServiceAreaId(undefined); }}
                  className={cn('chip', fulfillmentMethod === 'mailin' && 'chip-on')}
                >
                  📦 Mail-in from anywhere
                </button>
              </div>
              <p className="mt-3 text-sm text-ink/55">
                Local cities only control pickup and drop-off coverage. Mail-in stays open nationwide.
              </p>
            </div>
          </Panel>
        )}

        {/* STEP 1 — Fulfillment */}
        {step === 1 && (
          <Panel title="How do you want to get them to us?">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { k: 'pickup' as const, t: 'Local Pickup', d: 'Only in live ShoeGlitch cities.', fee: `$${currentCity?.defaultPickupFee ?? 0}` },
                { k: 'dropoff' as const, t: 'Drop-Off', d: 'Bring them to our hub.', fee: 'Free' },
                { k: 'mailin' as const, t: 'Mail-In', d: 'Nationwide. Ship them in, we ship back.', fee: `$${mailInCity?.defaultMailInReturnFee ?? 0} return` },
              ].map((m) => (
                <button
                  key={m.k}
                  onClick={() => {
                    setFulfillmentMethod(m.k);
                    if (m.k === 'mailin') {
                      setCityId(mailInCityId);
                      setServiceAreaId(undefined);
                    }
                  }}
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
                <span className="text-sm">Rush service <span className="text-ink/50">(+${effectiveCity?.defaultRushFee ?? 0})</span></span>
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

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="label">Brand</label>
                <select
                  className="input"
                  value={shoeBrand}
                  onChange={(e) => setShoeBrand(e.target.value)}
                >
                  {SHOE_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Shoe title / model</label>
                <input
                  className="input"
                  value={shoeModelName}
                  onChange={(e) => setShoeModelName(e.target.value)}
                  placeholder="e.g. Jordan 5, Air Max 95, Foamposite"
                />
              </div>
            </div>

            {shoeBrand === 'Other' && (
              <div className="mt-6 max-w-xl">
                <label className="label">Type the brand</label>
                <input
                  className="input"
                  value={customShoeBrand}
                  onChange={(e) => setCustomShoeBrand(e.target.value)}
                  placeholder="e.g. Maison Margiela"
                />
              </div>
            )}
          </Panel>
        )}

        {/* STEP 3 — Service */}
        {step === 3 && catalog && (
          <Panel
            title="Pick your tier."
            subtitle={`Pricing reflects ${fulfillmentMethod === 'mailin' ? `${mailInCity?.name ?? 'our national'} mail-in hub` : currentCity?.name}. Steam Clean is built into Basic, Pro, and Elite.`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {catalog.primary.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPrimaryServiceId(s.id)}
                  className={cn(
                    'card p-5 text-left card-lift border-2 border-ink/10',
                    primaryServiceId === s.id && 'ring-2 ring-ink border-ink',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/45">
                        {BOOKING_TIER_DETAILS[s.slug]?.label ?? 'Care tier'}
                      </div>
                      <h4 className="h-display mt-2 text-2xl">{s.name}</h4>
                    </div>
                    <div className="h-display text-xl">${s.resolvedPrice}</div>
                  </div>
                  <p className="text-xs text-ink/50 italic mt-1">{s.tagline}</p>
                  <p className="text-xs text-ink/70 mt-2 line-clamp-2">{s.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.slug === 'basic' ? (
                      <span className="rounded-full border border-ink/10 bg-bone-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55">
                        Routine refresh
                      </span>
                    ) : s.slug === 'pro' ? (
                      <span className="rounded-full border border-glitch/20 bg-glitch/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-glitch/85">
                        De-crease + touch-up
                      </span>
                    ) : (
                      <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan">
                        Full restoration
                      </span>
                    )}
                  </div>
                  <div className="mt-4 rounded-[1.1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">Included</div>
                    <ul className="mt-2 space-y-1.5 text-xs leading-5 text-ink/62">
                      {(BOOKING_TIER_DETAILS[s.slug]?.includes ?? []).map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-[1.35rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm leading-6 text-ink/62">
              Basic covers routine Steam Clean refreshes. Pro adds the De-crease method and light touch-ups. Elite opens the full restoration path, including Ice method work and basic-color repaint touch-ups.
            </div>

            <div className="mt-8 border-t border-ink/10 pt-8">
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
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="label">Contact name</label>
                <input
                  className="input"
                  placeholder="Who should we update about the order?"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
                <p className="mt-2 text-xs text-ink/52">
                  We&rsquo;ll send the receipt, label, and status updates here.
                </p>
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input
                  className="input"
                  type="tel"
                  placeholder="(414) 555-0199"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
                <p className="mt-2 text-xs text-ink/52">
                  Helpful for shipping issues or route questions.
                </p>
              </div>
            </div>

            {(fulfillmentMethod === 'pickup' || fulfillmentMethod === 'mailin') && (
              <>
                <label className="label">
                  {fulfillmentMethod === 'mailin' ? 'Ship-from / return address' : 'Pickup address'}
                </label>
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

                {fulfillmentMethod === 'pickup' ? (
                  <>
                    <label className="label">Pickup window</label>
                    <select
                      className="input mb-3 max-w-md"
                      value={pickupWindow}
                      onChange={(event) => setPickupWindow(event.target.value as PickupWindow)}
                    >
                      {PICKUP_WINDOW_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mb-6 text-sm text-ink/60">
                      {PICKUP_WINDOW_OPTIONS.find((option) => option.value === pickupWindow)?.detail}
                    </p>
                  </>
                ) : (
                  <p className="mb-6 text-sm text-ink/60">
                    We&rsquo;ll use this address on your prepaid inbound label, then ship the finished pair back here unless support updates the return route with you.
                  </p>
                )}
              </>
            )}

            {fulfillmentMethod === 'mailin' && (
              <>
                <div className="card p-5 mb-6 bg-bone-soft">
                  <p className="text-sm"><strong>You&rsquo;ll ship to:</strong> {mailInHubAddressLabel} — once payment clears, we&rsquo;ll email a prepaid label plus packing steps. If you don&rsquo;t already have a box, you can bring the shoes to the carrier store on the label and buy one there before handing it over.</p>
                </div>
                <label className="flex gap-3 rounded-[1.35rem] border border-ink/10 bg-white p-4 cursor-pointer mb-6">
                  <input
                    type="checkbox"
                    checked={mailInBoxKit}
                    onChange={(event) => setMailInBoxKit(event.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-glitch"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{MAIL_IN_BOX_KIT_NAME}</span>
                      <Badge tone="acid">+${MAIL_IN_BOX_KIT_PRICE}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-ink/60">
                      We&rsquo;ll ship you a packing kit first so you don&rsquo;t have to buy a box at the counter. {MAIL_IN_BOX_KIT_DELAY}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-ink/45">
                      Skip this if you already have a sturdy box or plan to buy one at the carrier store.
                    </p>
                  </div>
                </label>
              </>
            )}

            <label className="label">Condition issues (optional)</label>
            <textarea className="input mb-6 min-h-[80px]" placeholder="e.g. scuff on left toe, yellowing on sole, loose stitching…"
              value={conditionIssues} onChange={(e) => setConditionIssues(e.target.value)} />

            <label className="label">Photos before we touch the pair (optional)</label>
            <div className="card p-5 mb-6 bg-bone-soft">
              <p className="text-sm text-ink/70 mb-4">
                Add up to five photos and we&rsquo;ll attach them to the order before checkout so the customer, operator, and admin dashboards all see the same intake reference.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="btn-outline cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={beforePhotos.length >= 5}
                  />
                  Add photos ({beforePhotos.length}/5)
                </label>
                {beforePhotos.length > 0 ? (
                  <span className="text-xs uppercase tracking-[0.24em] text-ink/45">
                    Uploaded at checkout
                  </span>
                ) : null}
              </div>

              {beforePhotos.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {beforePhotos.map((photo, index) => (
                    <div key={`${photo.file.name}-${index}`} className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.preview} alt={photo.file.name} className="aspect-square w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-2 top-2 rounded-full bg-ink px-2 py-1 text-xs font-semibold text-bone"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

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
                  <h4 className="h-display text-3xl">{fulfillmentMethod === 'mailin' ? 'Nationwide mail-in' : currentCity?.name}</h4>
                  </div>
                <Badge tone="glitch">{fulfillmentMethod.toUpperCase()}</Badge>
              </div>
              <div className="space-y-1 text-sm">
                <Row label="Contact" value={contactName || '—'} />
                <Row label="Email" value={contactEmail || '—'} />
                {contactPhone ? <Row label="Phone" value={contactPhone} /> : null}
                <Row label="Shoes" value={`${pairCount}× ${SHOE_CATEGORIES.find(c => c.id === shoeCategory)?.label}`} />
                <Row label="Brand" value={resolvedShoeBrand || '—'} />
                <Row label="Shoe title" value={resolvedShoeTitle || '—'} />
                {address.line1 && (
                  <Row
                    label={fulfillmentMethod === 'mailin' ? 'Ship-from address' : 'Pickup'}
                    value={`${address.line1}, ${address.city}`}
                  />
                )}
                {fulfillmentMethod === 'mailin' && mailInBoxKit && (
                  <Row label="Mail-in box kit" value={`Yes · +$${MAIL_IN_BOX_KIT_PRICE} · ${MAIL_IN_BOX_KIT_DELAY}`} />
                )}
                {fulfillmentMethod === 'pickup' && pickupWindow && (
                  <Row label="Pickup window" value={pickupWindowLabel(pickupWindow) ?? '—'} />
                )}
                {isRush && <Row label="Rush" value="Yes" />}
                {beforePhotos.length > 0 && <Row label="Intake photos" value={`${beforePhotos.length} attached`} />}
              </div>
            </div>
            <p className="text-sm text-ink/60">By confirming, you authorize payment for the total shown in the summary.</p>
            {submitError ? <p className="mt-4 text-sm font-medium text-glitch">{submitError}</p> : null}
          </Panel>
        )}

        {/* Step controls */}
        <div className="mt-8 hidden items-center justify-between md:flex">
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
            <button onClick={submit} disabled={isSubmittingCheckout || !q || q.errors.length > 0} className="btn-glitch">
              {isSubmittingCheckout ? 'Uploading and redirecting…' : `Pay $${q?.total ?? 0} →`}
            </button>
          )}
        </div>

        <div className="sticky bottom-3 z-20 mt-8 md:hidden">
          <div className="rounded-[1.6rem] border border-ink/12 bg-white/92 p-3 shadow-[0_20px_50px_rgba(10,15,31,0.16)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-glitch/80">
                  {step < 5 ? 'Next move' : 'Checkout'}
                </div>
                <div className="mt-1 text-sm text-ink/60">
                  {step < 5
                    ? `Keep going to ${STEPS[Math.min(step + 1, STEPS.length - 1)].toLowerCase()}.`
                    : q
                      ? `Total due now: $${q.total}`
                      : 'Review your quote before checkout.'}
                </div>
              </div>
              {q && (
                <div className="rounded-full bg-bone-soft px-3 py-2 text-sm font-semibold text-ink">
                  ${q.total}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
                className="btn-outline min-h-[3.2rem] flex-1"
                disabled={step === 0}
              >
                Back
              </button>
              {step < 5 ? (
                <button
                  onClick={() => setStep((s) => Math.min(5, s + 1) as Step)}
                  className="btn-glitch min-h-[3.2rem] flex-1"
                  disabled={!canContinue[step]}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={isSubmittingCheckout || !q || q.errors.length > 0}
                  className="btn-glitch min-h-[3.2rem] flex-1"
                >
                  {isSubmittingCheckout ? 'Redirecting…' : 'Pay now →'}
                </button>
              )}
            </div>
          </div>
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
    <div className="animate-slide-up rounded-[2rem] border border-ink/10 bg-white/82 p-5 shadow-[0_18px_44px_rgba(10,15,31,0.08)] backdrop-blur-xl md:p-8">
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
