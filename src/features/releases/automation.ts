import { getSneakerFeed } from '@/features/intelligence/service';
import type { ReleaseAutomationCounts } from '@/features/releases/types';

export type KicksDbPlan = 'free' | 'starter' | 'pro' | 'enterprise';

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
  family: 'release' | 'worth-restoring' | 'how-to-clean' | 'release-alerts';
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

export interface ReleaseAutomationManifest {
  generatedAt: string;
  budget: ReleaseAutomationBudget;
  counts: ReleaseAutomationCounts;
  entries: ReleaseAutomationEntry[];
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

function isWorthRestoring(item: Awaited<ReturnType<typeof getSneakerFeed>>['items'][number]) {
  return item.scores.restoration >= 68 || item.scores.preservationValue >= 70 || item.scores.soleRisk >= 60;
}

export async function buildReleaseAutomationManifest(): Promise<ReleaseAutomationManifest> {
  const feed = await getSneakerFeed();
  const plan = detectPlan();
  const budget = buildBudget(plan);

  const releaseEntries: ReleaseAutomationEntry[] = feed.items
    .slice(0, budget.healthyNewReleasePagesPerDay + budget.healthyRefreshesPerDay)
    .map((item) => ({
      family: 'release',
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
    }));

  const worthRestoringEntries: ReleaseAutomationEntry[] = feed.items
    .filter(isWorthRestoring)
    .slice(0, budget.healthyWorthRestoringPagesPerDay + Math.floor(budget.healthyRefreshesPerDay / 3))
    .map((item) => ({
      family: 'worth-restoring',
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
    }));

  const howToCleanEntries: ReleaseAutomationEntry[] = feed.items
    .filter((item) => item.scores.cleaning >= 56 || item.scores.wearVisibility >= 58 || item.scores.materialSensitivity >= 56)
    .slice(0, budget.healthyHowToCleanPagesPerDay + Math.floor(budget.healthyRefreshesPerDay / 4))
    .map((item) => ({
      family: 'how-to-clean',
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
    }));

  const releaseAlertEntries: ReleaseAutomationEntry[] = feed.items
    .filter((item) => item.scores.marketWatchFit >= 56 || item.scores.releasePressure >= 52 || item.availability === 'upcoming')
    .slice(0, budget.healthyReleaseAlertPagesPerDay + Math.floor(budget.healthyRefreshesPerDay / 2))
    .map((item) => ({
      family: 'release-alerts',
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
    }));

  const entries = [...releaseEntries, ...worthRestoringEntries, ...howToCleanEntries, ...releaseAlertEntries].sort((a, b) =>
    a.path.localeCompare(b.path),
  );

  return {
    generatedAt: new Date().toISOString(),
    budget,
    counts: {
      releasePages: releaseEntries.length,
      worthRestoringPages: worthRestoringEntries.length,
      howToCleanPages: howToCleanEntries.length,
      releaseAlertPages: releaseAlertEntries.length,
      total: entries.length,
    },
    entries,
  };
}
