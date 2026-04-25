const RESULTS = [
  {
    src: '/media/editorial/actual-before-after-1.jpeg',
    alt: 'Actual before and after sneaker restoration example',
    label: 'Work sample',
    detail: 'Actual finished work should sit right next to the offer.',
  },
  {
    src: '/media/editorial/actual-before-after-2.jpeg',
    alt: 'Actual close-up before and after sneaker cleaning example',
    label: 'Detail result',
    detail: 'Close-up proof helps the cleaning claims feel believable.',
  },
  {
    src: '/media/editorial/jordan1-rotation.jpeg',
    alt: 'Jordan 1 rotation restoration visual',
    label: 'Signature finish',
    detail: 'One cleaner editorial image is enough to keep the layout elevated.',
  },
] as const;

const TESTIMONIALS = [
  {
    src: '/media/editorial/actual-before-after-1.jpeg',
    alt: 'Actual before and after sneaker restoration proof image',
  },
  {
    src: '/media/editorial/actual-before-after-2.jpeg',
    alt: 'Actual before and after close-up sneaker proof image',
  },
] as const;

export default function ResultsProofGrid({ showTestimonials = true }: { showTestimonials?: boolean }) {
  return (
    <>
      <section className="container-x pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {RESULTS.map((item) => (
            <figure key={item.src} className="result-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.alt} className="result-card-image" loading="lazy" />
              <figcaption className="result-card-copy">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-glitch/82">
                  {item.label}
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/62">{item.detail}</p>
              </figcaption>
            </figure>
          ))}
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
