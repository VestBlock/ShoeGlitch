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

function labelForScore(key: SignalItem['key'], score: number) {
  if (key === 'cleaning') {
    if (score >= 78) return 'Easy clean';
    if (score >= 60) return 'Cleanable fast';
    if (score >= 45) return 'Careful clean';
    return 'Light upside';
  }
  if (key === 'restoration') {
    if (score >= 78) return 'Restore-ready';
    if (score >= 60) return 'Worth restoring';
    if (score >= 45) return 'Selective restore';
    return 'Cleaning-first';
  }
  if (key === 'market') {
    if (score >= 78) return 'Strong market';
    if (score >= 60) return 'Watch market';
    if (score >= 45) return 'Speculative';
    return 'Thin market';
  }
  if (key === 'serviceFit') {
    if (score >= 78) return 'Service lead';
    if (score >= 60) return 'Bookable pair';
    if (score >= 45) return 'Conditional fit';
    return 'Low service fit';
  }
  if (key === 'wear') {
    if (score >= 76) return 'Shows wear fast';
    if (score >= 58) return 'Visible wear';
    if (score >= 42) return 'Moderate wear';
    return 'Slower wear';
  }
  if (key === 'sole') {
    if (score >= 76) return 'Sole risk high';
    if (score >= 58) return 'Watch the sole';
    if (score >= 42) return 'Moderate sole risk';
    return 'Stable sole';
  }
  if (key === 'rarity') {
    if (score >= 76) return 'Collector pair';
    if (score >= 58) return 'Rarity signal';
    if (score >= 42) return 'Some rarity';
    return 'General release';
  }
  if (key === 'confidence') {
    if (score >= 76) return 'Strong data';
    if (score >= 58) return 'Usable data';
    if (score >= 42) return 'Partial data';
    return 'Thin data';
  }
  return 'Signal';
}

function firstReason(reasons: string[]) {
  return reasons[0] ?? 'Signal is still building from available data.';
}

export function buildScoreSignals(item: SneakerFeedItem, includeConfidence = false): SignalItem[] {
  const signals: SignalItem[] = [
    {
      key: 'cleaning',
      eyebrow: `Easy care later ${item.scores.cleaning}`,
      headline: labelForScore('cleaning', item.scores.cleaning),
      detail: firstReason(item.scores.reasons.cleaning),
      tone: toneForScore(item.scores.cleaning),
    },
    {
      key: 'restoration',
      eyebrow: `Restore later ${item.scores.restoration}`,
      headline: labelForScore('restoration', item.scores.restoration),
      detail: firstReason(item.scores.reasons.restoration),
      tone: toneForScore(item.scores.restoration),
    },
    {
      key: 'market',
      eyebrow: `Market heat ${item.scores.marketStrength}`,
      headline: labelForScore('market', item.scores.marketStrength),
      detail: firstReason(item.scores.reasons.marketStrength),
      tone: toneForScore(item.scores.marketStrength),
    },
    {
      key: 'serviceFit',
      eyebrow: `Aftercare fit ${item.scores.serviceFit}`,
      headline: labelForScore('serviceFit', item.scores.serviceFit),
      detail: firstReason(item.scores.reasons.serviceFit),
      tone: toneForScore(item.scores.serviceFit),
    },
  ];

  if (includeConfidence) {
    signals.push(
      {
        key: 'wear',
        eyebrow: `Wear shows fast ${item.scores.wearVisibility}`,
        headline: labelForScore('wear', item.scores.wearVisibility),
        detail: firstReason(item.scores.reasons.wearVisibility),
        tone: toneForScore(item.scores.wearVisibility),
      },
      {
        key: 'sole',
        eyebrow: `Sole risk later ${item.scores.soleRisk}`,
        headline: labelForScore('sole', item.scores.soleRisk),
        detail: firstReason(item.scores.reasons.soleRisk),
        tone: toneForScore(item.scores.soleRisk, false),
      },
      {
        key: 'rarity',
        eyebrow: `Collector value ${item.scores.rarity}`,
        headline: labelForScore('rarity', item.scores.rarity),
        detail: firstReason(item.scores.reasons.rarity),
        tone: toneForScore(item.scores.rarity),
      },
      {
        key: 'confidence',
        eyebrow: `Data confidence ${item.scores.confidence}`,
        headline: labelForScore('confidence', item.scores.confidence),
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
    <div className={`grid gap-3 ${includeConfidence ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
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
