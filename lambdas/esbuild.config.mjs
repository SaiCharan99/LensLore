import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname);
const DIST = resolve(ROOT, 'dist');

const HANDLERS = [
  { name: 'story-generator', entry: 'src/story-generator/handler.ts' },
  { name: 'go-deeper', entry: 'src/go-deeper/handler.ts' },
];

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

for (const { name, entry } of HANDLERS) {
  const outdir = resolve(DIST, name);
  await mkdir(outdir, { recursive: true });

  await build({
    entryPoints: [resolve(ROOT, entry)],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    outfile: resolve(outdir, 'index.mjs'),
    minify: true,
    sourcemap: 'linked',
    // AWS Lambda Node.js 20 runtime ships the AWS SDK v3; everything else is bundled.
    external: ['@aws-sdk/*'],
    banner: {
      // ESM in Lambda needs createRequire shim for any CJS deps that sneak in.
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
    logLevel: 'info',
  });
}

console.log('\nBuilt handlers:', HANDLERS.map((h) => h.name).join(', '));
