#!/bin/bash
set -e

cd "$(dirname "$0")"
if [ -d "dist" ]; then
  rm -rf dist
fi
mkdir -p dist

echo "Building Thunderbird add-on..."
cd thunderbird && zip -r ../dist/thunderbird.xpi ./* && cd ..
echo "Building Chrome extension..."
cd chrome && zip -r ../dist/chrome.zip ./* && cd ..

echo "All add-ons / extensions / plugins built successfully."
