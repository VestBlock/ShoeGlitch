#!/usr/bin/env tsx

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnv(path: string) {
  if (!existsSync(path)) return;
  const source = readFileSync(path, 'utf8');
  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

function run(label: string, script: string, args: string[] = []) {
  console.log(`\n→ ${label}`);
  execFileSync('npx', ['tsx', script, ...args], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  });
}

async function main() {
  loadDotEnv(resolve(process.cwd(), '.env.local'));
  const baseUrl = process.env.SEO_BASE_URL ?? process.argv[2] ?? 'http://localhost:3000';

  run('Export SEO route manifest', 'scripts/seo/export-route-manifest.ts', ['public/seo/route-manifest.json']);
  run('Export release content manifest', 'scripts/releases/export-content-manifest.ts', ['public/seo/release-content-manifest.json']);
  run('Verify public and SEO routes', 'scripts/seo/verify-site-routes.ts', [baseUrl]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
