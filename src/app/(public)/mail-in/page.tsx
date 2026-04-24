import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge, Card } from '@/components/ui';
import { MAIL_IN_BOX_KIT_DELAY, MAIL_IN_BOX_KIT_NAME, MAIL_IN_BOX_KIT_PRICE } from '@/lib/mail-in-config';
import { getNationalMailInHubAddressLabel } from '@/lib/mail-in-hub';

export default async function MailInPage() {
  const cities = await db.cities.active();
  const nationalHubAddress = getNationalMailInHubAddressLabel();

  return (
    <>
      <section className="container-x pt-10 pb-16">
        <Badge className="mb-6">Mail-In</Badge>
        <h1 className="h-display text-[clamp(3rem,8vw,7rem)] leading-[0.88] mb-6">
          Anywhere in the US.<br />
          <em className="h-italic text-glitch">Tracked end to end.</em>
        </h1>
        <p className="text-ink/70 max-w-2xl text-lg">
          Mail-in is open nationwide. Local city coverage only controls pickup and drop-off routes.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/60">
          That includes the same Basic, Pro, and Elite service path used in local markets, with Steam Clean built into every tier.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/60">
          Need a box? Add <strong>{MAIL_IN_BOX_KIT_NAME}</strong> at checkout for <strong>${MAIL_IN_BOX_KIT_PRICE}</strong>. If you skip it, you can still use your own box or buy one at the carrier store when you drop off the shipment. {MAIL_IN_BOX_KIT_DELAY}
        </p>
      </section>

      <section className="container-x pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { n: '01', t: 'Book online', d: 'Pick a service, upload photos, pay.' },
            { n: '02', t: 'Bring or buy a box', d: 'If you already have a sturdy box, use it. If not, take the shoes to the carrier store on the label and buy one there.' },
            { n: '03', t: 'Ship it in', d: "We&rsquo;ll email the prepaid label and hub address, then route the pair into the right clean or restoration process." },
            { n: '04', t: 'Track & receive', d: 'Live status from receipt through return shipping.' },
          ].map((s) => (
            <Card key={s.n} className="p-6">
              <div className="font-mono text-xs text-glitch mb-2">{s.n}</div>
              <h3 className="h-display text-2xl mb-2">{s.t}</h3>
              <p className="text-sm text-ink/60">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-x pb-16">
        <h2 className="h-display text-3xl mb-6">National mail-in hub</h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card className="p-8">
            <div className="font-mono text-xs text-ink/40">SHIP TO</div>
            <div className="h-display mt-2 text-4xl">Brookfield, WI</div>
            <div className="mt-3 text-base text-ink/72">{nationalHubAddress}</div>
            <div className="mt-5 rounded-[1.2rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm leading-6 text-ink/62">
              Every nationwide mail-in order routes here first, then we send the pair into the right Basic, Pro, or Elite workflow.
            </div>
          </Card>
          <Card className="p-8">
            <div className="font-mono text-xs text-ink/40">LOCAL CITIES</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {cities.map((c) => (
                <div key={c.id} className="rounded-[1.15rem] border border-ink/10 bg-white px-4 py-4">
                  <div className="text-sm font-semibold text-ink">{c.name}, {c.state}</div>
                  <div className="mt-2 text-xs leading-5 text-ink/55">
                    Pickup/drop-off market
                  </div>
                  <div className="mt-3 text-xs text-ink/48">
                    Return shipping baseline: <span className="font-mono text-ink">${c.defaultMailInReturnFee}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="container-x pb-24">
        <Card className="card-ink p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="h-display text-4xl">Ready to ship them in?</h3>
            <p className="text-bone/60 mt-2">Start a mail-in order and we&rsquo;ll email a prepaid label, packing steps, and the carrier to bring the shoes to if you still need a box.</p>
          </div>
          <Link href="/book?mode=mailin" className="btn-glitch shrink-0">Start mail-in →</Link>
        </Card>
      </section>
    </>
  );
}
