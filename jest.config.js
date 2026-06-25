/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/packages',
    '<rootDir>/apps',
  ],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.js',
  ],
  moduleNameMapper: {
    '^@sierra-estates/obedian$': '<rootDir>/packages/obedian/src/index.ts',
    '^@sierra-estates/memory-engine$': '<rootDir>/packages/memory-engine/src/index.ts',
    '^@sierra-estates/agents-core$': '<rootDir>/packages/agents-core/src/index.ts',
    '^@sierra-estates/db$': '<rootDir>/packages/db/lib/index.ts',
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
    'packages/*/src/**/*.ts',
    'apps/agents/whatsapp-bot/**/*.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: './coverage',
  testTimeout: 30000,
  verbose: true,
}
