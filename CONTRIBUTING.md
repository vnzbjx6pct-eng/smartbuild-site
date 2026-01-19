# Contributing

## GitHub Actions & PAT
> [!NOTE]
> If you need to enable the CI workflow, rename `.github/workflows/ci.yml.example` to `.github/workflows/ci.yml`.
> You must have a Personal Access Token (PAT) with `workflow` scope to push changes to workflow files.
> If you don't have this, please do not commit the workflow file.

## Quality GatesSmartBuild

## Zero Build Surprises Policy

We enforce strict TypeScript and Linting rules to prevent build failures.

### 1. Pre-Commit Checks
All commits are checked via Husky and lint-staged.
- `eslint` runs on changed files.
- `tsc --noEmit` runs to catch type errors.

If you see a commit failure, **fix the errors** before bypassing.

### 2. Shorthand Property Safety (The `uxState` Rule)
TS shorthand properties (e.g., `{ uxState }`) can fail the build if the variable is not explicitly in scope, even if it looks valid in some IDE contexts.

**Safe Pattern:**
Always be explicit when defining derived UI models if the variable isn't declared immediately above.

❌ **Bad (Risk of "No value exists in scope"):**
```tsx
const model = {
  uxState // Where does this come from?
}
```

✅ **Good:**
```tsx
const uxState = getUxState();
const model = {
  uxState
}
```

✅ **Best (Inline):**
```tsx
const model = {
  uxState: getUxState()
}
```

### 3. CI Pipeline
GitHub Actions will run `npm run check` (Lint + Typecheck) + `npm run build` on every PR.
Vercel deployments will fail if this check fails.

## Troubleshooting

### Dev Server Locked (".next/dev/lock")
If you see `Unable to acquire lock at .next/dev/lock` or `Port 3000 is in use`:
1. Stop the running server.
2. Run: `lsof -i :3000` (shows PID) -> `kill -9 <PID>`
3. Run: `rm -f .next/dev/lock`
