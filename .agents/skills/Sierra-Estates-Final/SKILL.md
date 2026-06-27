---
name: Sierra-Estates-Final Development Patterns
description: Auto-generated skill from repository analysis
---

# Sierra-Estates-Final Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides guidance on the development patterns, coding conventions, and workflows used in the Sierra-Estates-Final TypeScript codebase. It covers file organization, code style, commit practices, and testing patterns to ensure consistency and maintainability across the project.

## Coding Conventions

### File Naming

- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `propertyList.ts`

### Import Style

- Use **alias imports** for modules.
  - Example:

    ```typescript
    import { getUserDetails } from 'services/userService';
    ```

### Export Style

- Use **named exports** for functions, constants, and classes.
  - Example:

    ```typescript
    // In userProfile.ts
    export function getUserProfile(id: string) { ... }
    export const USER_ROLE = 'admin';
    ```

### Commit Messages

- Follow **Conventional Commits** with the `feat` prefix for new features.
  - Example:

    ```text
    feat: add property search functionality
    ```

## Workflows

### Feature Development

**Trigger:** When adding a new feature to the codebase  
**Command:** `/feature`

1. Create a new branch for your feature.
2. Implement the feature using camelCase file naming and named exports.
3. Use alias imports for dependencies.
4. Write or update relevant tests (`*.test.*`).
5. Commit changes using the `feat` prefix and a concise message.
6. Open a pull request for review.

### Code Testing

**Trigger:** When verifying code correctness  
**Command:** `/test`

1. Identify or create test files matching `*.test.*` pattern.
2. Write tests for new or updated code.
3. Run the test suite using the project's test runner.
4. Ensure all tests pass before merging.

## Testing Patterns

- Test files follow the `*.test.*` naming convention (e.g., `userProfile.test.ts`).
- The specific testing framework is not detected; refer to project documentation or existing test files for framework usage.
- Example test file:

  ```typescript
  // userProfile.test.ts
  import { getUserProfile } from './userProfile';

  describe('getUserProfile', () => {
    it('returns user profile for valid ID', () => {
      // test implementation
    });
  });
  ```

## Commands

| Command    | Purpose                                 |
|------------|-----------------------------------------|
| /feature   | Start a new feature development workflow|
| /test      | Run or write tests for the codebase     |
