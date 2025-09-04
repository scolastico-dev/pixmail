#!/bin/bash
set -e

cd "$(dirname "$0")"
if [ -d "dist" ]; then
  rm -rf dist
fi
mkdir -p dist

echo "Building Thunderbird add-on..."
cd thunderbird && zip -r ../dist/thunderbird.xpi ./* && cd ..
cd chrome-extension && zip -r ../dist/chrome-extension.zip ./* && cd ..

echo "All add-ons built successfully."
