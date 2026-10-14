#!/usr/bin/env node
// Regenerates vendor/three/ from an extracted three npm package.
//
// Usage:
//   mkdir /tmp/three-pkg && cd /tmp/three-pkg && npm pack three@0.184.0 --ignore-scripts && tar -xzf three-0.184.0.tgz
//   node scripts/vendor-three.mjs /tmp/three-pkg/package
//
// What it does (no network, no dependencies, never runs code from the package):
//   1. Reads every NN-name/index.html and collects the 'three/addons/...' modules the sims import.
//   2. Starts from build/three.module.js plus those addon files and follows every relative
//      import / export-from / dynamic import() to compute the transitive closure.
//   3. Deletes vendor/three/ and copies exactly that closure (relative paths kept) plus LICENSE.
// Bare specifiers other than 'three' inside the closure abort the run, because the importmap
// only maps 'three' and 'three/addons/'.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED_VERSION = '0.184.0';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = path.resolve(process.argv[2] ?? '');
if (!process.argv[2] || !fs.existsSync(path.join(pkg, 'package.json'))) {
  console.error('usage: node scripts/vendor-three.mjs <path-to-extracted-three-package>');
  process.exit(1);
}
const version = JSON.parse(fs.readFileSync(path.join(pkg, 'package.json'), 'utf8')).version;
if (version !== EXPECTED_VERSION) {
  console.error(`expected three@${EXPECTED_VERSION}, got ${version}`);
  process.exit(1);
}

// 1. Entry points from the sims.
const entries = new Set(['build/three.module.js']);
for (const dir of fs.readdirSync(repo).filter((d) => /^\d\d-/.test(d)).sort()) {
  const html = path.join(repo, dir, 'index.html');
  if (!fs.existsSync(html)) continue;
  const src = fs.readFileSync(html, 'utf8');
  for (const m of src.matchAll(/['"]three\/addons\/([^'"]+)['"]/g)) entries.add('examples/jsm/' + m[1]);
}

// 2. Transitive closure over relative specifiers.
const SPEC_RE = [
  /\b(?:import|export)\s[^;'"]*?\bfrom\s*['"]([^'"]+)['"]/g, // import x from '..' / export {..} from '..' (multi-line ok)
  /\bimport\s*['"]([^'"]+)['"]/g,                            // side-effect import '..'
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,                  // dynamic import('..')
];
const closure = new Set();
const bare = new Set();
const queue = [...entries];
while (queue.length) {
  const rel = queue.shift();
  if (closure.has(rel)) continue;
  const abs = path.join(pkg, rel);
  if (!fs.existsSync(abs)) throw new Error(`missing in package: ${rel}`);
  closure.add(rel);
  // Drop comments first: three's JSDoc carries usage examples such as
  // "import { X } from 'three/addons/...'" that are not real imports.
  const src = fs.readFileSync(abs, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  for (const re of SPEC_RE) {
    for (const m of src.matchAll(re)) {
      const spec = m[1];
      if (spec.startsWith('./') || spec.startsWith('../')) {
        queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec)));
      } else if (spec === 'three') {
        queue.push('build/three.module.js');
      } else {
        bare.add(`${spec} (in ${rel})`);
      }
    }
  }
}
if (bare.size) {
  console.error('unmapped bare specifiers in closure:\n  ' + [...bare].join('\n  '));
  process.exit(1);
}

// 3. Copy.
const out = path.join(repo, 'vendor', 'three');
fs.rmSync(out, { recursive: true, force: true });
let total = 0;
for (const rel of [...closure, 'LICENSE'].sort()) {
  const dst = path.join(out, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(path.join(pkg, rel), dst);
  const size = fs.statSync(dst).size;
  total += size;
  console.log(`${String(size).padStart(9)}  ${rel}`);
}
console.log(`${String(total).padStart(9)}  total (${closure.size} modules + LICENSE), three@${version}`);
