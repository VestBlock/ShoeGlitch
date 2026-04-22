'use client';

import { useEffect, useState } from 'react';
import LeadCaptureForm from '@/components/growth/LeadCaptureForm';

const STORAGE_KEY = 'sg-growth-exit-intent-dismissed';

export default function ExitIntentOffer({
  routePath,
  offer,
}: {
  routePath: string;
  offer: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1024) return;
    if (window.localStorage.getItem(STORAGE_KEY) === '1') return;

    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        setOpen(true);
      }
    };

    document.addEventListener('mouseleave', onMouseLeave);
    return () => document.removeEventListener('mouseleave', onMouseLeave);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-5 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-[2rem] border border-white/12 bg-bone p-6 shadow-[0_40px_120px_rgba(10,15,31,0.35)]">
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, '1');
            setOpen(false);
          }}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-xl text-ink/55 transition hover:border-glitch hover:text-glitch"
        >
          ×
        </button>

        <div className="max-w-lg">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-glitch/80">
            Before you go
          </div>
          <h3 className="h-display mt-3 text-4xl leading-[0.95] text-ink">
            Get the quick answer and the right next step.
          </h3>
          <p className="mt-3 text-base leading-7 text-ink/65">
            If you are still comparing options, leave your details and Shoe Glitch will point you to the best quote or booking path.
          </p>
        </div>

        <div className="mt-5">
          <LeadCaptureForm routePath={routePath} offer={offer} compact />
        </div>
      </div>
    </div>
  );
}
