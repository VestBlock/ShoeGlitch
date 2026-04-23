import Link from 'next/link';

const INTEREST_OPTIONS = [
  { value: 'cleaning', label: 'Cleaning operator' },
  { value: 'restoration', label: 'Restoration support' },
  { value: 'pickup-dropoff', label: 'Pickup & drop-off' },
] as const;

const AVAILABILITY_OPTIONS = [
  { value: 'nights-weekends', label: 'Nights & weekends' },
  { value: 'part-time-weekday', label: 'Part-time weekdays' },
  { value: 'full-time-ready', label: 'Ready for full-time territory work' },
] as const;

export default function OperatorPrequalCard({
  citySlug,
  cityName,
}: {
  citySlug?: string;
  cityName?: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-ink/10 bg-white/82 p-5 shadow-[0_16px_40px_rgba(10,15,31,0.06)] backdrop-blur-xl md:p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/85">
        Quick operator check
      </div>
      <h3 className="h-display mt-3 text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.98] text-ink">
        See which operator path fits before you apply.
      </h3>
      <p className="mt-3 text-sm leading-6 text-ink/66">
        Start with the role, availability, and market you want. The live application stays the same, but this step
        helps route people into the right version of it first.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {INTEREST_OPTIONS.map((interest) => (
          <Link
            key={interest.value}
            href={`/operator/apply?tier=starter${citySlug ? `&city=${citySlug}` : ''}&focus=${interest.value}`}
            className="rounded-[1.1rem] border border-ink/10 bg-bone-soft px-4 py-4 text-sm font-semibold text-ink transition hover:border-glitch/25 hover:bg-white hover:text-glitch"
          >
            {interest.label}
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {AVAILABILITY_OPTIONS.map((availability) => (
          <Link
            key={availability.value}
            href={`/operator/apply?tier=starter${citySlug ? `&city=${citySlug}` : ''}&availability=${availability.value}`}
            className="rounded-[1.1rem] border border-ink/10 bg-white px-4 py-4 text-sm text-ink/68 transition hover:border-cyan/30 hover:text-ink"
          >
            {availability.label}
          </Link>
        ))}
      </div>

      <div className="mt-5 rounded-[1rem] border border-cyan/30 bg-cyan/8 px-4 py-3 text-sm leading-6 text-ink/66">
        {cityName
          ? `If ${cityName} is your target market, the city stays preselected when you move into the live application.`
          : 'Choose a city or operator opportunity page first if you want the application prefilled for your market.'}
      </div>
    </div>
  );
}
