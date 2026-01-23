/* eslint-disable */
module.exports = {
  displayName: 'svc-history',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/svc-history',

  // 👇 AQUÍ ESTÁ LA SOLUCIÓN:
  // 1. Usamos module.exports (obligatorio para .cts)
  // 2. Mapeamos 'uuid' a tu archivo local falso para evitar el error de export
  moduleNameMapper: {
    '^uuid$': '<rootDir>/src/__mocks__/uuid.ts',
  },
};
