import Link from 'next/link';
import { Badge, Card } from '@/components/ui';
import IntelligenceSignals from '@/components/intelligence/IntelligenceSignals';
import { formatDateOnly } from '@/lib/utils';
import type { SneakerFeedItem } from '@/features/intelligence/types';

function flagTone(flag: SneakerFeedItem['opportunityFlags'][number]) {
  if (flag === 'cleaning' || flag === 'restoration') return 'neon';
  if (flag === 'flip' || flag === 'watch') return 'glitch';
  return 'default';
}

export default function SneakerCard({ item }: { item: SneakerFeedItem }) {
  return (
    <Card className="overflow-hidden p-0 shadow-[0_20px_56px_rgba(10,15,31,0.08)]">
      <div className="relative h-60 overflow-hidden bg-[linear-gradient(180deg,#0a2456_0%,#10397d_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(180deg,rgba(8,33,77,0.06),rgba(8,33,77,0.46))]" />
        <div
          className="absolute inset-0 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${item.media.thumbnailUrl})`,
            backgroundSize: 'contain',
          }}
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge tone="dark" className="border-white/20 bg-ink/40 text-white">
            {item.brand}
          </Badge>
          <Badge className="border-white/15 bg-white/80 text-ink/75">{formatDateOnly(item.release.date)}</Badge>
          <Badge tone="glitch" className="bg-white text-glitch">
            {item.availability}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.26em] text-ink/45">{item.silhouette}</div>
            <h3 className="mt-2 h-display text-[2rem] leading-[0.96] text-ink">
              <Link href={`/intelligence/${item.slug}`} className="hover:text-glitch transition">
                {item.name}
              </Link>
            </h3>
            <p className="mt-2 text-sm text-ink/62">{item.colorway}</p>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.24em] text-ink/45">Retail</div>
            <div className="h-display text-3xl text-ink">${item.release.retailPrice}</div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-ink/66">{item.description}</p>

        <div className="mt-5">
          <IntelligenceSignals item={item} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {item.opportunityFlags.map((flag) => (
            <Badge key={flag} tone={flagTone(flag)}>
              {flag}
            </Badge>
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-ink/45">Market snapshot</div>
            <div className="mt-2 text-base font-semibold text-ink">
              {item.market.estimatedResale
                ? `$${item.market.estimatedResale}`
                : item.priceSummary.lowestAsk
                  ? `$${item.priceSummary.lowestAsk}`
                  : 'Awaiting market data'}
            </div>
            <div className="mt-1 text-xs text-ink/50">{item.rankingNote}</div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              href={item.secondaryCta.href}
              className="btn-outline min-h-[2.9rem] px-4 text-xs"
              data-growth-cta={item.secondaryCta.label}
            >
              {item.secondaryCta.label}
            </Link>
            <Link
              href={item.primaryCta.href}
              className="btn-glitch min-h-[2.9rem] px-4 text-xs"
              data-growth-cta={item.primaryCta.label}
            >
              {item.primaryCta.label}
            </Link>
            {item.marketUrl ? (
              <Link
                href={item.marketUrl}
                className="btn-outline min-h-[2.9rem] px-4 text-xs"
                target="_blank"
                data-growth-cta="View market"
              >
                View market
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
