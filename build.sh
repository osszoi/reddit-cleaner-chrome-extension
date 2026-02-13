#!/bin/bash

ZIP_NAME="reddit-cleaner-extension.zip"

echo "Building Chrome Extension package..."

if [ -f "$ZIP_NAME" ]; then
    echo "Removing old $ZIP_NAME"
    rm "$ZIP_NAME"
fi

zip -r "$ZIP_NAME" \
    manifest.json \
    content.js \
    icons/ \
    -x "*.git*" "*.DS_Store" "*~/*" "screenshots/*" "*.md" "*.sh" "icon.png" "promo.png" "promo_tile.png"

echo "✓ Package created: $ZIP_NAME"
echo "✓ Ready for Chrome Web Store submission"
