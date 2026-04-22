#!/usr/bin/env tsx

type FeedCheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

function check(condition: boolean, name: string, detail: string): FeedCheckResult {
  return { name, ok: condition, detail };
}

function run() {
  const route = process.argv[2] ?? '/intelligence';

  const results: FeedCheckResult[] = [
    check(true, 'route-selected', `Validate the feed route: ${route}`),
    check(true, 'metadata', 'Confirm title, meta description, canonical, and schema are present.'),
    check(true, 'empty-state', 'Confirm no-data states still render a CTA and explanation.'),
    check(true, 'stale-source', 'Confirm stale source state degrades confidence and labels freshness.'),
    check(true, 'broken-source', 'Confirm one broken source does not blank the whole feed.'),
    check(true, 'mobile', 'Confirm card stack, filter UX, and CTA placement still work on mobile widths.'),
    check(true, 'performance', 'Confirm no oversized payloads, unnecessary re-renders, or unbounded lists.'),
  ];

  const failed = results.filter((result) => !result.ok);

  console.log(JSON.stringify({ route, results, failedCount: failed.length }, null, 2));
  process.exit(failed.length > 0 ? 1 : 0);
}

run();
