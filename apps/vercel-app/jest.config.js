/** @type {import('jest').Config} */
module.exports = {
  displayName: 'vercel-app',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lib', '<rootDir>/app'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  // Matches actual usage across the app (`@/lib/server/...`, `@/app/...`),
  // which treats `@/` as the project root rather than tsconfig's literal
  // (and seemingly unused) `"@/*": ["./lib/*"]` mapping.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        moduleResolution: 'node',
        strict: false,
      },
    }],
  },
  collectCoverageFrom: [
    'lib/server/**/*.ts',
    '!**/__tests__/**',
    '!**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: './coverage',
  testTimeout: 30000,
  verbose: true,
};
