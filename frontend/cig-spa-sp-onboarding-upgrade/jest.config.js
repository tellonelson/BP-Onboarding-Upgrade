module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
    testMatch: ['**/+(*.)+(spec).+(ts)'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        '^app/(.*)$': '<rootDir>/src/app/$1',
        '^@core/(.*)$': '<rootDir>/src/app/core/$1',
        '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
        '^@layouts/(.*)$': '<rootDir>/src/app/layouts/$1',
        '^@pages/(.*)$': '<rootDir>/src/app/pages/$1',
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};
