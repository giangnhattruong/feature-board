---
name: deploy-check
description: Run build and lint checks before deploying to Vercel
disable-model-invocation: true
---

# Pre-Deploy Check

Run all checks to ensure the app is ready for deployment.

## Steps

1. **Run ESLint**:
   ```bash
   cd /Users/truonggiang/Documents/Business/startup/DemoMVP && npx eslint .
   ```
   Fix any errors found before proceeding.

2. **Run TypeScript type check**:
   ```bash
   cd /Users/truonggiang/Documents/Business/startup/DemoMVP && npx tsc --noEmit
   ```
   Fix any type errors before proceeding.

3. **Run Next.js build**:
   ```bash
   cd /Users/truonggiang/Documents/Business/startup/DemoMVP && npm run build
   ```
   Fix any build errors before proceeding.

4. **Report results**: Summarize what passed/failed and whether it's safe to deploy.
