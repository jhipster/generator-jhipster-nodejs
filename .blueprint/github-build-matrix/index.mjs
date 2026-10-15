export { default } from './generator.mjs';
export { default as command } from './command.mjs';
// The matrix of the samples the CI runs for the changes of a checkout, for the tools choosing the samples of a change,
// like the exports of the github-build-matrix of generator-jhipster.
export { buildMatrix } from './support/build-matrix.mjs';
export { allChanges, detectChanges } from './support/git-changes.mjs';
