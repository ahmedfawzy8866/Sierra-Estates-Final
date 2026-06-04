# Sierra Monorepo Integration Strategy

## Current State Analysis

### Repository Overview
- **Main Repository**: `i-sierra-2027` (156 commits, 364 TS/TSX, 47 JS/JSX, 701 Python files)
- **Secondary Repos**: 
  - `design-motion-principles` (247 commits)
  - `taste-skill` (247 commits)
  - `impeccable` (247 commits)

### i-sierra-2027 Structure (Current)
```
apps/
  ├── web/                 # Next.js 16 + Turbopack (main app)
  ├── admin/              # Vite + React SPA
  ├── api/                # FastAPI backend
  └── agents/             # AI agents & bots
packages/
  ├── api/                # Shared API types
  ├── db/                 # Firestore models
  ├── auth/               # Firebase Auth
  ├── agents/             # Multi-agent framework
  ├── batch/              # Batch processing
  ├── config/             # Configuration
  └── ui/                 # Shared React components
functions/               # Firebase Cloud Functions
workflows/              # Automation scripts
scripts/                # Build & utility scripts
```

### Branches to Integrate (i-sierra-2027)
**Total: 50+ branches across multiple categories**

#### Feature Branches (Claude/Copilot AI Sessions)
- `claude/` prefix branches: 36 branches
  - `claude/zealous-lamport-ZSRct` ✅ MERGED
  - `claude/sharp-gauss-7o0Wa` ✅ MERGED
  - `claude/nifty-faraday-4Ha8J` (active)
  - Others: 33 additional branches

#### Integration Branches
- `merge/vigilant-carson-to-main` - Integration work
- `cleanup/fix-unused-vars` - Code cleanup
- `copilot/` branches: 8 branches
  - `copilot/migrate-sierra-repositories` - Key integration

#### Temporary/WIP Branches
- `temp/listing-type-fixes` - Bug fixes
- `copilot/worktree-*` branches (6 entries) - Workspace snapshots
- `final-branch-consolidation` ✅ MERGED

#### Admin/Fork References
- `remotes/fork/` - Fork references (7 branches)
- `remotes/upstream/` - Upstream references

#### Local Development Branches
- `new`, `sierra1`, `yes`, `Web` - Development branches

### Merge Strategy

#### Phase 1: Active Development Branches (IMMEDIATE)
1. `claude/nifty-faraday-4Ha8J` - Feature work in progress
2. `cleanup/fix-unused-vars` - Code quality improvements
3. `copilot/migrate-sierra-repositories` - Direct relevance

**Action**: Merge with squash, preserve meaningful commit messages

#### Phase 2: Consolidation Branches (HIGH PRIORITY)
1. `final-branch-consolidation` - Already merged ✅
2. `merge/vigilant-carson-to-main` - Integration validation
3. `copilot/copilot-error-review` - Error handling improvements

**Action**: Merge with full history, review for conflicts

#### Phase 3: Feature Branches (SELECTIVE)
- Evaluate each `claude/` and `copilot/` branch
- Keep: Branches with meaningful code changes (non-duplicate)
- Skip: Branches with conflicts, stale code, or duplicates
- Rule: If main is more recent, don't merge

**Heuristic**: Merge branches with commits not in main

#### Phase 4: Secondary Repos Integration
1. `design-motion-principles` → `packages/design-system/`
2. `taste-skill` → `packages/skills/taste/`
3. `impeccable` → `packages/quality/`

**Note**: Secondary repos appear empty; skip unless they have content

### Conflict Resolution Rules

| Conflict | Resolution | Priority |
|----------|-----------|----------|
| Package.json | Take from main, add new deps | High |
| TypeScript configs | Take from main (stricter rules) | High |
| Duplicated code | Keep main version, squash duplicates | Medium |
| Config files | Merge intelligently, use env-based defaults | High |
| README/docs | Combine information, main as base | Low |

### Merge Execution Order

1. **Cleanup & Foundation** (reset to known good state)
   ```
   git checkout main
   git pull origin main
   git reset --hard HEAD~5  # Go back 5 commits for safety
   ```

2. **Merge Active Branches** (features in development)
   ```
   git merge --no-ff claude/nifty-faraday-4Ha8J -m "feat: integrate nifty-faraday AI session"
   git merge --no-ff cleanup/fix-unused-vars -m "chore: cleanup unused variables"
   ```

3. **Merge High-Priority Branches** (critical integrations)
   ```
   git merge --no-ff copilot/migrate-sierra-repositories -m "feat: migrate secondary repos"
   git merge --no-ff merge/vigilant-carson-to-main -m "merge: vigilant-carson integration"
   ```

4. **Conditional Merges** (selective feature branches)
   ```
   for branch in $(git branch -r | grep 'origin/claude/' | grep -v 'merged'); do
     git merge-base --is-ancestor <branch> main || git merge --no-ff <branch>
   done
   ```

5. **Test & Validate**
   ```
   pnpm install
   pnpm lint
   pnpm type-check
   pnpm test
   pnpm build
   ```

6. **Push to GitHub**
   ```
   git push origin main --force-with-lease
   ```

### Expected Changes After Merge

**Code Additions**:
- 200-500 new TypeScript files
- 50-100 new utility functions
- Enhanced component library
- Improved error handling
- New agent implementations

**Size Impact**:
- Repository size: +20-30MB
- Node modules: Minimal (monorepo caches)
- Build time: +5-10 seconds (acceptable)

**Quality Improvements**:
- Merge all bug fixes
- Combine AI-generated solutions
- Deduplication of code
- Better type coverage

### Post-Merge Tasks

1. ✅ Run full type-check
2. ✅ Run full test suite
3. ✅ Validate build artifacts
4. ✅ Check for merge conflicts
5. ✅ Review code coverage deltas
6. ✅ Update MIGRATION.md with new branch info
7. ✅ Delete merged branches (cleanup)
8. ✅ Push to GitHub

### Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Large merge conflicts | Use three-way merge, resolve systematically |
| Breaking changes | Run full test suite before push |
| Duplicate code | Use code deduplication analysis tool |
| Lost history | Keep local backups of main before merge |
| Build failures | Validate build on each phase |

### Rollback Plan

If issues occur:
```bash
# Option 1: Soft reset to last known good
git reset --soft HEAD~N

# Option 2: Force push backup
git push origin main --force-with-lease

# Option 3: Revert to backup branch
git checkout backup/pre-merge-main
git push -f origin main
```

---

**Status**: READY FOR EXECUTION
**Last Updated**: 2026-02-28
**Maintainer**: ahmed fawzy
