import Link from 'next/link';
import { redirect } from 'next/navigation';
import OperatorTrainingModule from '@/components/OperatorTrainingModule';
import { Badge, Card, StatusDot } from '@/components/ui';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getOperatorApplicationDocuments } from '@/lib/operator-documents';
import { getOperatorTierDefinition } from '@/features/operators/tiers';
import { buildLoginHref } from '@/lib/login-redirect';
import { formatDate } from '@/lib/utils';

function StepCard({
  label,
  done,
  detail,
}: {
  label: string;
  done: boolean;
  detail: string;
}) {
  return (
    <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
      <div className="flex items-center gap-3">
        <StatusDot tone={done ? 'ok' : 'warn'} />
        <div className="font-semibold text-ink">{label}</div>
      </div>
      <div className="mt-2 text-sm leading-6 text-ink/60">{detail}</div>
    </div>
  );
}

export default async function OperatorDashboard() {
  const session = await getSession();
  if (!session) redirect(buildLoginHref('/operator/dashboard'));

  const cleaner = await db.cleaners.byUserId(session.userId);
  if (cleaner) redirect('/cleaner');

  const admin = createAdminSupabaseClient();
  const { data: application } = await admin
    .from('operator_applications')
    .select('*, cities(name)')
    .eq('email', session.email)
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!application) {
    return (
      <section className="container max-w-4xl mx-auto px-4 py-16">
        <Badge tone="glitch" className="mb-6">Operator path</Badge>
        <h1 className="h-display text-[clamp(2.8rem,7vw,5rem)] leading-[0.92] mb-4">
          You do not have an operator application in progress yet.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-ink/64 mb-8">
          This page becomes your operator status board once you apply. Right now the next move is to pick a tier and start the application path.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/operator" className="btn-glitch">Review operator tiers →</Link>
          <Link href="/become-an-operator" className="btn-outline">See opportunity pages</Link>
        </div>
      </section>
    );
  }

  const documentsByApplication = await getOperatorApplicationDocuments([application.id]).catch(() => new Map());
  const licenseDocuments = documentsByApplication.get(application.id) ?? [];
  const tier = getOperatorTierDefinition(application.tier);
  const cityName = application.cities?.name ?? 'your city';
  const licenseReady = licenseDocuments.length > 0;
  const paymentReady = application.kitPaymentStatus === 'paid';
  const approved = application.status === 'approved';
  const rejected = application.status === 'rejected';

  return (
    <section className="container max-w-6xl mx-auto px-4 py-14">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Badge tone={approved ? 'acid' : rejected ? 'default' : 'glitch'}>
          <StatusDot tone={approved ? 'ok' : rejected ? 'error' : 'warn'} /> {approved ? 'Approved' : rejected ? 'Update required' : 'In review'}
        </Badge>
        <Badge>{tier.name}</Badge>
        <Badge>{cityName}</Badge>
      </div>

      <h1 className="h-display text-[clamp(2.8rem,7vw,5rem)] leading-[0.92] mb-4">
        {approved ? 'You are through review.' : rejected ? 'Your application needs another pass.' : 'Your operator path is in motion.'}
      </h1>
      <p className="max-w-3xl text-lg leading-8 text-ink/64 mb-10">
        {approved
          ? 'Your application has been approved. The final step is using the invite from your email to activate the real operator workspace.'
          : rejected
            ? 'We reviewed your application and did not move it forward yet. You can revisit the operator opportunity pages, then apply again when the fit is tighter.'
            : 'Use this page as your operator checklist. It shows the exact things the team needs before your city can move from application to activation.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Application ref</div>
          <div className="h-display text-3xl">{application.id.slice(0, 8)}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">Kit payment</div>
          <div className="h-display text-3xl">{paymentReady ? 'Paid' : 'Waiting'}</div>
        </Card>
        <Card>
          <div className="font-mono text-xs text-ink/40 mb-1">License upload</div>
          <div className="h-display text-3xl">{licenseReady ? 'Ready' : 'Missing'}</div>
        </Card>
        <Card className="card-ink">
          <div className="font-mono text-xs text-bone/40 mb-1">Submitted</div>
          <div className="h-display text-3xl text-bone">{formatDate(application.createdAt)}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-5 mb-10">
        <Card className="card-lift">
          <div className="font-mono text-xs uppercase tracking-widest text-glitch mb-2">Operator checklist</div>
          <h2 className="h-display text-3xl mb-4">Everything the team checks before activation.</h2>
          <div className="space-y-3">
            <StepCard
              label="Application received"
              done
              detail={`Submitted for ${cityName} on ${formatDate(application.createdAt)}.`}
            />
            <StepCard
              label="Driver license on file"
              done={licenseReady}
              detail={licenseReady ? 'Your license upload is attached to the application for admin review.' : 'Upload is still missing. Without it, pickup and drop-off access cannot be approved.'}
            />
            <StepCard
              label="Kit payment confirmed"
              done={paymentReady}
              detail={paymentReady ? `Your ${tier.name} kit payment is in.` : `The ${tier.name} kit still needs payment before the team can approve the market access.`}
            />
            <StepCard
              label="Review decision"
              done={approved || rejected}
              detail={
                approved
                  ? 'Approved. The next move is account activation and onboarding.'
                  : rejected
                    ? 'This application was not approved in its current form.'
                    : 'Still in review. The team will move this step once the application is fully checked.'
              }
            />
            <StepCard
              label="Operator workspace access"
              done={false}
              detail={
                approved
                  ? 'Check your email for the sign-in invite, then you will land in the live operator workspace.'
                  : 'This unlocks after approval and invite delivery.'
              }
            />
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="card-lift">
            <div className="font-mono text-xs uppercase tracking-widest text-ink/42 mb-2">Tier economics</div>
            <div className="space-y-3 text-sm leading-6 text-ink/62">
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                Platform fee: {tier.platformFeeRange}
              </div>
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                Operator share: {tier.payoutRange}
              </div>
              <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
                {tier.marketingSupport}
              </div>
            </div>
          </Card>

          <Card className="card-lift">
            <div className="font-mono text-xs uppercase tracking-widest text-ink/42 mb-2">Best next move</div>
            <p className="text-sm leading-6 text-ink/62 mb-5">
              {approved
                ? 'Open the invite in your email to activate the real operator workspace.'
                : paymentReady && licenseReady
                  ? 'Everything needed for review is in. The next move is waiting for the team decision.'
                  : 'Finish the missing checklist items so review can move cleanly.'}
            </p>
            <div className="flex flex-wrap gap-3">
              {approved ? (
                <Link href={buildLoginHref('/operator/dashboard')} className="btn-glitch">Open sign-in →</Link>
              ) : (
                <Link href={`/operator/applied?ref=${encodeURIComponent(application.id)}`} className="btn-glitch">
                  View application status →
                </Link>
              )}
              <Link href="/become-an-operator" className="btn-outline">Review opportunity details</Link>
            </div>
          </Card>
        </div>
      </div>

      <OperatorTrainingModule title="Training videos the team expects operators to know" compact />
    </section>
  );
}
