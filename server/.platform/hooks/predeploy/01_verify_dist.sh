#!/bin/bash
set -euo pipefail
cd /var/app/staging
if [ ! -f dist/index.js ]; then
  echo "ERROR: dist/index.js is missing. The GitHub Actions workflow must run npm run build before zipping."
  exit 1
fi
echo "OK: dist/index.js present ($(wc -c < dist/index.js) bytes)"
