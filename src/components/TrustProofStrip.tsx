import { cn } from '@/lib/utils';

type TrustProofItem = {
  label: string;
  detail: string;
};

export default function TrustProofStrip({
  items,
  tone = 'light',
  className,
}: {
  items: TrustProofItem[];
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';

  return (
    <div
      className={cn(
        'grid gap-3 sm:grid-cols-3',
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'rounded-[1.3rem] border px-4 py-4 shadow-[0_16px_38px_rgba(10,15,31,0.08)] backdrop-blur-xl',
            dark
              ? 'border-white/12 bg-white/8 text-bone'
              : 'border-ink/10 bg-white/78 text-ink',
          )}
        >
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan" />
            <div className={cn('text-sm font-semibold', dark ? 'text-bone' : 'text-ink')}>
              {item.label}
            </div>
          </div>
          <p className={cn('mt-2 text-sm leading-6', dark ? 'text-bone/68' : 'text-ink/62')}>
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  );
}
