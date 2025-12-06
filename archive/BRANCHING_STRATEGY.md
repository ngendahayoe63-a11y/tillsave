# TillSave Git Branching Strategy

## Branch Structure

### 🔴 **master** (Production/Testing Release)
- **Status**: STABLE & TESTED
- **Purpose**: Official release branch for testing users
- **Who uses it**: Test users, stakeholders
- **Deployment**: Currently deployed to Vercel
- **Rules**: 
  - Only merge from `staging` after full testing
  - Tag releases (v1.0.0, v1.0.1, etc.)
  - No direct commits to master

### 🟡 **staging** (Pre-Production Testing)
- **Status**: QUALITY ASSURED
- **Purpose**: Test environment before releasing to users
- **Who uses it**: QA team, internal testing
- **Testing**: Full cycle testing, edge cases, regression tests
- **Rules**:
  - Merge from `develop` after feature completion
  - Run full test suite before merging
  - Keep updated with latest features ready to ship

### 🟢 **develop** (Development)
- **Status**: ACTIVE DEVELOPMENT
- **Purpose**: Integration branch for new features
- **Who uses it**: Developers
- **Workflow**: Feature branches → develop
- **Rules**:
  - Never directly deploy to production
  - All new features start here
  - Regular integration testing

## Workflow

### Adding a New Feature

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/feature-name

# 2. Make changes and commit
git add .
git commit -m "Feature: Description"

# 3. Push and create Pull Request
git push origin feature/feature-name

# 4. After review & tests pass, merge to develop
git checkout develop
git merge feature/feature-name
git push origin develop
```

### Releasing to Testing Users

```bash
# 1. Merge develop → staging
git checkout staging
git pull origin staging
git merge develop
git push origin staging

# 2. Run full test suite on staging
# 3. If all tests pass, merge to master
git checkout master
git merge staging
git tag -a v1.0.1 -m "Release version 1.0.1"
git push origin master
git push origin --tags
```

## Current Status (December 5, 2025)

| Branch | Commit | Status | Use Case |
|--------|--------|--------|----------|
| **master** | bdee2b3 | ✅ STABLE | Testing Release |
| **staging** | Same as master | ✅ READY | Pre-release Testing |
| **develop** | Same as master | ✅ READY | Feature Development |

## Testing Cycle

```
Feature Development (develop)
         ↓
Code Review & Tests
         ↓
Merge to staging → Full Testing
         ↓
User Acceptance Tests
         ↓
Merge to master → Release
         ↓
Tag Release & Deploy
```

## Important Notes

⚠️ **For Testing Users:**
- Test against `master` branch version
- Report bugs with version number
- All test users get same stable code

🔧 **For Developers:**
- All new features go to `develop`
- Never push directly to `master` or `staging`
- Create feature branches for each feature
- Test locally before pushing

🚀 **Deployment:**
- `master` → Vercel production/testing
- `staging` → Internal testing environment
- `develop` → Local development only

## Branch Protection Rules (Recommended)

Enable in GitHub Settings:

**master:**
- ✅ Require pull request reviews (2 approvals)
- ✅ Require status checks to pass
- ✅ Include administrators
- ✅ Require branches to be up to date

**staging:**
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Include administrators

**develop:**
- ✅ Require status checks to pass (optional)

---

## Quick Reference

```bash
# Check current branch
git branch

# Switch branch
git checkout <branch-name>

# Create and switch to new branch
git checkout -b <branch-name>

# List all branches (local + remote)
git branch -a

# Delete local branch
git branch -d <branch-name>

# Delete remote branch
git push origin --delete <branch-name>

# View branch history
git log --oneline --graph --all
```
