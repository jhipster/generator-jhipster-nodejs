import { minimatch } from 'minimatch';

/** The parts of the blueprint a change can touch, by the files of each one. */
const patterns = {
  angular: ['generators/client/**/angular/**', 'generators/**/templates/**/angular/**'],
  react: ['generators/client/**/react/**', 'generators/**/templates/**/react/**'],
  vue: ['generators/client/**/vue/**', 'generators/**/templates/**/vue/**'],
  client: ['generators/client/**', 'generators/cypress/**', 'generators/languages/**'],
  nodeServer: ['generators/node-server/**', 'generators/server/**', 'generators/common/**'],
  docker: ['generators/docker/**', 'generators/docker-compose/**'],
  ci: ['.blueprint/**', '.github/**', 'package.json', 'package-lock.json'],
  docs: ['**/*.md'],
};

/**
 * The parts of the blueprint the changed files touch, like the detectChanges of generator-jhipster
 * (`.blueprint/github-build-matrix`).
 * @typedef {Record<keyof typeof patterns, boolean> & { any: boolean }} Changes
 * @param {string[]} files
 * @returns {Changes}
 */
export const detectChanges = files => ({
  ...Object.fromEntries(
    Object.entries(patterns).map(([key, globs]) => [key, files.some(file => globs.some(glob => minimatch(file, glob, { dot: true })))]),
  ),
  any: files.length > 0,
});

/**
 * Every part changed, the matrix of every sample.
 * @returns {Changes}
 */
export const allChanges = () => ({ ...Object.fromEntries(Object.keys(patterns).map(key => [key, true])), any: true });
