// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    verbose: true,
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
  };
  