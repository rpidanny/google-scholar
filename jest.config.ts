import { defaults } from 'jest-config'
import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: defaults.testRegex,
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  testEnvironment: 'jest-environment-node',
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/tmp/',
    '<rootDir>/node_modules/',
    '<rootDir>/local_tests/',
  ],
  testTimeout: 20_000,
  setupFiles: ['<rootDir>/test/setup-test.ts'],
  // collectCoverageFrom: ['**/*.(t|j)s'],
  collectCoverageFrom: ['<rootDir>/src/**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [['lcov', { projectRoot: './' }], 'text'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/test/',
    '<rootDir>/dist/',
    '<rootDir>/tmp/',
    '<rootDir>/local_tests/',
    '<rootDir>/coverage/',
  ],
  coverageThreshold: {
    global: {
      statements: 87,
      branches: 63,
      functions: 84,
      lines: 90,
    },
  },
}

export default config
