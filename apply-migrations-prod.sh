#!/bin/bash

# Production Database Migration Script
# CAUTION: This applies migrations to PRODUCTION database

set -e

echo "⚠️  WARNING: This will apply migrations to PRODUCTION database!"
echo ""
echo "Production Project: gttkvtlkjdusbortnbiz (aim-prod)"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted by user"
    exit 0
fi

# Check if token is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: SUPABASE_ACCESS_TOKEN not set"
    echo ""
    echo "Please set your access token first:"
    echo "  1. Go to https://supabase.com/dashboard/account/tokens"
    echo "  2. Generate a new token"
    echo "  3. Run: export SUPABASE_ACCESS_TOKEN=<your-token>"
    echo ""
    exit 1
fi

echo ""
echo "🚀 Applying database migrations to PRODUCTION..."
echo ""

# Link to production project
echo "🔗 Linking to production Supabase project..."
if output=$(supabase link --project-ref gttkvtlkjdusbortnbiz 2>&1); then
    echo "✓ Linked successfully"
elif echo "$output" | grep -q "already linked"; then
    echo "✓ Already linked"
else
    echo "❌ Failed to link to project:"
    echo "$output"
    exit 1
fi

# Show pending migrations
echo ""
echo "📋 Checking migration status..."
supabase db diff --schema public || true

# Apply migrations
echo ""
echo "⚡ Applying migrations to PRODUCTION..."
supabase db push

# Verify
echo ""
echo "✅ Migrations applied successfully to PRODUCTION!"
echo ""
echo "🔍 Verifying database schema..."
supabase db inspect

echo ""
echo "✨ Done! Production database updated."
echo ""
