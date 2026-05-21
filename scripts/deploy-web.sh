#!/bin/bash
#
# Build + deploy web ke Cloudflare Pages.
#
# Cloudflare Pages punya quirk: tidak men-serve file di path yang mengandung
# '@' (mis. /assets/node_modules/@expo/...). Expo export menempatkan icon
# fonts dan beberapa asset di path tersebut, jadi kita harus post-process
# dist/ supaya path-nya datar.
#
# Pakai: bash scripts/deploy-web.sh

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> 1/4  Export web bundle"
npx expo export --platform web

echo "==> 2/4  Pindahkan semua font ke /fonts/ (avoid @ path)"
mkdir -p dist/fonts
find dist -name "*.ttf" -path "*/Fonts/*" -exec cp {} dist/fonts/ \;

echo "==> 3/4  Rewrite font references di JS + HTML"
# Path lama dengan @expo → path baru flat
find dist -type f \( -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.map" \) \
  -exec sed -i '' \
    -e 's|/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/|/fonts/|g' \
    {} +

# Rename folder @expo dan @react-navigation untuk asset lain (kalau ada)
if [ -d "dist/assets/node_modules/@expo" ]; then
  mv dist/assets/node_modules/@expo dist/assets/node_modules/at-expo
fi
if [ -d "dist/assets/node_modules/@react-navigation" ]; then
  mv dist/assets/node_modules/@react-navigation dist/assets/node_modules/at-react-navigation
fi
find dist -type f \( -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.map" \) \
  -exec sed -i '' \
    -e 's|@expo/|at-expo/|g' \
    -e 's|@react-navigation/|at-react-navigation/|g' \
    {} +

echo "==> 4/4  Deploy ke Cloudflare Pages"
COMMIT_MSG="$(git log -1 --pretty=format:%s 2>/dev/null | LC_ALL=C tr -cd '[:print:]' | head -c 80)"
[ -z "$COMMIT_MSG" ] && COMMIT_MSG="Web deploy"
npx wrangler pages deploy dist --project-name=boboko-demo --branch=main --commit-message="$COMMIT_MSG"

echo ""
echo "Done. URL: https://boboko-demo.pages.dev"
