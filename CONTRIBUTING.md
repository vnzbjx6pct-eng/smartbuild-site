# Contributing to SmartBuild

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
