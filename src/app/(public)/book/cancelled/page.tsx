import Link from 'next/link';
import { Badge } from '@/components/ui';

export default function BookCancelledPage() {
  return (
    <section className="container-x pt-16 pb-24 max-w-2xl mx-auto text-center">
      <Badge className="mb-6">Payment cancelled</Badge>
      <h1 className="h-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] mb-4">
        No worries.
      </h1>
      <p className="text-ink/70 text-lg mb-10">
        Your order wasn't placed. Want to try again?
      </p>
      <div className="flex justify-center gap-3">
        <Link href="/book" className="btn-glitch">Start over →</Link>
        <Link href="/" className="btn-outline">Back home</Link>
      </div>
    </section>
  );
}
