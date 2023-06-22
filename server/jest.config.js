module.exports = {
  transform: { '^.+\\.ts?$': 'ts-jest' },
  testEnvironment: 'node',
  // testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
  testRegex: './src/tests/*',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
