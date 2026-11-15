#!/usr/bin/env bash
# cPanel için statik çıktı üretir ve public_html'e açılacak zip'i hazırlar.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf out
npm run build
cp cpanel/.htaccess out/.htaccess

mkdir -p dist
rm -f dist/la-turca-trade-cpanel.zip
(cd out && zip -qr ../dist/la-turca-trade-cpanel.zip . -x "*.DS_Store")
echo "Hazır: dist/la-turca-trade-cpanel.zip ($(du -h dist/la-turca-trade-cpanel.zip | cut -f1))"
