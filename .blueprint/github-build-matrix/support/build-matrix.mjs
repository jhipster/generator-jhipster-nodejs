import { convertToGitHubMatrix, getGithubSamplesGroup } from 'generator-jhipster/ci';

import { allChanges } from './git-changes.mjs';

/**
 * @typedef {object} BuildMatrixOptions
 * @property {string} workflow The workflow whose matrix is built, a samples group of the blueprint.
 * @property {import('./git-changes.mjs').Changes} [changes] The changes, see detectChanges; every part by default.
 * @property {(message: string) => void} [warn]
 */

/**
 * The samples a workflow runs for some changes, the rules of the CI of the blueprint, like the buildMatrix of
 * generator-jhipster: the integration workflows have no path filter, a change runs every sample of every group. A
 * workflow that is not a samples group of the blueprint (the generators workflow of generator-jhipster) has no job.
 * @param {BuildMatrixOptions} options
 */
export const buildMatrix = async ({ workflow, changes = allChanges(), warn = () => {} }) => {
  // describe-samples awaits its descriptions at its top level: imported when used, not with the generator, which
  // yeoman-environment requires.
  const { WORKFLOWS, samplesGroupFolder } = await import('../../describe-samples/support/describe-samples.mjs');
  if (!WORKFLOWS.includes(workflow)) {
    return {};
  }
  if (!changes.any) {
    return { include: [] };
  }
  const { samples, warnings } = await getGithubSamplesGroup(samplesGroupFolder, workflow);
  if (warnings.length > 0) {
    warn(warnings.join('\n'));
  }
  return convertToGitHubMatrix(samples);
};
