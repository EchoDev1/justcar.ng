#!/bin/bash

# ========================================
# Deploy to Vercel Production
# This script deploys the latest code to all production domains
# ========================================

echo "🚀 Deploying to Vercel Production..."
echo ""

# Change to project directory
cd "$(dirname "$0")"

# Check git status
echo "📝 Checking git status..."
git status --short

echo ""
echo "📦 Latest commits:"
git log --oneline -3

echo ""
echo "⚡ Deploying to production..."
echo ""

# Deploy to production (will prompt for login if needed)
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your production domains have been updated:"
echo "   • https://justcars-ng.vercel.app"
echo "   • https://justcars-ng-ebuka-ekes-projects.vercel.app"
echo ""
echo "🧪 Test car creation:"
echo "   1. Visit: https://justcars-ng.vercel.app/admin/cars/new"
echo "   2. Create a car with 5 images"
echo "   3. Should save in 3-5 seconds!"
echo ""
