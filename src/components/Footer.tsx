import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink text-bone mt-32 relative overflow-hidden">
      <div className="absolute inset-0 matrix-strip opacity-20" />
      <div className="container-x py-20 relative">
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
              A multi-city network of sneaker specialists, sole-color experts, and quality-obsessed operators. Started in Milwaukee.
            </p>
          </div>
          <Col title="Customers">
            <Link href="/services">Services</Link>
            <Link href="/coverage">Coverage</Link>
            <Link href="/mail-in">Mail-In</Link>
            <Link href="/book">Book</Link>
          </Col>
          <Col title="Operators">
            <Link href="/operator">Become an operator</Link>
            <Link href="/cleaner">Cleaner portal</Link>
            <Link href="/city-manager">City ops</Link>
            <Link href="/admin">HQ admin</Link>
          </Col>
          <Col title="Live cities">
            <span className="text-cyan font-semibold">Milwaukee, WI (HQ)</span>
            <span className="text-bone/60">Memphis, TN</span>
            <span className="text-bone/60">Atlanta, GA</span>
            <span className="text-glitch">Nashville — coming soon</span>
          </Col>
        </div>
        <div className="mt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-bone/10 pt-8">
          <span className="text-xs text-bone/40 tracking-widest uppercase">© {new Date().getFullYear()} Shoe Glitch LLC.</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <Link href="/terms" className="text-bone/60 hover:text-cyan">Terms</Link>
            <Link href="/privacy" className="text-bone/60 hover:text-cyan">Privacy</Link>
            <Link href="/refund-policy" className="text-bone/60 hover:text-cyan">Refund &amp; Damage</Link>
          </div>
          <span className="font-mono text-xs text-bone/40">SG/v0.2.0 · Milwaukee → everywhere</span>
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
