```markdown
# Sierra-Estates-Final Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the key development patterns, coding conventions, and workflows used in the **Sierra-Estates-Final** TypeScript codebase. The repository is a multi-app project (notably `apps/web` and `apps/admin`) for real estate management, featuring API endpoints, React components, CI/CD automation, and robust testing. The guide covers how to add features, update infrastructure, maintain type safety, expand test coverage, and keep documentation up to date, following the team's established conventions and workflows.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for files:  
  Example: `propertyFinder.ts`, `userService.ts`

**Imports**
- Use **relative imports** for internal modules:  
  ```typescript
  import { getUser } from '../lib/services/userService';
  ```

**Exports**
- Use **named exports**:  
  ```typescript
  // Good
  export function getUser() { ... }
  
  // Avoid default exports
  // export default function getUser() { ... }
  ```

**Commit Messages**
- Follow **Conventional Commits**:  
  - Types: `feat`, `fix`, `chore`, `docs`, `refactor`
  - Example:  
    ```
    feat: add property search endpoint with filters
    fix: correct type error in userService
    ```

---

## Workflows

### Add or Update API Endpoint
**Trigger:** When you want to expose new backend functionality or fix an API route  
**Command:** `/new-api-endpoint`

1. Create or modify a route handler in `apps/web/app/api/[...]/route.ts`
2. Update or create related service(s) in `apps/web/lib/services/`
3. Update or create TypeScript types in `apps/web/lib/models/schema.ts` or `apps/web/lib/property-finder/types.ts`
4. Update or add tests in `apps/web/__tests__/`
5. Verify the build and run tests

**Example:**
```typescript
// apps/web/app/api/properties/route.ts
import { getProperties } from '../../../lib/services/propertyService';

export async function GET(req: Request) {
  const properties = await getProperties();
  return new Response(JSON.stringify(properties));
}
```

---

### Feature Development with Component and Page
**Trigger:** When you want to add a new UI feature, page, or major component  
**Command:** `/new-feature`

1. Create or update a page in `apps/web/app/[feature]/page.tsx` or `apps/admin/src/pages/[Feature].tsx`
2. Create or update supporting components in `apps/web/components/[Feature]/*.tsx`
3. Update shared styles or Tailwind config if needed
4. Add or update documentation (e.g., `REFINEMENTS.md`, `DESIGN_SPEC.md`)
5. Test locally and verify in the browser

**Example:**
```tsx
// apps/web/components/PropertyCard/PropertyCard.tsx
export function PropertyCard({ property }) {
  return (
    <div className="card">
      <h2>{property.title}</h2>
      <p>{property.description}</p>
    </div>
  );
}
```

---

### Infrastructure or CI/CD Workflow Update
**Trigger:** When you want to improve or fix CI/CD, deployment, or infrastructure automation  
**Command:** `/update-ci-cd`

1. Add or update GitHub Actions workflow files in `.github/workflows/`
2. Update deployment configs (`vercel.json`, `turbo.json`, etc.)
3. Update environment variable examples or secrets setup docs
4. Update Firebase/firestore/storage rules as needed
5. Test pipeline or deployment and verify changes

**Example:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - run: npm test
```

---

### Type Safety and TypeScript Error Fix
**Trigger:** When you want to fix build errors, improve type safety, or after major merges  
**Command:** `/fix-types`

1. Identify TypeScript errors in build output
2. Update or fix type definitions in relevant files (`*.ts`, `*.tsx`, `types/*.ts`)
3. Update `next-env.d.ts` or `tsconfig` as needed
4. Remove or fix problematic code patterns
5. Verify build passes with zero TypeScript errors

**Example:**
```typescript
// apps/web/lib/models/schema.ts
export interface Property {
  id: string;
  title: string;
  price: number;
  // ...
}
```

---

### Test Infrastructure and Coverage Expansion
**Trigger:** When you want to improve testing reliability or cover new code with tests  
**Command:** `/add-tests`

1. Add or update Jest/test config files (`jest.config.js`, `setup.ts`)
2. Write or update test files in `__tests__/`
3. Add mocks or stubs for external dependencies
4. Run tests and ensure all pass
5. Update documentation if needed

**Example:**
```typescript
// apps/web/__tests__/propertyService.test.ts
import { getProperties } from '../lib/services/propertyService';

test('returns a list of properties', async () => {
  const properties = await getProperties();
  expect(Array.isArray(properties)).toBe(true);
});
```

---

### Documentation and Onboarding Update
**Trigger:** When you want to improve team onboarding, deployment clarity, or document architecture  
**Command:** `/update-docs`

1. Create or update documentation files (`README.md`, `DEPLOYMENT_GUIDE.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, etc.)
2. Document environment variables, setup steps, and workflow guides
3. Add or update diagrams, status dashboards, or checklists
4. Commit and share with the team

**Example:**
```markdown
# DEPLOYMENT_GUIDE.md
## Setup
1. Copy `.env.example` to `.env` and fill in required values.
2. Run `npm install` in each app directory.
3. Deploy using Vercel or your preferred platform.
```

---

## Testing Patterns

- **Framework:** Jest
- **Test files:** Named with `.test.ts` and placed in `apps/web/__tests__/`
- **Setup:** Shared setup in `setup.ts`
- **Mocks:** Use manual mocks for external dependencies

**Example:**
```typescript
// apps/web/__tests__/userService.test.ts
import { getUser } from '../lib/services/userService';

describe('getUser', () => {
  it('returns user data for a valid ID', async () => {
    const user = await getUser('user123');
    expect(user).toHaveProperty('id', 'user123');
  });
});
```

---

## Commands

| Command            | Purpose                                                        |
|--------------------|----------------------------------------------------------------|
| /new-api-endpoint  | Add or update an API endpoint and related types/tests          |
| /new-feature       | Add a new UI feature, page, or major component                 |
| /update-ci-cd      | Update CI/CD workflows, deployment configs, or environment     |
| /fix-types         | Fix TypeScript errors and improve type safety                  |
| /add-tests         | Add or expand test coverage and infrastructure                 |
| /update-docs       | Add or update documentation and onboarding materials           |
```
