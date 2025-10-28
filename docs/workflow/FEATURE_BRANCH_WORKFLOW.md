# Feature Branch Workflow

This document describes the Git workflow used in the Grievance Portal project.

## Overview

We use **feature branches** for all development work. This keeps the main branch stable and allows for easy code review via Pull Requests.

## Branch Naming Convention

### Required Format

```
feature/description-in-kebab-case
```

**Rules:**
- Always use `feature/` prefix
- Use lowercase kebab-case (hyphens, not underscores)
- Be descriptive but concise
- Keep under 50 characters if possible

### Good Examples ✅

```
feature/add-user-settings
feature/fix-notification-timing
feature/improve-ui-animations
feature/add-rate-limit-status
feature/update-security-docs
```

### Bad Examples ❌

```
my-new-feature        # Missing prefix
Feature/TitleCase     # Wrong case
feature_underscore    # Wrong separator
fix-thing             # Missing prefix
feat/add-feature      # Wrong prefix (use 'feature')
```

## Workflow Steps

### 1. Start New Feature

Create and switch to a new feature branch from main:

```bash
git checkout main
git pull origin main
git checkout -b feature/add-dark-mode-toggle
```

### 2. Make Your Changes

- Work on your feature branch
- Commit frequently with clear messages
- Keep changes focused on the feature name

```bash
git add .
git commit -m "Add dark mode toggle to header"
git push -u origin feature/add-dark-mode-toggle
```

### 3. Create Pull Request

1. Push your branch to GitHub
2. Create a Pull Request targeting `main`
3. Fill out the PR description
4. Wait for review and approval

### 4. After PR Merged

Clean up your local branch:

```bash
git checkout main
git pull origin main
git branch -d feature/add-dark-mode-toggle  # Delete local branch
```

GitHub can automatically delete remote branches after merge (configure in branch protection settings).

## Workflow Diagram

```
main branch (stable)
    │
    ├── Create feature branch
    │   └── feature/add-settings
    │       │
    │       ├── Commit changes
    │       ├── Push to remote
    │       └── Create PR
    │           │
    │           └── Merge to main
    │               └── Delete feature branch
    │
    └── Repeat for next feature
```

## Best Practices

### Before Starting Work

1. ✅ Ensure `main` is up-to-date: `git pull origin main`
2. ✅ Create descriptive branch name
3. ✅ Start with clean working directory
4. ✅ Review CLAUDE.md for coding standards

### During Development

1. ✅ Make atomic commits (one logical change per commit)
2. ✅ Write clear commit messages
3. ✅ Keep PRs focused and reviewable (<500 lines ideally)
4. ✅ Test changes before pushing
5. ✅ Follow existing code patterns

### Before Creating PR

1. ✅ Run `/de-slop` command to clean AI artifacts
2. ✅ Run tests: `npm test`
3. ✅ Build successfully: `npm run build`
4. ✅ Update patchNotes.json if needed
5. ✅ Review your own changes

### Branch Lifecycle

- **Created:** When starting new feature
- **Active:** During development (<1 week ideally)
- **Merged:** After PR approval
- **Deleted:** Immediately after merge

## Integration with Project Workflow

### Before Coding

- Read `CLAUDE.md` for project guidelines
- Check existing code patterns
- Understand the feature requirements

### While Coding

- Follow existing patterns in codebase
- Maintain code style (see CLAUDE.md)
- Keep features modular and testable

### Code Cleanup

- Run `/de-slop` before PR to remove AI artifacts
- Ensure no TODOs left in code
- Remove debug console logs
- Clean up unused imports

### Documentation

- Update docs if you add new features
- Add comments for complex logic
- Update CLAUDE.md if workflow changes

### Versioning

- Update `src/patchNotes.json` on releases
- Follow semantic versioning (see existing versions)
- Document breaking changes

## Troubleshooting

### "Branch Already Exists" Error

```bash
git branch -D feature/branch-name  # Force delete
git checkout -b feature/branch-name  # Create fresh
```

### Accidentally Committed to Main

```bash
git branch feature/fix-accidental-commit
git reset --hard origin/main
git checkout feature/fix-accidental-commit
```

### Keeping Feature Branch Updated

```bash
git checkout feature/my-branch
git merge main  # Bring in latest changes
# Resolve conflicts if any
git push origin feature/my-branch
```

### Find Outdated Branches

```bash
# List branches merged to main
git branch --merged main

# Delete old local branches
git branch --merged main | grep feature | xargs git branch -d
```

## Emergency Procedures

### Critical Production Fix

For urgent fixes, use `hotfix/` prefix:

```bash
git checkout -b hotfix/fix-security-bug main
# Make fix
# Fast-track PR and merge
# Delete branch after merge
```

### Abandon Feature Branch

If feature is cancelled:

```bash
git checkout main
git branch -D feature/cancelled-feature
git push origin --delete feature/cancelled-feature
```

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Development guidelines and standards
- [Environment Setup](./setup/ENVIRONMENT_SETUP.md) - Project setup
- [Security Implementation](../security/SECURITY_IMPLEMENTATION_SUMMARY.md) - Security standards

## FAQ

**Q: Can I work on multiple features at once?**
A: Yes, but keep them in separate branches. Only work on one at a time on your local machine.

**Q: How long should feature branches live?**
A: Typically merge within a week. Longer branches risk merge conflicts.

**Q: What if my branch gets behind main?**
A: Merge main into your branch and resolve conflicts. See "Keeping Feature Branch Updated" above.

**Q: Can I rename a feature branch?**
A: Yes: `git branch -m old-name new-name` (then force push if already on remote).

**Q: Should I squash commits in PR?**
A: Keep commits atomic. Squash only if you have many trivial commits.

## Quick Reference

```bash
# Start new feature
git checkout main && git pull
git checkout -b feature/your-feature-name

# Daily workflow
git add .
git commit -m "Clear commit message"
git push

# Before PR
npm run build
npm test
/cursordev-de-slop  # Run de-slop command
git push

# After PR merged
git checkout main && git pull
git branch -d feature/your-feature-name
```

