import Link from 'next/link';
import { Badge, Card } from '@/components/ui';
import IntelligenceSignals from '@/components/intelligence/IntelligenceSignals';
import WatchlistQuickAddButton from '@/components/intelligence/WatchlistQuickAddButton';
import { formatDateOnly } from '@/lib/utils';
import type { SneakerFeedItem } from '@/features/intelligence/types';

function flagTone(flag: SneakerFeedItem['opportunityFlags'][number]) {
  if (flag === 'cleaning' || flag === 'restoration') return 'neon';
  if (flag === 'flip' || flag === 'watch') return 'glitch';
  return 'default';
}

export default function SneakerCard({ item }: { item: SneakerFeedItem }) {
  const watchCta = item.primaryCta.kind === 'join-waitlist'
    ? item.primaryCta
    : item.secondaryCta.kind === 'join-waitlist'
      ? item.secondaryCta
      : null;

  const serviceCta = item.primaryCta.kind === 'join-waitlist' ? item.secondaryCta : item.primaryCta;

  return (
    <Card className="group intelligence-card overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,248,252,0.92))] p-0 shadow-[0_24px_70px_rgba(10,15,31,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_36px_90px_rgba(10,15,31,0.18)]">
      <div className="relative h-60 overflow-hidden bg-[linear-gradient(180deg,#07111f_0%,#0a2456_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.20),transparent_28%),linear-gradient(180deg,rgba(8,33,77,0.04),rgba(8,33,77,0.52))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_24%,rgba(0,229,255,0.20),transparent_20%),radial-gradient(circle_at_26%_78%,rgba(255,77,109,0.16),transparent_22%)]" />
        <div
          className="absolute inset-0 bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url(${item.media.thumbnailUrl})`,
            backgroundSize: 'contain',
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.02),rgba(7,17,31,0)_44%,rgba(7,17,31,0.26)_100%)]" />
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
        <div className="flex items-start justify-between gap-4 border-b border-ink/8 pb-5">
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

        <p className="mt-4 text-sm leading-6 text-ink/66 max-h-[4.5rem] overflow-hidden">{item.description}</p>

        <div className="mt-5 rounded-[1.2rem] border border-ink/10 bg-bone-soft/80 p-4">
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
          <div className="max-w-[19rem]">
            <div className="text-[10px] uppercase tracking-[0.24em] text-ink/45">Market snapshot</div>
            <div className="mt-2 text-base font-semibold text-ink">
              {item.market.estimatedResale
                ? `$${item.market.estimatedResale}`
                : item.priceSummary.lowestAsk
                  ? `$${item.priceSummary.lowestAsk}`
                  : 'Awaiting market data'}
            </div>
            <div className="mt-1 max-h-[2.6rem] overflow-hidden text-xs leading-5 text-ink/50">{item.rankingNote}</div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              href={`/intelligence/${item.slug}`}
              className="btn-outline min-h-[2.9rem] px-4 text-xs"
              data-growth-cta="Open pair detail"
            >
              Open pair
            </Link>
            <Link
              href={serviceCta.href}
              className="btn-outline min-h-[2.9rem] px-4 text-xs"
              data-growth-cta={serviceCta.label}
            >
              {serviceCta.label}
            </Link>
            {watchCta ? <WatchlistQuickAddButton item={item} compact /> : null}
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
