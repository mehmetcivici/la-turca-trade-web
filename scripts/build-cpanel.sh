#!/usr/bin/env bash
# Hostinger / cPanel için gerçek alan adına (src/content/site.ts → url) yönelik statik paket üretir.
# Çıktı: dist/la-turca-trade-site.zip → public_html içine açılır.
# Not: dev sunucusuyla çakışmasın diye ayrı bir derleme klasörü (.next-prod) kullanılır.
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=.next-prod
rm -rf "$OUT"
unset PAGES_BASE_PATH PREVIEW
NEXT_DIST_DIR="$OUT" npm run build
cp cpanel/.htaccess "$OUT/.htaccess"
rm -rf "$OUT/cache" "$OUT/types" 2>/dev/null || true

mkdir -p dist
rm -f dist/la-turca-trade-site.zip
(cd "$OUT" && zip -qr ../dist/la-turca-trade-site.zip . -x "*.DS_Store" -x "cache/*")
echo "Hazır: dist/la-turca-trade-site.zip ($(du -h dist/la-turca-trade-site.zip | cut -f1))"
