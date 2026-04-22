import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildSeoAutomationManifest } from '../../src/features/seo/automation';

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

async function main() {
  loadDotEnv(resolve(process.cwd(), '.env.local'));
  const outputArg = process.argv[2];
  const manifest = await buildSeoAutomationManifest();

  if (outputArg) {
    const outputPath = resolve(process.cwd(), outputArg);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${manifest.length} SEO entries to ${outputPath}`);
    return;
  }

  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
