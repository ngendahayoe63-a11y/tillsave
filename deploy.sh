#!/bin/bash

# TillSave Auto-Deploy Script
# Automatically commits and pushes changes to GitHub after fixes

set -e

echo "🚀 TillSave Auto-Deploy Started"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initialize with 'git init' first."
    exit 1
fi

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Stage all changes
echo "📝 Staging changes..."
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "✅ No changes to commit"
    exit 0
fi

# Create descriptive commit message
COMMIT_MSG="[Auto-Deploy] TillSave fixes - $TIMESTAMP"

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

# Push to remote
echo "🌐 Pushing to GitHub ($BRANCH)..."
git push origin "$BRANCH" || {
    echo "⚠️ Push failed. Check your git configuration."
    exit 1
}

echo "✅ Successfully deployed! Commit: $(git rev-parse --short HEAD)"
echo "📊 View on GitHub: https://github.com/your-username/TillSave/commit/$(git rev-parse HEAD)"
