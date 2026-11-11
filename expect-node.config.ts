import { defineConfig } from 'expect-node/config';

export default defineConfig({
  files: ['{generators,.blueprint}/**/*.spec.{js,mjs,ts}', '!**/templates/**', '!**/resources/**'],
  setupFiles: ['./test-setup.ts'],
  mochaHooks: ['yeoman-test/mocha-cleanup'],
  timeout: 20000,
  // The test files by processes reused, as many as the cores.
  workers: true,
  // Every snapshot file written in the format of expect-node, its header included, by the next run that writes snapshots.
  snapshotMigration: 'all',
});
