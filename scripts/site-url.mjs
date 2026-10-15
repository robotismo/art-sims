#!/usr/bin/env node
// Single source of truth for the public site URL used in canonical / og:* / twitter:* tags.
//
// To move the site: edit the ONE line below, then run `node scripts/site-url.mjs`.
// Check only (exit 1 on any mismatch): `node scripts/site-url.mjs --check`.
//
// (scripts/set-site-url.sh OLD NEW does the same in one step and also edits the line below.)
//
// The pages are static HTML with no build step, so absolute URLs are written into each file.
// This script rewrites, in *.html, *.xml, *.txt and README.md:
//   - every absolute "<origin>/art-sims/..." URL, so that its origin equals SITE_URL;
//   - the gallery's link back to the main site, <a class="back" href="<origin>/">&larr; <host></a>,
//     so that it points at SITE_URL and shows its host.
// --check fails on any of these that is not on SITE_URL, and when no such back link is found at all.
// Other absolute links (e.g. citations) are untouched.
export const SITE_URL = 'https://paredes.dev';
export const BASE_PATH = '/art-sims/';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const RE = new RegExp(String.raw`https?://[^/\s"'<>]+` + BASE_PATH.replace(/\//g, '\\/'), 'g');
const WANT = SITE_URL.replace(/\/$/, '') + BASE_PATH;
const BACK_RE = /<a class="back" href="https?:\/\/[^/"\s]+\/">&larr; [^<]*<\/a>/g;
const WANT_BACK = `<a class="back" href="${SITE_URL.replace(/\/$/, '')}/">&larr; ${new URL(SITE_URL).host}</a>`;

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'vendor'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|xml|txt)$/.test(e.name) || e.name === 'README.md') files.push(p);
  }
})(repo);

let bad = 0, changed = 0, seen = 0, backSeen = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const out = src
    .replace(RE, (m) => { seen++; if (m !== WANT) bad++; return WANT; })
    .replace(BACK_RE, (m) => { backSeen++; if (m !== WANT_BACK) bad++; return WANT_BACK; });
  if (out !== src) {
    changed++;
    if (!check) fs.writeFileSync(f, out);
    console.log(`${check ? 'mismatch' : 'updated '}  ${path.relative(repo, f)}`);
  }
}
console.log(`${seen} absolute ${BASE_PATH} URLs and ${backSeen} main-site back link(s) in ${files.length} files; ` +
  `${bad} not on ${SITE_URL.replace(/\/$/, '')}${check ? '' : `; ${changed} files rewritten`}`);
if (!backSeen) console.log('warning: no <a class="back" href="<origin>/"> main-site link found (expected one in index.html)');
if (check && (bad || !backSeen)) process.exit(1);
