import Link from 'next/link';
import { Badge, Card } from '@/components/ui';

export default function OperatorApplied({
  searchParams,
}: {
  searchParams: { ref?: string; tier?: string; city?: string; paid?: string; status?: string };
}) {
  const paid = searchParams.paid === '1';
  const status = searchParams.status;
  const badge = status === 'approved' ? '✓ Approved' : paid ? '✓ Application + payment received' : '✓ Application received';
  const heading =
    status === 'approved'
      ? 'You made it through review.'
      : paid
        ? 'Your application and kit payment are in.'
        : 'We received your application.';
  const intro =
    status === 'approved'
      ? 'Our team approved your application and will follow up with onboarding, training, and activation details.'
      : paid
        ? 'Your application is in the review queue and your kit payment has already been confirmed.'
        : 'We received your application and will follow up with the next step after review.';

  return (
    <section className="container-x pt-20 pb-32 max-w-2xl mx-auto">
      <Badge tone="glitch" className="mb-6">{badge}</Badge>
      <h1 className="h-display text-[clamp(3rem,7vw,5rem)] leading-[0.9] mb-6">
        {heading}
      </h1>
      <p className="text-ink/70 text-lg mb-10">
        Your application reference is <span className="font-mono font-bold text-glitch">{searchParams.ref ?? 'OP-PENDING'}</span>.
        {' '}{intro}
      </p>

      <Card className="p-8 mb-8">
        <h3 className="h-display text-2xl mb-4">What happens next</h3>
        <ol className="space-y-4">
          {[
            paid
              ? { t: 'Application + kit payment received', d: 'We have your submission and your one-time kit payment, so review can move forward without another payment step.' }
              : { t: 'Application received', d: 'Our team reviews your application and confirms whether you are a fit for the current city and tier.' },
            { t: 'Review decision', d: 'We review your application and follow up with approval or a hold/rejection update.' },
            { t: 'Intro call', d: 'Approved applicants move into a short call to align on expectations, training, and timing.' },
            { t: 'Certification training', d: 'You complete the training flow and submit the test work required for your tier.' },
            { t: 'Territory activation', d: 'Once training is complete, your service area goes live and jobs can start routing to you.' },
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
