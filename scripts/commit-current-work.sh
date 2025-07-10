#!/bin/bash

# Commit Current Work and Setup Workflow
echo "💾 Committing current work and setting up development workflow..."

cd "$(dirname "$0")/.."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_status "Adding all current changes..."
git add .

print_status "Committing news feed implementation..."
git commit -m "Implement comprehensive news feed system with AI insights

- Add complete news infrastructure (backend + frontend)
- Create DynamoDB schema for news storage with TTL
- Build 4 Lambda functions for news management
- Implement mock AI analysis system (ready for Bedrock)
- Add news widgets to Stocks and ETFs pages  
- Create NewsService for API communication
- Deploy infrastructure to AWS successfully
- Add TypeScript interfaces for all news data
- Include demo mode for testing without API costs

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

print_success "Current work committed!"

print_status "Setting up development branches..."

# Create and push develop branch
git checkout -b develop 2>/dev/null || git checkout develop
git push -u origin develop 2>/dev/null

# Return to main
git checkout main

print_success "Development workflow setup complete!"

echo
echo "🎉 Your development environment is ready!"
echo
echo "📋 **Next Steps:**
echo "  1. Run: ./scripts/setup-environments.sh (to create staging environment)"
echo "  2. Add GitHub secrets for CI/CD automation" 
echo "  3. Start developing with proper workflow"
echo
echo "🔧 **Daily Development:**"
echo "  git checkout develop"
echo "  git checkout -b feature/my-new-feature"
echo "  # Work with Claude, make changes..."
echo "  git add . && git commit -m 'Description'"
echo "  git push origin feature/my-new-feature"
echo "  git checkout develop && git merge feature/my-new-feature"
echo "  git push origin develop  # Auto-deploys to staging"
echo
echo "🚀 **Deploy to Production:**"
echo "  git checkout main && git merge develop && git push origin main"
echo
echo "📖 **Read the full guide:** scripts/dev-workflow.md"