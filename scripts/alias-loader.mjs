import path from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('@/')) {
    const target = pathToFileURL(path.join(root, 'src', `${specifier.slice(2)}.ts`)).href;
    return defaultResolve(target, context, defaultResolve);
  }

  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !path.extname(specifier)) {
    const parentPath = context.parentURL ? new URL(context.parentURL) : pathToFileURL(path.join(root, 'index.js'));
    const candidatePath = path.resolve(path.dirname(parentPath.pathname), `${specifier}.ts`);
    if (existsSync(candidatePath)) {
      return defaultResolve(pathToFileURL(candidatePath).href, context, defaultResolve);
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}
