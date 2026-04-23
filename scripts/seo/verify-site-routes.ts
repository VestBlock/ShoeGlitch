#!/usr/bin/env tsx

type RouteExpectation = {
  path: string;
  expect: 'ok' | 'redirect';
  locationIncludes?: string;
};

function baseUrl() {
  return process.env.SEO_BASE_URL ?? process.argv[2] ?? 'http://localhost:3000';
}

async function fetchText(url: string, redirect: RequestRedirect = 'follow') {
  const response = await fetch(url, { redirect });
  const body = await response.text();
  return { response, body };
}

function assertPageShape(body: string) {
  return {
    title: /<title>.*<\/title>/i.test(body),
    description: /<meta[^>]+name="description"/i.test(body),
    h1: /<h1[\s>]/i.test(body),
  };
}

async function buildDynamicExpectations(root: string): Promise<RouteExpectation[]> {
  const dynamic: RouteExpectation[] = [];

  const [releaseManifest, seoManifest] = await Promise.all([
    fetchText(`${root}/api/seo/release-manifest`),
    fetchText(`${root}/api/seo/manifest`),
  ]);

  if (releaseManifest.response.ok) {
    const data = JSON.parse(releaseManifest.body) as {
      entries?: Array<{ family: string; path: string }>;
    };
    const wantedFamilies = ['release', 'worth-restoring', 'how-to-clean', 'release-alerts'];
    for (const family of wantedFamilies) {
      const match = data.entries?.find((entry) => entry.family === family);
      if (match) dynamic.push({ path: match.path, expect: 'ok' });
    }
  }

  if (seoManifest.response.ok) {
    const data = JSON.parse(seoManifest.body) as {
      entries?: Array<{ family: string; path: string }>;
    };
    const wantedFamilies = ['hub', 'city', 'area', 'near-me', 'operator-hub', 'operator-city', 'operator-guide'];
    for (const family of wantedFamilies) {
      const match = data.entries?.find((entry) => entry.family === family);
      if (match) dynamic.push({ path: match.path, expect: 'ok' });
    }
  }

  return dynamic;
}

async function main() {
  const root = baseUrl().replace(/\/$/, '');
  const baseExpectations: RouteExpectation[] = [
    { path: '/', expect: 'ok' },
    { path: '/services', expect: 'ok' },
    { path: '/coverage', expect: 'ok' },
    { path: '/mail-in', expect: 'ok' },
    { path: '/book', expect: 'ok' },
    { path: '/pickup-dropoff', expect: 'ok' },
    { path: '/operator', expect: 'ok' },
    { path: '/operator/apply', expect: 'ok' },
    { path: '/operators', expect: 'ok' },
    { path: '/become-an-operator', expect: 'ok' },
    { path: '/intelligence', expect: 'ok' },
    { path: '/locations', expect: 'ok' },
    { path: '/sneaker-cleaning', expect: 'ok' },
    { path: '/shoe-restoration', expect: 'ok' },
    { path: '/api/seo/manifest', expect: 'ok' },
    { path: '/api/seo/release-manifest', expect: 'ok' },
    { path: '/api/intelligence/search?q=Jordan&limit=1', expect: 'ok' },
    { path: '/customer/watchlist', expect: 'redirect', locationIncludes: '/login' },
    { path: '/admin/intelligence', expect: 'redirect', locationIncludes: '/login' },
  ];

  const dynamic = await buildDynamicExpectations(root);
  const deduped = new Map<string, RouteExpectation>();
  for (const item of [...baseExpectations, ...dynamic]) deduped.set(item.path, item);

  const failures: string[] = [];
  const results: Array<Record<string, unknown>> = [];

  for (const route of deduped.values()) {
    const url = `${root}${route.path}`;
    const redirectMode = route.expect === 'redirect' ? 'manual' : 'follow';
    const { response, body } = await fetchText(url, redirectMode);

    if (route.expect === 'redirect') {
      const location = response.headers.get('location') ?? '';
      const ok =
        response.status >= 300 &&
        response.status < 400 &&
        (!route.locationIncludes || location.includes(route.locationIncludes));
      results.push({ path: route.path, status: response.status, location, ok });
      if (!ok) failures.push(`${route.path} expected redirect${route.locationIncludes ? ` to ${route.locationIncludes}` : ''}`);
      continue;
    }

    const shape = assertPageShape(body);
    const ok = response.ok;
    results.push({ path: route.path, status: response.status, ...shape, ok });
    if (!ok) failures.push(`${route.path} returned ${response.status}`);
    if (!route.path.startsWith('/api/') && ok) {
      if (!shape.title) failures.push(`${route.path} missing <title>`);
      if (!shape.description) failures.push(`${route.path} missing meta description`);
      if (!shape.h1) failures.push(`${route.path} missing h1`);
    }
  }

  console.log(JSON.stringify({ baseUrl: root, checked: results.length, failures, results }, null, 2));

  if (failures.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
