import { Badge, Card } from '@/components/ui';
import { operatorTrainingVideos } from '@/features/operators/training-videos';

export default function OperatorTrainingModule({
  title = 'Cleaning training module',
  compact = false,
}: {
  title?: string;
  compact?: boolean;
}) {
  const videos = compact ? operatorTrainingVideos.slice(0, 4) : operatorTrainingVideos;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-glitch mb-2">Operator training</div>
          <h2 className="h-display text-3xl">{title}</h2>
        </div>
        <Badge tone="acid">
          Steam Clean is part of Basic, Pro, and Elite
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5 mb-5">
        <Card className="card-lift">
          <div className="font-mono text-xs uppercase tracking-widest text-ink/42 mb-2">How to use this</div>
          <div className="space-y-3 text-sm leading-6 text-ink/62">
            <p>
              These are the best outside training references we found for material handling, silhouette-specific work,
              and mistake prevention. They are here to sharpen technique, not replace the ShoeGlitch standard.
            </p>
            <p>
              In our workflow, Steam Clean is the baseline across Basic, Pro, and Elite. Pro and Luxury operators also
              receive the ice box setup for higher-tier work.
            </p>
            <p>
              Best watch order: laundry system first, then mesh, suede, Jordan 4, and finally icy-sole restoration.
            </p>
          </div>
        </Card>

        <Card className="card-lift">
          <div className="font-mono text-xs uppercase tracking-widest text-ink/42 mb-2">Fastest wins</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="text-xs text-ink/45">Start here</div>
              <div className="mt-2 font-semibold text-ink">Laundry system</div>
              <div className="mt-1 text-sm text-ink/60">Build one repeatable deep-clean process first.</div>
            </div>
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="text-xs text-ink/45">Protect margin</div>
              <div className="mt-2 font-semibold text-ink">Suede + nubuck</div>
              <div className="mt-1 text-sm text-ink/60">This is where careless technique costs the most.</div>
            </div>
            <div className="rounded-[1rem] border border-ink/10 bg-bone-soft px-4 py-4">
              <div className="text-xs text-ink/45">Most common ask</div>
              <div className="mt-2 font-semibold text-ink">Jordan 4 + AF1</div>
              <div className="mt-1 text-sm text-ink/60">Tighten the silhouettes customers judge hardest.</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
        {videos.map((video) => (
          <Card key={video.slug} className="card-lift h-full flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge tone={video.featured ? 'glitch' : 'default'}>{video.category}</Badge>
              <Badge>{video.material}</Badge>
            </div>
            <div className="font-semibold text-xl text-ink leading-7">{video.title}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.24em] text-ink/42">{video.provider}</div>
            <div className="mt-4 text-sm leading-6 text-ink/62">
              <p>
                <span className="font-semibold text-ink">Best for:</span> {video.bestFor}
              </p>
              <p className="mt-3">
                <span className="font-semibold text-ink">Why it matters:</span> {video.whyItMatters}
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 text-xs text-ink/45">
              <span>{video.publishedLabel}</span>
              <a
                href={video.href}
                target="_blank"
                rel="noreferrer"
                className="btn-outline whitespace-nowrap"
              >
                Open video →
              </a>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
