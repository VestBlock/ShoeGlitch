import Link from 'next/link';
import { Badge, Card } from '@/components/ui';

export default function OperatorApplied({ searchParams }: { searchParams: { ref?: string; tier?: string; city?: string } }) {
  return (
    <section className="container-x pt-20 pb-32 max-w-2xl mx-auto">
      <Badge tone="glitch" className="mb-6">✓ Application received</Badge>
      <h1 className="h-display text-[clamp(3rem,7vw,5rem)] leading-[0.9] mb-6">
        We'll be in touch within 48 hours.
      </h1>
      <p className="text-ink/70 text-lg mb-10">
        Your application reference is <span className="font-mono font-bold text-glitch">{searchParams.ref ?? 'OP-PENDING'}</span>.
        A founder will review your application and reach out to schedule a call.
      </p>

      <Card className="p-8 mb-8">
        <h3 className="h-display text-2xl mb-4">What happens next</h3>
        <ol className="space-y-4">
          {[
            { t: 'Application review', d: 'Our team reviews your application (usually within 48 hours).' },
            { t: 'Intro call', d: '15-minute video call to talk through expectations and training.' },
            { t: 'Kit payment', d: 'Once approved, you pay the kit fee and we ship your gear.' },
            { t: 'Certification training', d: 'Complete video modules + submit a test pair for your tier.' },
            { t: 'Territory activation', d: 'Your service area goes live and jobs route to you.' },
          ].map((s, i) => (
            <li key={i} className="flex gap-4">
              <div className="shrink-0 h-8 w-8 rounded-full bg-glitch text-white grid place-items-center text-sm font-bold">{i + 1}</div>
              <div>
                <div className="font-semibold">{s.t}</div>
                <div className="text-sm text-ink/60">{s.d}</div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Link href="/" className="btn-outline">Back home</Link>
    </section>
  );
}
