const TESTIMONIALS = [
  {
    src: '/media/editorial/actual-before-after-1.jpeg',
    alt: 'Actual before and after sneaker restoration proof image',
  },
] as const;

export default function ResultsProofGrid({ showTestimonials = true }: { showTestimonials?: boolean }) {
  return (
    <>
      <section className="container-x pb-16">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-glitch/85">Specialty proof</div>
            <h2 className="h-display mt-2 text-4xl leading-[0.96] text-ink md:text-6xl">
              Red-bottom work gets
              <br />
              a clear before and after.
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-ink/62 md:text-base">
            The dirty outsole and repainted finish stay together in one comparison, so Elite restoration work is easy to understand.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.22fr)_minmax(320px,0.78fr)] lg:items-stretch">
          <figure className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-[0_24px_60px_rgba(10,15,31,0.08)]">
            <div className="grid gap-4 bg-bone-soft p-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-[1.35rem] border border-ink/10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/editorial/redbottom-before.png"
                  alt="Dirty red-bottom sneaker outsole before repaint restoration"
                  className="h-[420px] w-full object-contain p-2 md:h-[520px]"
                  loading="lazy"
                />
              </div>
              <div className="overflow-hidden rounded-[1.35rem] border border-ink/10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/editorial/redbottom-after.png"
                  alt="Red-bottom sneaker outsole after repaint restoration"
                  className="h-[420px] w-full object-contain p-2 md:h-[520px]"
                  loading="lazy"
                />
              </div>
            </div>
            <figcaption className="border-t border-ink/10 px-5 py-5 md:px-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-glitch/82">
                Elite restoration
              </div>
              <p className="mt-2 text-sm leading-6 text-ink/62">
                Controlled red-bottom repaint correction for pairs that need specialty outsole work, not wild custom colors.
              </p>
            </figcaption>
          </figure>

          <figure className="overflow-hidden rounded-[2rem] border border-ink/10 bg-ink shadow-[0_24px_60px_rgba(10,15,31,0.14)]">
            <div className="relative min-h-[520px]">
              <video
                className="absolute inset-0 h-full w-full object-contain"
                src="/media/editorial/actual-process-b.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-[1.2rem] border border-white/12 bg-ink/35 px-4 py-4 text-sm leading-6 text-white/74 backdrop-blur-md">
                A quick look at real work in progress before you choose the service tier.
              </div>
            </div>
          </figure>
        </div>
      </section>

      {showTestimonials ? (
        <section className="container-x pb-16">
          <div className="grid gap-5 lg:grid-cols-2">
            {TESTIMONIALS.map((item) => (
              <figure key={item.src} className="testimonial-visual-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt={item.alt} className="testimonial-visual-image" loading="lazy" />
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
