import Link from 'next/link';

const MEDIA_ITEMS = [
  {
    src: '/media/editorial/actual-before-after-1.jpeg',
    alt: 'Real before and after restoration result on a black and infrared sneaker',
    eyebrow: 'Real result',
    title: 'Actual before-and-after work should carry the trust.',
  },
  {
    src: '/media/editorial/actual-before-after-2.jpeg',
    alt: 'Real close-up before and after sneaker restoration collage',
    eyebrow: 'Close-up detail',
    title: 'Texture, suede, and edge cleanup read better when it is your work.',
  },
] as const;

export default function EditorialSpotlight() {
  return (
    <section className="container-x py-16 md:py-20">
      <div className="section-shell editorial-shell p-6 md:p-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="section-kicker">Proof in motion</div>
            <h2 className="h-display mt-4 text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.9] text-ink">
              Before, after, and the work in between.
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink/65 md:text-base">
              The site should show real outcomes, not just talk about them. These moments keep the flow visual without making the page feel crowded.
            </p>
          </div>
          <Link href="/book" className="btn-outline shrink-0">
            Book your pair →
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="editorial-video-card">
            <video
              className="editorial-video"
              src="/media/editorial/actual-process-a.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
            <div className="editorial-video-overlay">
              <div className="font-mono text-[11px] uppercase tracking-[0.26em] text-cyan/85">
                Actual process
              </div>
              <h3 className="h-display mt-3 text-3xl leading-[0.96] text-white md:text-4xl">
                Real restoration footage belongs in the site, not just polished mockups.
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">
                Muted motion keeps the page alive while still letting the booking flow lead.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
            <div className="editorial-mini-video">
              <video
                className="editorial-video"
                src="/media/editorial/actual-process-b.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
              <div className="editorial-mini-copy">
                <span className="badge-dark border-white/15">Muted loop</span>
                <p className="mt-3 text-sm leading-6 text-white/72">
                  Quiet proof beats another paragraph every time.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
              {MEDIA_ITEMS.map((item) => (
                <figure key={item.src} className="editorial-image-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.alt} className="editorial-image" loading="lazy" />
                  <figcaption className="editorial-card-copy">
                    <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-glitch/85">
                      {item.eyebrow}
                    </div>
                    <div className="mt-2 text-sm font-semibold leading-6 text-ink">{item.title}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
