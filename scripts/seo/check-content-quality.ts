#!/usr/bin/env tsx

export {};

type ManifestEntry = {
  path: string;
  family?: string;
};

type PageCheck = {
  path: string;
  title?: string;
  description?: string;
  jsonLd: boolean;
  conversionLink: boolean;
  failures: string[];
};

const BANNED_PUBLIC_COPY = [
  'Use realistic language',
  'Scaffolded next',
  'AI-readable',
  'mock text',
  'Lorem ipsum',
  'TODO',
];

function baseUrl() {
  return (process.env.SEO_BASE_URL ?? process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json() as Promise<T>;
}

function uniqueByPath(entries: ManifestEntry[]) {
  return Array.from(new Map(entries.map((entry) => [entry.path, entry])).values());
}

function textMatch(pattern: RegExp, body: string) {
  return body.match(pattern)?.[1]?.trim();
}

function hasConversionLink(body: string) {
  return /href="\/(?:book|operator\/apply|customer\/watchlist|release-alerts|intelligence)/i.test(body);
}

async function buildQualityTargets(root: string) {
  const [seo, releases] = await Promise.all([
    fetchJson<{ entries?: ManifestEntry[] }>(`${root}/api/seo/manifest`),
    fetchJson<{ entries?: ManifestEntry[] }>(`${root}/api/seo/release-manifest`),
  ]);

  const staticTargets: ManifestEntry[] = [
    { path: '/' },
    { path: '/services' },
    { path: '/book' },
    { path: '/become-an-operator' },
    { path: '/intelligence' },
  ];

  const seoTargets = (seo?.entries ?? [])
    .filter((entry) => !entry.path.startsWith('/api/'))
    .slice(0, 60);
  const releaseTargets = (releases?.entries ?? []).slice(0, 40);

  return uniqueByPath([...staticTargets, ...seoTargets, ...releaseTargets]);
}

async function checkPage(root: string, entry: ManifestEntry): Promise<PageCheck> {
  const response = await fetch(`${root}${entry.path}`, { redirect: 'follow' });
  const body = await response.text();
  const failures: string[] = [];

  if (!response.ok) failures.push(`returned ${response.status}`);

  const title = textMatch(/<title>(.*?)<\/title>/is, body);
  const description = textMatch(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/is, body);
  const jsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(body);
  const conversionLink = hasConversionLink(body);

  if (!title) failures.push('missing title');
  if (!description) failures.push('missing meta description');
  if (!/<h1[\s>]/i.test(body)) failures.push('missing h1');

  for (const phrase of BANNED_PUBLIC_COPY) {
    if (body.includes(phrase)) failures.push(`contains public placeholder/meta copy: "${phrase}"`);
  }

  if (!conversionLink && !entry.path.startsWith('/api/')) {
    failures.push('missing conversion-oriented link');
  }

  if (
    (entry.path.startsWith('/sneaker-cleaning') ||
      entry.path.startsWith('/shoe-restoration') ||
      entry.path.startsWith('/pickup-dropoff') ||
      entry.path.startsWith('/locations') ||
      entry.path.startsWith('/releases') ||
      entry.path.startsWith('/how-to-clean') ||
      entry.path.startsWith('/worth-restoring') ||
      entry.path.startsWith('/release-alerts') ||
      entry.path.startsWith('/operator')) &&
    !jsonLd
  ) {
    failures.push('missing JSON-LD structured data');
  }

  return {
    path: entry.path,
    title,
    description,
    jsonLd,
    conversionLink,
    failures,
  };
}

async function main() {
  const root = baseUrl();
  const targets = await buildQualityTargets(root);
  const checks: PageCheck[] = [];

  for (const target of targets) {
    checks.push(await checkPage(root, target));
  }

  const titleOwners = new Map<string, string[]>();
  const descriptionOwners = new Map<string, string[]>();

  for (const check of checks) {
    if (check.title) titleOwners.set(check.title, [...(titleOwners.get(check.title) ?? []), check.path]);
    if (check.description) descriptionOwners.set(check.description, [...(descriptionOwners.get(check.description) ?? []), check.path]);
  }

  for (const check of checks) {
    if (check.title && (titleOwners.get(check.title)?.length ?? 0) > 1) {
      check.failures.push(`duplicate title shared by ${titleOwners.get(check.title)?.join(', ')}`);
    }
    if (check.description && (descriptionOwners.get(check.description)?.length ?? 0) > 1) {
      check.failures.push(`duplicate description shared by ${descriptionOwners.get(check.description)?.join(', ')}`);
    }
  }

  const failures = checks.flatMap((check) => check.failures.map((failure) => `${check.path}: ${failure}`));
  console.log(JSON.stringify({ baseUrl: root, checked: checks.length, failures, checks }, null, 2));

  if (failures.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
