import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge, Card } from '@/components/ui';
import { MAIL_IN_BOX_KIT_DELAY, MAIL_IN_BOX_KIT_NAME, MAIL_IN_BOX_KIT_PRICE } from '@/lib/mail-in-config';

export default async function MailInPage() {
  const cities = await db.cities.active();

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
          That includes the same deeper service process used in local markets, with steam-assisted cleaning built into every package above Fresh Start.
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
        <h2 className="h-display text-3xl mb-6">Current hub addresses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cities.map((c) => (
            <Card key={c.id}>
              <div className="font-mono text-xs text-ink/40">{c.state} HUB</div>
              <div className="h-display text-3xl mb-2">{c.name}</div>
              <div className="text-sm text-ink/70">{c.hubAddress ?? 'Address shared after booking'}</div>
              <div className="mt-4 pt-4 border-t border-ink/10 text-xs text-ink/50">
                Return shipping: <span className="font-mono text-ink">${c.defaultMailInReturnFee}</span>
              </div>
            </Card>
          ))}
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
