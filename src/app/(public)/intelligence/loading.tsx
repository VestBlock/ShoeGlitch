export default function IntelligenceLoading() {
  return (
    <section className="container-x py-14">
      <div className="rounded-[2rem] border border-ink/10 bg-white/82 p-6 shadow-[0_24px_70px_rgba(10,15,31,0.06)] backdrop-blur-xl md:p-8">
        <div className="h-5 w-40 rounded-full bg-ink/10" />
        <div className="mt-5 h-16 max-w-3xl rounded-[1.5rem] bg-ink/8" />
        <div className="mt-4 h-6 max-w-2xl rounded-full bg-ink/8" />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-[1.8rem] border border-ink/10 bg-white">
              <div className="h-52 bg-ink/8" />
              <div className="space-y-4 p-5">
                <div className="h-8 w-3/4 rounded-full bg-ink/8" />
                <div className="h-5 w-1/2 rounded-full bg-ink/8" />
                <div className="h-20 rounded-[1rem] bg-ink/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
