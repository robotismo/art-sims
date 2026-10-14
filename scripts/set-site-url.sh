#!/usr/bin/env bash
# Move the site to a new origin in one step.
#
#   scripts/set-site-url.sh OLD NEW
#   scripts/set-site-url.sh https://paredes.dev https://example.com
#
# The pages are static HTML with no build step, so the origin is written into each file
# (canonical, og:*, twitter:* URLs and the gallery's "← paredes.dev" link). This script:
#   1. rewrites every "OLD/" URL to "NEW/" in all *.html files and README.md
#      (.git/, vendor/ and node_modules/ are skipped);
#   2. rewrites the gallery link text "&larr; OLD-HOST" to "&larr; NEW-HOST";
#   3. updates the SITE_URL constant in scripts/site-url.mjs, then runs
#      `node scripts/site-url.mjs --check` (when node is installed) to prove nothing was missed.
# The /art-sims/ path is not changed. Works with BSD sed (macOS) and GNU sed (Linux).
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "usage: $0 OLD_ORIGIN NEW_ORIGIN   (e.g. $0 https://paredes.dev https://example.com)" >&2
  exit 2
fi
OLD=${1%/}
NEW=${2%/}
for o in "$OLD" "$NEW"; do
  if ! printf '%s' "$o" | grep -Eq '^https?://[A-Za-z0-9.-]+(:[0-9]+)?$'; then
    echo "error: '$o' is not an origin like https://example.com (no path)" >&2
    exit 2
  fi
done
[ "$OLD" = "$NEW" ] && { echo "OLD and NEW are the same; nothing to do."; exit 0; }

OLD_HOST=${OLD#*://}
NEW_HOST=${NEW#*://}
cd "$(dirname "$0")/.."
export LC_ALL=C   # byte-wise matching: BSD sed otherwise stops on UTF-8 it cannot decode

re_escape()  { printf '%s' "$1" | sed -e 's/[]\/$*.^[]/\\&/g'; }   # literal text in a sed regex
rep_escape() { printf '%s' "$1" | sed -e 's/[\/&]/\\&/g'; }        # literal text in a sed replacement
O=$(re_escape "$OLD");      N=$(rep_escape "$NEW")
OH=$(re_escape "$OLD_HOST"); NH=$(rep_escape "$NEW_HOST")

changed=0
while IFS= read -r f; do
  if grep -Fq -e "$OLD/" -e "&larr; $OLD_HOST<" "$f"; then
    # -i.bak + rm is the in-place form that both BSD and GNU sed accept
    sed -i.bak -e "s/$O\//$N\//g" -e "s/&larr; $OH</\&larr; $NH</g" "$f" && rm -f "$f.bak"
    echo "updated  $f"
    changed=$((changed + 1))
  fi
done < <(find . \( -path ./.git -o -path ./vendor -o -path ./node_modules \) -prune -o \
              -type f \( -name '*.html' -o -name 'README.md' \) -print | sort)

MJS=scripts/site-url.mjs
if [ -f "$MJS" ]; then
  sed -i.bak -e "s/^export const SITE_URL = '$O';/export const SITE_URL = '$N';/" "$MJS" && rm -f "$MJS.bak"
  if ! grep -Fq "export const SITE_URL = '$NEW';" "$MJS"; then
    echo "warning: SITE_URL in $MJS was not '$OLD'; edit it by hand." >&2
  fi
fi
echo "$changed file(s) rewritten: $OLD -> $NEW"

if command -v node >/dev/null 2>&1 && [ -f "$MJS" ]; then
  node "$MJS" --check
fi
