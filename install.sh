#!/bin/bash
set -e

APP_NAME="Countdown Timer"
BUNDLE_PATH="src-tauri/target/release/bundle/macos/${APP_NAME}.app"
INSTALL_PATH="/Applications/${APP_NAME}.app"

echo "Installing ${APP_NAME}..."

# Always rebuild to ensure latest changes are included
echo "Building the app..."
npm run tauri build

# Remove existing installation if present
if [ -d "$INSTALL_PATH" ]; then
    echo "Removing existing installation..."
    rm -rf "$INSTALL_PATH"
fi

# Copy to Applications
echo "Copying to /Applications..."
cp -R "$BUNDLE_PATH" "$INSTALL_PATH"

echo "Done! ${APP_NAME} has been installed to /Applications"
echo "You can now launch it from your Applications folder or Spotlight."
