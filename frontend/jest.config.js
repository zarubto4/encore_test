const { getJestProjectsAsync } = require('@nx/jest');

module.exports = async () => {
  // temp disabled
  const projects = await getJestProjectsAsync();
  return {
    reporters: ['default', ['jest-junit', { outputDirectory: './test/log', outputName: 'results.xml' }]],
    projects: [
      // ...projects,
      '<rootDir>/apps/rbac-ui',
    ],
  };
};
