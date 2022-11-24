/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  globalSetup: '<rootDir>/src/test/setup.ts',
  globalTeardown: '<rootDir>/src/test/teardown.ts',
  passWithNoTests: true,
  roots: ["<rootDir>/src"],
  testMatch: ["<rootDir>/src/**/*.(test|spec).(ts|js)"],
  coverageDirectory: "coverage",
  moduleFileExtensions: ["js", "json", "ts", "node"],
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/lib/", "/dist/"],
  modulePathIgnorePatterns: ["dist"],
  displayName: {
    color: "blue",
    name: "togm",
  },
  coverageReporters: ["text", "json", "html", "cobertura", "lcov"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!**/node_modules/**", "!**/vendor/**"],
  testTimeout: 10000,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
