'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { checkZipAction } from './actions';
import type { CoverageResult } from '@/lib/coverage';
import { Badge, StatusDot } from '@/components/ui';

export function CoverageChecker() {
  const [result, setResult] = useState<CoverageResult | null>(null);
  const [zip, setZip] = useState('');
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set('zip', zip);
    startTransition(async () => {
      const r = await checkZipAction(fd);
      setResult(r);
    });
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Enter your ZIP code"
          inputMode="numeric"
          maxLength={5}
          className="input text-2xl h-display py-5"
          aria-label="ZIP code"
        />
        <button type="submit" className="btn-glitch px-8" disabled={isPending}>
          {isPending ? 'Checking…' : 'Check ZIP'}
        </button>
      </form>

      {result && (
        <div className="mt-8 card p-8 animate-slide-up">
          {result.covered ? (
            <>
              <Badge tone="acid" className="mb-4">
                <StatusDot tone="ok" /> Local coverage
              </Badge>
              <h3 className="h-display text-4xl mb-2">
                You're in <em className="h-italic text-glitch">{result.cityName}</em>.
              </h3>
              <p className="text-ink/70">
                Service area: <strong>{result.serviceAreaName}</strong>. Pickup, drop-off, and mail-in all available.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/book?city=${result.cityId}`} className="btn-primary">Book local pickup →</Link>
                <Link href="/mail-in" className="btn-outline">Use mail-in instead</Link>
              </div>
            </>
          ) : (
            <>
              <Badge className="mb-4">Not local yet</Badge>
              <h3 className="h-display text-4xl mb-2">Mail-in still works.</h3>
              <p className="text-ink/70">{result.reason}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/mail-in" className="btn-primary">See mail-in instructions →</Link>
                <Link href="/book?mode=mailin" className="btn-outline">Start a mail-in order</Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
