import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import {
  buildReleaseAutomationManifest,
  type ReleaseAutomationManifest,
} from '../../src/features/releases/automation';

function loadDotEnv(path: string) {
  if (!existsSync(path)) return;
  const source = readFileSync(path, 'utf8');
  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function parseManifest(source: string) {
  try {
    return JSON.parse(source) as ReleaseAutomationManifest;
  } catch {
    return null;
  }
}

function loadGitManifest(outputArg: string) {
  try {
    const source = execFileSync('git', ['show', `HEAD:${outputArg}`], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return parseManifest(source);
  } catch {
    return null;
  }
}

function choosePreviousManifest(outputPath: string, outputArg: string) {
  const diskManifest = existsSync(outputPath) ? parseManifest(readFileSync(outputPath, 'utf8')) : null;
  const gitManifest = loadGitManifest(outputArg);
  const candidates = [diskManifest, gitManifest].filter((manifest): manifest is ReleaseAutomationManifest => Boolean(manifest));

  if (candidates.length === 0) return null;

  return candidates.sort((left, right) => {
    const entryDelta = (right.entries?.length ?? 0) - (left.entries?.length ?? 0);
    if (entryDelta !== 0) return entryDelta;
    return (right.generatedAt ?? '').localeCompare(left.generatedAt ?? '');
  })[0];
}

async function main() {
  loadDotEnv(resolve(process.cwd(), '.env.local'));
  const outputArg = process.argv[2] ?? 'public/seo/release-content-manifest.json';
  const outputPath = resolve(process.cwd(), outputArg);
  const previousManifest = choosePreviousManifest(outputPath, outputArg);
  const manifest = await buildReleaseAutomationManifest({ previousManifest });
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${manifest.counts.total} release content entries to ${outputPath}`);
  console.log(
    `New release slugs: ${manifest.changes.release.added.length > 0 ? manifest.changes.release.added.join(', ') : 'none'}`,
  );
  console.log(
    `New worth-restoring slugs: ${
      manifest.changes.worthRestoring.added.length > 0 ? manifest.changes.worthRestoring.added.join(', ') : 'none'
    }`,
  );
  console.log(
    `Provider warnings: ${manifest.providerSummary.warnings.length > 0 ? manifest.providerSummary.warnings.join(' | ') : 'none'}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
