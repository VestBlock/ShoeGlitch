import type { SneakerFeedItem } from '@/features/intelligence/types';

type SignalTone = 'green' | 'amber' | 'blue' | 'slate';

interface SignalItem {
  key: string;
  eyebrow: string;
  headline: string;
  detail: string;
  tone: SignalTone;
}

function toneClass(tone: SignalTone) {
  if (tone === 'green') {
    return 'border-emerald-200 bg-emerald-50/92 text-emerald-900 shadow-[0_14px_36px_rgba(16,185,129,0.12)]';
  }
  if (tone === 'amber') {
    return 'border-amber-200 bg-amber-50/90 text-amber-950 shadow-[0_14px_36px_rgba(245,158,11,0.12)]';
  }
  if (tone === 'blue') {
    return 'border-cyan-200 bg-cyan-50/90 text-cyan-950 shadow-[0_14px_36px_rgba(34,211,238,0.12)]';
  }
  return 'border-ink/10 bg-white/82 text-ink shadow-[0_14px_36px_rgba(10,15,31,0.06)]';
}

function dotClass(tone: SignalTone) {
  if (tone === 'green') return 'bg-emerald-500';
  if (tone === 'amber') return 'bg-amber-500';
  if (tone === 'blue') return 'bg-cyan';
  return 'bg-ink/30';
}

function toneForScore(score: number, positive = true): SignalTone {
  if (positive) {
    if (score >= 78) return 'green';
    if (score >= 58) return 'blue';
    if (score >= 42) return 'amber';
    return 'slate';
  }
  if (score >= 72) return 'amber';
  if (score >= 48) return 'blue';
  return 'slate';
}

function firstReason(reasons: string[]) {
  return reasons[0] ?? 'Signal is still building from available data.';
}

export function buildScoreSignals(item: SneakerFeedItem, includeConfidence = false): SignalItem[] {
  const careIsRestoration = item.scores.restoration >= item.scores.cleaning;
  const careScore = careIsRestoration ? item.scores.restoration : item.scores.cleaning;
  const careReason = careIsRestoration
    ? firstReason(item.scores.reasons.restoration)
    : firstReason(item.scores.reasons.cleaning);

  const signals: SignalItem[] = [
    {
      key: 'save',
      eyebrow: 'Best move right now',
      headline:
        item.scores.releasePressure >= 76
          ? 'Save it early'
          : item.scores.releasePressure >= 56
            ? 'Keep it close'
            : 'Watch for updates',
      detail: firstReason(item.scores.reasons.releasePressure),
      tone: toneForScore(item.scores.releasePressure),
    },
    {
      key: 'market',
      eyebrow: 'Release demand',
      headline:
        item.scores.marketStrength >= 76
          ? 'Strong demand'
          : item.scores.marketStrength >= 56
            ? 'Good watchlist candidate'
            : 'Worth checking back on',
      detail: firstReason(item.scores.reasons.marketStrength),
      tone: toneForScore(item.scores.marketStrength),
    },
    {
      key: 'care',
      eyebrow: 'After you own it',
      headline:
        careScore >= 76
          ? careIsRestoration
            ? 'Worth restoring later'
            : 'Easy to clean later'
          : careScore >= 56
            ? careIsRestoration
              ? 'Could deserve restoration'
              : 'Should clean up well'
            : 'Mostly a release play',
      detail: careReason,
      tone: toneForScore(careScore),
    },
  ];

  if (includeConfidence) {
    signals.push(
      {
        key: 'rarity',
        eyebrow: 'Longer-term upside',
        headline:
          item.scores.rarity >= 76
            ? 'Collector interest'
            : item.scores.rarity >= 56
              ? 'Some long-term value'
              : 'Mostly everyday demand',
        detail: firstReason(item.scores.reasons.rarity),
        tone: toneForScore(item.scores.rarity),
      },
      {
        key: 'confidence',
        eyebrow: 'Data quality',
        headline:
          item.scores.confidence >= 76
            ? 'Strong read'
            : item.scores.confidence >= 56
              ? 'Useful read'
              : 'Still developing',
        detail: firstReason(item.scores.reasons.confidence),
        tone: toneForScore(item.scores.confidence),
      },
    );
  }

  return signals;
}

export default function IntelligenceSignals({
  item,
  includeConfidence = false,
}: {
  item: SneakerFeedItem;
  includeConfidence?: boolean;
}) {
  const signals = buildScoreSignals(item, includeConfidence);

  return (
    <div className={`grid gap-3 ${includeConfidence ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
      {signals.map((signal) => (
        <div
          key={signal.key}
          className={`rounded-[1.15rem] border px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 ${toneClass(signal.tone)}`}
        >
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full motion-safe:animate-pulse ${dotClass(signal.tone)}`} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">{signal.eyebrow}</span>
          </div>
          <div className="mt-3 text-base font-semibold">{signal.headline}</div>
          <div className="mt-1 text-sm opacity-75">{signal.detail}</div>
        </div>
      ))}
    </div>
  );
}
