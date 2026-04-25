import { FEED_QUERIES } from '@/features/intelligence/catalog';
import { getSneakerFeed } from '@/features/intelligence/service';
import type { SneakerFeedItem, SourceHealth } from '@/features/intelligence/types';
import { getReleaseEditorialBySlug } from '@/features/releases/editorial';
import type { ReleaseAutomationCounts } from '@/features/releases/types';

export type KicksDbPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type ReleaseAutomationFamily = 'release' | 'worth-restoring' | 'how-to-clean' | 'release-alerts';

export interface ReleaseAutomationBudget {
  plan: KicksDbPlan;
  monthlyRequests: number;
  healthyRequestsPerDay: number;
  healthyNewReleasePagesPerDay: number;
  healthyWorthRestoringPagesPerDay: number;
  healthyHowToCleanPagesPerDay: number;
  healthyReleaseAlertPagesPerDay: number;
  healthyRefreshesPerDay: number;
  rationale: string;
}

export interface ReleaseAutomationEntry {
  family: ReleaseAutomationFamily;
  path: string;
  slug: string;
  title: string;
  description: string;
  brand: string;
  availability: string;
  marketStrength: number;
  restoration: number;
  preservationValue: number;
  primaryCta: string;
  updatedAt: string;
}

export interface ReleaseAutomationBudgetStatus {
  selected: number;
  limit: number;
  withinHealthyBudget: boolean;
  headroom: number;
}

export interface ReleaseAutomationBudgetUsage {
  estimatedPrimaryProviderRequestsPerRun: number;
  healthyRequestsPerDay: number;
  withinHealthyRequestBudget: boolean;
  release: ReleaseAutomationBudgetStatus;
  worthRestoring: ReleaseAutomationBudgetStatus;
  howToClean: ReleaseAutomationBudgetStatus;
  releaseAlerts: ReleaseAutomationBudgetStatus;
}

export interface ReleaseAutomationSlugDelta {
  added: string[];
  removed: string[];
}

export interface ReleaseAutomationChanges {
  release: ReleaseAutomationSlugDelta;
  worthRestoring: ReleaseAutomationSlugDelta;
}

export interface ReleaseAutomationProviderSummary {
  usedFallbackData: boolean;
  health: SourceHealth[];
  failures: SourceHealth[];
  warnings: string[];
}

export interface ReleaseEditorialFollowUpCandidate {
  family: 'release' | 'worth-restoring';
  slug: string;
  path: string;
  title: string;
  priority: 'high' | 'medium';
  reason: string;
}

export interface ReleaseAutomationManifest {
  generatedAt: string;
  budget: ReleaseAutomationBudget;
  counts: ReleaseAutomationCounts;
  budgetUsage: ReleaseAutomationBudgetUsage;
  changes: ReleaseAutomationChanges;
  providerSummary: ReleaseAutomationProviderSummary;
  editorialFollowUp: ReleaseEditorialFollowUpCandidate[];
  entries: ReleaseAutomationEntry[];
}

interface BuildReleaseAutomationManifestOptions {
  previousManifest?: Partial<ReleaseAutomationManifest> | null;
}

const MONTHLY_REQUESTS_BY_PLAN: Record<KicksDbPlan, number> = {
  free: 1000,
  starter: 50000,
  pro: 250000,
  enterprise: 1000000,
};

const HEALTHY_BUDGET_BY_PLAN: Record<KicksDbPlan, Omit<ReleaseAutomationBudget, 'plan' | 'monthlyRequests'>> = {
  free: {
    healthyRequestsPerDay: 20,
    healthyNewReleasePagesPerDay: 4,
    healthyWorthRestoringPagesPerDay: 1,
    healthyHowToCleanPagesPerDay: 2,
    healthyReleaseAlertPagesPerDay: 3,
    healthyRefreshesPerDay: 8,
    rationale:
      'Free plan should stay very conservative so automation does not crowd out live product traffic. This is enough for a daily sweep without quota anxiety.',
  },
  starter: {
    healthyRequestsPerDay: 150,
    healthyNewReleasePagesPerDay: 8,
    healthyWorthRestoringPagesPerDay: 4,
    healthyHowToCleanPagesPerDay: 6,
    healthyReleaseAlertPagesPerDay: 8,
    healthyRefreshesPerDay: 18,
    rationale:
      'Starter plan can handle a real daily pipeline, but the healthier SEO pace is still modest. Around 12 new pages/day plus refreshes is strong without flooding the site.',
  },
  pro: {
    healthyRequestsPerDay: 600,
    healthyNewReleasePagesPerDay: 20,
    healthyWorthRestoringPagesPerDay: 8,
    healthyHowToCleanPagesPerDay: 12,
    healthyReleaseAlertPagesPerDay: 16,
    healthyRefreshesPerDay: 50,
    rationale:
      'Pro can support a broader release engine, but publishing should still stay selective enough that the pages remain useful and crawl-worthy.',
  },
  enterprise: {
    healthyRequestsPerDay: 2500,
    healthyNewReleasePagesPerDay: 50,
    healthyWorthRestoringPagesPerDay: 20,
    healthyHowToCleanPagesPerDay: 30,
    healthyReleaseAlertPagesPerDay: 40,
    healthyRefreshesPerDay: 150,
    rationale:
      'Enterprise can support aggressive automation, but page quality and internal linking still matter more than raw volume.',
  },
};

function readPositiveInteger(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function detectPlan(): KicksDbPlan {
  const hint = (process.env.KICKSDB_PLAN ?? process.env.KICKSDB_KEY_TYPE ?? '').toLowerCase();
  if (hint.includes('enterprise')) return 'enterprise';
  if (hint.includes('pro')) return 'pro';
  if (hint.includes('starter')) return 'starter';
  return 'free';
}

function buildBudget(plan: KicksDbPlan): ReleaseAutomationBudget {
  const defaults = HEALTHY_BUDGET_BY_PLAN[plan];
  const healthyRequestsPerDay = readPositiveInteger(process.env.KICKSDB_DAILY_REQUEST_BUDGET) ?? defaults.healthyRequestsPerDay;
  const healthyNewReleasePagesPerDay =
    readPositiveInteger(process.env.KICKSDB_NEW_RELEASE_PAGES_PER_DAY) ?? defaults.healthyNewReleasePagesPerDay;
  const healthyWorthRestoringPagesPerDay =
    readPositiveInteger(process.env.KICKSDB_WORTH_RESTORING_PAGES_PER_DAY) ?? defaults.healthyWorthRestoringPagesPerDay;
  const healthyHowToCleanPagesPerDay =
    readPositiveInteger(process.env.KICKSDB_HOW_TO_CLEAN_PAGES_PER_DAY) ?? defaults.healthyHowToCleanPagesPerDay;
  const healthyReleaseAlertPagesPerDay =
    readPositiveInteger(process.env.KICKSDB_RELEASE_ALERT_PAGES_PER_DAY) ?? defaults.healthyReleaseAlertPagesPerDay;
  const healthyRefreshesPerDay =
    readPositiveInteger(process.env.KICKSDB_REFRESHES_PER_DAY) ?? defaults.healthyRefreshesPerDay;

  return {
    plan,
    monthlyRequests: MONTHLY_REQUESTS_BY_PLAN[plan],
    healthyRequestsPerDay,
    healthyNewReleasePagesPerDay,
    healthyWorthRestoringPagesPerDay,
    healthyHowToCleanPagesPerDay,
    healthyReleaseAlertPagesPerDay,
    healthyRefreshesPerDay,
    rationale:
      defaults.rationale +
      (process.env.KICKSDB_DAILY_REQUEST_BUDGET ||
      process.env.KICKSDB_NEW_RELEASE_PAGES_PER_DAY ||
      process.env.KICKSDB_WORTH_RESTORING_PAGES_PER_DAY ||
      process.env.KICKSDB_HOW_TO_CLEAN_PAGES_PER_DAY ||
      process.env.KICKSDB_RELEASE_ALERT_PAGES_PER_DAY ||
      process.env.KICKSDB_REFRESHES_PER_DAY
        ? ' Budget values are currently being overridden by environment configuration.'
        : ' No explicit plan hint was found, so ShoeGlitch defaults to the most conservative tier until KICKSDB_PLAN is set.'),
  };
}

function isWorthRestoring(item: SneakerFeedItem) {
  return item.scores.restoration >= 68 || item.scores.preservationValue >= 70 || item.scores.soleRisk >= 60;
}

function toEntry(item: SneakerFeedItem, family: ReleaseAutomationFamily): ReleaseAutomationEntry {
  if (family === 'release') {
    return {
      family,
      path: `/releases/${item.slug}`,
      slug: item.slug,
      title: item.name,
      description: item.rankingNote,
      brand: item.brand,
      availability: item.availability,
      marketStrength: item.scores.marketStrength,
      restoration: item.scores.restoration,
      preservationValue: item.scores.preservationValue,
      primaryCta: item.primaryCta.label,
      updatedAt: item.lastUpdatedAt,
    };
  }

  if (family === 'worth-restoring') {
    return {
      family,
      path: `/worth-restoring/${item.slug}`,
      slug: item.slug,
      title: `${item.name}: worth restoring?`,
      description: item.rankingNote,
      brand: item.brand,
      availability: item.availability,
      marketStrength: item.scores.marketStrength,
      restoration: item.scores.restoration,
      preservationValue: item.scores.preservationValue,
      primaryCta: 'Book restoration',
      updatedAt: item.lastUpdatedAt,
    };
  }

  if (family === 'how-to-clean') {
    return {
      family,
      path: `/how-to-clean/${item.slug}`,
      slug: item.slug,
      title: `How to clean ${item.name}`,
      description: item.rankingNote,
      brand: item.brand,
      availability: item.availability,
      marketStrength: item.scores.marketStrength,
      restoration: item.scores.restoration,
      preservationValue: item.scores.preservationValue,
      primaryCta: 'Book cleaning',
      updatedAt: item.lastUpdatedAt,
    };
  }

  return {
    family,
    path: `/release-alerts/${item.slug}`,
    slug: item.slug,
    title: `${item.name} release alerts`,
    description: item.rankingNote,
    brand: item.brand,
    availability: item.availability,
    marketStrength: item.scores.marketStrength,
    restoration: item.scores.restoration,
    preservationValue: item.scores.preservationValue,
    primaryCta: 'Join release alerts',
    updatedAt: item.lastUpdatedAt,
  };
}

function buildBudgetStatus(selected: number, limit: number): ReleaseAutomationBudgetStatus {
  return {
    selected,
    limit,
    withinHealthyBudget: selected <= limit,
    headroom: Math.max(0, limit - selected),
  };
}

function selectChangedSlugs(
  family: 'release' | 'worth-restoring',
  entries: ReleaseAutomationEntry[],
  previousEntries: ReleaseAutomationEntry[],
): ReleaseAutomationSlugDelta {
  const current = new Set(entries.filter((entry) => entry.family === family).map((entry) => entry.slug));
  const previous = new Set(previousEntries.filter((entry) => entry.family === family).map((entry) => entry.slug));

  return {
    added: [...current].filter((slug) => !previous.has(slug)).sort(),
    removed: [...previous].filter((slug) => !current.has(slug)).sort(),
  };
}

function scoreHealth(entry: SourceHealth) {
  if (entry.status === 'degraded') return 2;
  if (entry.status === 'fallback') return 1;
  return 0;
}

function summarizeHealth(entries: SourceHealth[]) {
  const byKey = new Map<string, SourceHealth>();

  for (const entry of entries) {
    const current = byKey.get(entry.key);
    if (!current) {
      byKey.set(entry.key, entry);
      continue;
    }

    const shouldReplace =
      scoreHealth(entry) > scoreHealth(current) ||
      (scoreHealth(entry) === scoreHealth(current) &&
        new Date(entry.lastAttemptAt).getTime() >= new Date(current.lastAttemptAt).getTime());

    if (shouldReplace) byKey.set(entry.key, entry);
  }

  return [...byKey.values()].sort((left, right) => right.lastAttemptAt.localeCompare(left.lastAttemptAt));
}

function buildProviderSummary(sourceHealth: SourceHealth[], usedFallbackData: boolean): ReleaseAutomationProviderSummary {
  const health = summarizeHealth(sourceHealth);
  const failures = health.filter((entry) => entry.status !== 'healthy');
  const warnings = failures.map((entry) => `${entry.label}: ${entry.message}`);

  if (usedFallbackData && !warnings.some((message) => message.includes('fallback'))) {
    warnings.push('Fallback data is active in the feed, so some release-content coverage may be thinner than live KicksDB output.');
  }

  return {
    usedFallbackData,
    health,
    failures,
    warnings,
  };
}

function buildEditorialReason(item: SneakerFeedItem, family: 'release' | 'worth-restoring') {
  if (family === 'worth-restoring') {
    return `${item.name} pairs strong restoration (${item.scores.restoration}) with preservation value (${item.scores.preservationValue}) and sole risk (${item.scores.soleRisk}).`;
  }

  const angle =
    item.availability === 'upcoming'
      ? `upcoming release pressure (${item.scores.releasePressure})`
      : `market strength (${item.scores.marketStrength})`;

  return `${item.name} has ${angle} plus preservation value (${item.scores.preservationValue}), which makes it worth manual context beyond the structured feed.`;
}

function buildEditorialPriority(item: SneakerFeedItem, family: 'release' | 'worth-restoring') {
  const score =
    family === 'worth-restoring'
      ? item.scores.restoration + item.scores.preservationValue + item.scores.soleRisk
      : item.scores.marketStrength + item.scores.releasePressure + item.scores.preservationValue;

  return score >= 190 ? 'high' : 'medium';
}

function buildEditorialScore(item: SneakerFeedItem, family: 'release' | 'worth-restoring') {
  if (family === 'worth-restoring') {
    return item.scores.restoration * 1.3 + item.scores.preservationValue * 1.2 + item.scores.soleRisk;
  }

  return (
    item.scores.marketStrength * 1.1 +
    item.scores.releasePressure * 1.2 +
    item.scores.preservationValue +
    (item.availability === 'upcoming' ? 12 : 0)
  );
}

function buildEditorialFollowUp(
  releaseItems: SneakerFeedItem[],
  worthRestoringItems: SneakerFeedItem[],
): ReleaseEditorialFollowUpCandidate[] {
  return [
    ...releaseItems.map((item) => ({ family: 'release' as const, item })),
    ...worthRestoringItems.map((item) => ({ family: 'worth-restoring' as const, item })),
  ]
    .filter(({ item }) => getReleaseEditorialBySlug(item.slug).status !== 'reviewed')
    .sort((left, right) => buildEditorialScore(right.item, right.family) - buildEditorialScore(left.item, left.family))
    .slice(0, 6)
    .map(({ family, item }) => ({
      family,
      slug: item.slug,
      path: family === 'release' ? `/releases/${item.slug}` : `/worth-restoring/${item.slug}`,
      title: family === 'release' ? item.name : `${item.name}: worth restoring?`,
      priority: buildEditorialPriority(item, family),
      reason: buildEditorialReason(item, family),
    }));
}

function countEntriesByFamily(entries: ReleaseAutomationEntry[]): ReleaseAutomationCounts {
  return {
    releasePages: entries.filter((entry) => entry.family === 'release').length,
    worthRestoringPages: entries.filter((entry) => entry.family === 'worth-restoring').length,
    howToCleanPages: entries.filter((entry) => entry.family === 'how-to-clean').length,
    releaseAlertPages: entries.filter((entry) => entry.family === 'release-alerts').length,
    total: entries.length,
  };
}

function preservePreviousManifest(
  previousManifest: Partial<ReleaseAutomationManifest>,
  providerSummary: ReleaseAutomationProviderSummary,
  editorialFollowUp: ReleaseEditorialFollowUpCandidate[],
) {
  const preservedEntries = Array.isArray(previousManifest.entries) ? previousManifest.entries : [];
  const warnings = [...providerSummary.warnings];

  warnings.push('Previous release-content manifest entries were preserved because current provider data is degraded.');

  return {
    entries: preservedEntries,
    counts: countEntriesByFamily(preservedEntries),
    changes: {
      release: { added: [], removed: [] },
      worthRestoring: { added: [], removed: [] },
    },
    editorialFollowUp:
      Array.isArray(previousManifest.editorialFollowUp) && previousManifest.editorialFollowUp.length > 0
        ? previousManifest.editorialFollowUp
        : editorialFollowUp,
    providerSummary: {
      ...providerSummary,
      warnings,
    },
  };
}

export async function buildReleaseAutomationManifest(
  options?: BuildReleaseAutomationManifestOptions,
): Promise<ReleaseAutomationManifest> {
  const feed = await getSneakerFeed({ includeNikePublic: false });
  const plan = detectPlan();
  const budget = buildBudget(plan);

  const releaseItems = feed.items.slice(0, budget.healthyNewReleasePagesPerDay + budget.healthyRefreshesPerDay);
  const worthRestoringItems = feed.items
    .filter(isWorthRestoring)
    .slice(0, budget.healthyWorthRestoringPagesPerDay + Math.floor(budget.healthyRefreshesPerDay / 3));
  const howToCleanItems = feed.items
    .filter((item) => item.scores.cleaning >= 56 || item.scores.wearVisibility >= 58 || item.scores.materialSensitivity >= 56)
    .slice(0, budget.healthyHowToCleanPagesPerDay + Math.floor(budget.healthyRefreshesPerDay / 4));
  const releaseAlertItems = feed.items
    .filter((item) => item.scores.marketWatchFit >= 56 || item.scores.releasePressure >= 52 || item.availability === 'upcoming')
    .slice(0, budget.healthyReleaseAlertPagesPerDay + Math.floor(budget.healthyRefreshesPerDay / 2));

  const releaseEntries = releaseItems.map((item) => toEntry(item, 'release'));
  const worthRestoringEntries = worthRestoringItems.map((item) => toEntry(item, 'worth-restoring'));
  const howToCleanEntries = howToCleanItems.map((item) => toEntry(item, 'how-to-clean'));
  const releaseAlertEntries = releaseAlertItems.map((item) => toEntry(item, 'release-alerts'));

  const entries = [...releaseEntries, ...worthRestoringEntries, ...howToCleanEntries, ...releaseAlertEntries].sort((a, b) =>
    a.path.localeCompare(b.path),
  );
  const previousManifest = options?.previousManifest;
  const previousEntries = Array.isArray(previousManifest?.entries) ? previousManifest.entries : [];
  const providerSummary = buildProviderSummary(feed.sourceHealth, feed.usedFallbackData);
  const editorialFollowUp = buildEditorialFollowUp(releaseItems, worthRestoringItems);
  const shouldPreservePrevious =
    previousEntries.length > entries.length &&
    (providerSummary.usedFallbackData || providerSummary.failures.length > 0);
  const selection = shouldPreservePrevious
    ? preservePreviousManifest(previousManifest ?? {}, providerSummary, editorialFollowUp)
    : {
        entries,
        counts: {
          releasePages: releaseEntries.length,
          worthRestoringPages: worthRestoringEntries.length,
          howToCleanPages: howToCleanEntries.length,
          releaseAlertPages: releaseAlertEntries.length,
          total: entries.length,
        },
        changes: {
          release: selectChangedSlugs('release', entries, previousEntries),
          worthRestoring: selectChangedSlugs('worth-restoring', entries, previousEntries),
        },
        editorialFollowUp,
        providerSummary,
      };
  const selectedCounts = countEntriesByFamily(selection.entries);

  return {
    generatedAt: new Date().toISOString(),
    budget,
    counts: selection.counts,
    budgetUsage: {
      estimatedPrimaryProviderRequestsPerRun: FEED_QUERIES.length,
      healthyRequestsPerDay: budget.healthyRequestsPerDay,
      withinHealthyRequestBudget: FEED_QUERIES.length <= budget.healthyRequestsPerDay,
      release: buildBudgetStatus(selectedCounts.releasePages, budget.healthyNewReleasePagesPerDay + budget.healthyRefreshesPerDay),
      worthRestoring: buildBudgetStatus(
        selectedCounts.worthRestoringPages,
        budget.healthyWorthRestoringPagesPerDay + Math.floor(budget.healthyRefreshesPerDay / 3),
      ),
      howToClean: buildBudgetStatus(
        selectedCounts.howToCleanPages,
        budget.healthyHowToCleanPagesPerDay + Math.floor(budget.healthyRefreshesPerDay / 4),
      ),
      releaseAlerts: buildBudgetStatus(
        selectedCounts.releaseAlertPages,
        budget.healthyReleaseAlertPagesPerDay + Math.floor(budget.healthyRefreshesPerDay / 2),
      ),
    },
    changes: selection.changes,
    providerSummary: selection.providerSummary,
    editorialFollowUp: selection.editorialFollowUp,
    entries: selection.entries,
  };
}
