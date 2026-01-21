const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-markdown$': '<rootDir>/node_modules/react-markdown',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-markdown|remark-gfm|rehype-raw)/)',
  ],
};

module.exports = createJestConfig(customJestConfig);
