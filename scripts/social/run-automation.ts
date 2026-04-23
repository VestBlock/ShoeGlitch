#!/usr/bin/env tsx

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { publishApprovedSocialQueue, runDailySocialDraftScan } from '@/features/social/service';

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

async function main() {
  loadDotEnv(resolve(process.cwd(), '.env.local'));

  const draftLimit = Number.parseInt(process.env.SOCIAL_DRAFT_SCAN_LIMIT ?? '8', 10);
  const publishLimit = Number.parseInt(process.env.SOCIAL_PUBLISH_LIMIT ?? '5', 10);

  const scan = await runDailySocialDraftScan(Number.isFinite(draftLimit) ? draftLimit : 8);
  console.log(
    JSON.stringify(
      {
        stage: 'scan',
        created: scan.created,
        skippedDuplicates: scan.skippedDuplicates,
        failed: scan.failed,
        messages: scan.messages ?? [],
      },
      null,
      2,
    ),
  );

  const publish = await publishApprovedSocialQueue(Number.isFinite(publishLimit) ? publishLimit : 5);
  console.log(JSON.stringify({ stage: 'publish', ...publish }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
