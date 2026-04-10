/* eslint-disable no-undef */
import { build } from 'esbuild';

build({
  entryPoints: ['src/mldsa.ts'], // change if api.ts lives elsewhere
  bundle: true,
  format: 'esm',
  outfile: 'dist/mldsa.js',
  platform: 'neutral',
  target: ['esnext'],
  external: ['module', 'fs', 'path'],
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'info',
}).catch(() => process.exit(1));
