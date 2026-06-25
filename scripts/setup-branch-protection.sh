#!/usr/bin/env bash
# ============================================================
# Sierra Estates — GitHub Branch Protection Setup
# Configures branch protection on 'main' via GitHub CLI.
#
# Prerequisites:
#   - GitHub CLI installed: https://cli.github.com/
#   - Authenticated: gh auth login
#   - Repo admin access
#
# Usage: bash scripts/setup-branch-protection.sh
# ============================================================

set -euo pipefail

REPO="ahmedfawzy8866/Sierra-Estates-Final"
BRANCH="main"

echo ""
echo "=========================================="
echo "  SIERRA ESTATES — BRANCH PROTECTION"
echo "=========================================="
echo ""
echo "Repo: $REPO"
echo "Branch: $BRANCH"
echo ""

# Check if gh is installed
if ! command -v gh &>/dev/null; then
  echo "❌ GitHub CLI not installed. Install: https://cli.github.com/"
  exit 1
fi

# Check if authenticated
if ! gh auth status &>/dev/null; then
  echo "❌ Not authenticated. Run: gh auth login"
  exit 1
fi

echo "Setting up branch protection rules..."
echo ""

# Require PRs before merging
echo "  → Requiring pull requests before merging..."
gh api \
  --method PUT \
  "repos/$REPO/branches/$BRANCH/protection" \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["CI — Sierra Estates Final"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF

echo ""
echo "✅ Branch protection configured!"
echo ""
echo "Rules applied:"
echo "  ✅ PR required before merging to main"
echo "  ✅ 1 approval required on PRs"
echo "  ✅ Stale reviews dismissed on push"
echo "  ✅ CI status check required"
echo "  ✅ Force pushes blocked"
echo "  ✅ Branch deletion blocked"
echo ""
echo "To modify, visit:"
echo "  https://github.com/$REPO/settings/branches"
