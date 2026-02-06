#!/bin/bash

# Database Migration Script
# Run this after setting SUPABASE_ACCESS_TOKEN environment variable

set -e  # Exit on error

echo "🚀 Applying database migrations to Supabase..."
echo ""

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

# Link to project (if not already linked)
echo "🔗 Linking to Supabase project..."
supabase link --project-ref gttkvtlkjdusbortnbiz || echo "Already linked"

# Show pending migrations
echo ""
echo "📋 Checking migration status..."
supabase db diff --schema public || true

# Apply migrations
echo ""
echo "⚡ Applying migrations..."
supabase db push

# Verify
echo ""
echo "✅ Migrations applied successfully!"
echo ""
echo "🔍 Verifying database schema..."
supabase db inspect

echo ""
echo "✨ Done! Your studies page should now work correctly."
echo ""
