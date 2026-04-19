import Link from 'next/link';
import { Badge } from '@/components/ui';

export default function NotFound() {
  return (
    <section className="container-x pt-24 pb-24 max-w-xl mx-auto text-center">
      <Badge className="mb-6">404 — Not found</Badge>
      <h1 className="h-display text-[clamp(3rem,8vw,6rem)] leading-[0.9] mb-4">
        This page <em className="h-italic text-glitch">doesn't exist.</em>
      </h1>
      <p className="text-ink/70 text-lg mb-10">
        Either the link is broken or the page was moved. Let's get you back on track.
      </p>
      <div className="flex justify-center gap-3">
        <Link href="/" className="btn-glitch">Go home →</Link>
        <Link href="/book" className="btn-outline">Book a clean</Link>
      </div>
    </section>
  );
}
