'use client';

import { useState } from 'react';

export default function LeadCaptureForm({
  routePath,
  offer,
  compact = false,
}: {
  routePath: string;
  offer: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(formData: FormData) {
    setStatus('submitting');
    setMessage('');

    const payload = {
      routePath,
      offer,
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      zip: String(formData.get('zip') ?? ''),
      notes: String(formData.get('notes') ?? ''),
    };

    const response = await fetch('/api/growth/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (response.ok) {
      setStatus('success');
      setMessage(json.message ?? 'Lead received.');
      return;
    }

    setStatus('error');
    setMessage(json.message ?? 'Unable to submit right now.');
  }

  return (
    <form
      action={onSubmit}
      className={`rounded-[1.4rem] border border-ink/10 bg-white/80 shadow-[0_18px_50px_rgba(10,15,31,0.08)] backdrop-blur-xl ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/80">
        {offer}
      </div>
      <div className="mt-2 text-xl font-semibold text-ink">Get a fast next step.</div>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        Leave your details and we will point you to the right quote or booking path.
      </p>

      <div className="mt-4 grid gap-3">
        <input className="input" type="text" name="name" placeholder="Your name" />
        <input className="input" type="email" name="email" placeholder="Email address" required />
        <input className="input" type="tel" name="phone" placeholder="Phone number" />
        <input className="input" type="text" name="zip" placeholder="ZIP code" />
        <textarea className="input min-h-[110px]" name="notes" placeholder="Tell us about the pair or service you need" />
      </div>

      <button
        type="submit"
        className="btn-glitch mt-4 w-full"
        disabled={status === 'submitting'}
        data-growth-cta="lead-form-submit"
      >
        {status === 'submitting' ? 'Submitting…' : 'Request your free next step →'}
      </button>

      {message ? (
        <p className={`mt-3 text-sm ${status === 'success' ? 'text-glitch' : 'text-ruby'}`}>{message}</p>
      ) : null}
    </form>
  );
}
