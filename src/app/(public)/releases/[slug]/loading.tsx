export default function ReleaseLoading() {
  return (
    <section className="bg-bone">
      <div className="container-x py-16">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <div className="h-[480px] animate-pulse rounded-[2rem] border border-ink/10 bg-white/70" />
          <div className="h-[480px] animate-pulse rounded-[2rem] border border-ink/10 bg-white/70" />
        </div>
      </div>
    </section>
  );
}
