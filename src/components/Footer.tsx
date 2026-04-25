import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink text-bone mt-32 relative overflow-hidden">
      <div className="absolute inset-0 matrix-strip opacity-20" />
      <div className="container-x py-20 relative">
        <div className="section-outline-dark mb-10 p-5 md:p-7">
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="text-[10px] uppercase tracking-[0.30em] text-cyan/80">Start here</div>
              <h3 className="h-display mt-3 text-3xl leading-[0.95] text-bone md:text-4xl">
                Local handoff, nationwide mail-in, or sneaker intelligence first.
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/book" className="btn-glitch">Book now →</Link>
              <Link href="/mail-in" className="btn-outline border-white/16 bg-white/6 text-bone hover:bg-white hover:text-ink">Mail-in →</Link>
              <Link href="/intelligence" className="btn-outline border-white/16 bg-white/6 text-bone hover:bg-white hover:text-ink">Intelligence →</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="mb-6">
              <div className="h-display text-2xl">Shoe Glitch</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-cyan">built for the culture</div>
            </div>
            <h3 className="h-display text-4xl mb-4">
              Don&rsquo;t let your <em className="h-italic text-cyan">good ones</em> die dirty.
            </h3>
            <p className="text-bone/60 max-w-sm text-sm">
              Premium sneaker care with local pickup where available, nationwide mail-in when you need it, and release alerts that keep the next pair close.
            </p>
          </div>
          <Col title="Customers">
            <Link href="/book">Book</Link>
            <Link href="/services">Services</Link>
            <Link href="/mail-in">Mail-In</Link>
            <Link href="/locations">Locations</Link>
            <Link href="/intelligence">Intelligence</Link>
          </Col>
          <Col title="Operators">
            <Link href="/operator">Operators</Link>
            <Link href="/operator/apply">Apply</Link>
            <Link href="/login">Sign in</Link>
          </Col>
          <Col title="Live cities">
            <span className="text-cyan font-semibold">Milwaukee, WI (HQ)</span>
            <span className="text-bone/60">Memphis, TN</span>
            <span className="text-bone/60">Atlanta, GA</span>
            <span className="text-bone/60">Nationwide mail-in</span>
          </Col>
        </div>
        <div className="mt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-bone/10 pt-8">
          <span className="text-xs text-bone/40 tracking-widest uppercase">© {new Date().getFullYear()} Shoe Glitch LLC.</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <Link href="/terms" className="text-bone/60 hover:text-cyan">Terms</Link>
            <Link href="/privacy" className="text-bone/60 hover:text-cyan">Privacy</Link>
            <Link href="/refund-policy" className="text-bone/60 hover:text-cyan">Refund &amp; Damage</Link>
          </div>
          <span className="font-mono text-xs text-bone/40">Milwaukee → nationwide</span>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <h4 className="text-[10px] uppercase tracking-[0.25em] text-cyan mb-2">{title}</h4>
      {children}
    </div>
  );
}
