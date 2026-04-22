export function FeedEmptyState() {
  return (
    <div className="rounded-[1.8rem] border border-dashed border-ink/15 bg-white/72 p-8 text-center shadow-[0_18px_48px_rgba(10,15,31,0.05)] backdrop-blur-xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">No matches</div>
      <h3 className="h-display mt-4 text-3xl text-ink">No sneakers fit that filter set.</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink/66">
        Try a different brand, clear the search, or switch back to all opportunity angles to surface the next best release candidate.
      </p>
    </div>
  );
}

export function FeedErrorState() {
  return (
    <div className="rounded-[1.8rem] border border-glitch/18 bg-white/76 p-8 shadow-[0_18px_48px_rgba(10,15,31,0.05)] backdrop-blur-xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">Feed interrupted</div>
      <h3 className="h-display mt-4 text-3xl text-ink">The intelligence feed is having a moment.</h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/68">
        Source coverage or normalization failed harder than the fallback layer can mask. Refresh the page or come back shortly.
      </p>
    </div>
  );
}

export function FeedHealthBanner({
  copy,
  tone = 'default',
}: {
  copy: string;
  tone?: 'default' | 'warn';
}) {
  return (
    <div
      className={`rounded-[1.4rem] border px-4 py-3 text-sm shadow-[0_14px_36px_rgba(10,15,31,0.05)] ${
        tone === 'warn'
          ? 'border-glitch/15 bg-glitch/[0.06] text-ink/80'
          : 'border-ink/10 bg-white/78 text-ink/68'
      }`}
    >
      {copy}
    </div>
  );
}
