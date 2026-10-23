import { getGithubOutputFile, setGithubTaskOutput } from 'generator-jhipster/ci';
import BaseCoreGenerator from 'generator-jhipster/generators/base-core';

import { WORKFLOWS, samplesGroupMatrix, samplesGroupOf } from '../describe-samples/support/describe-samples.mjs';

/**
 * The GitHub matrix of the jobs of a workflow: the samples of its samples group, as describe-samples gives them, so the CI
 * runs the samples the tools choosing the samples of a change (describeChangedSamples) give. A folder of samples is a
 * group too, like the `samples` folder by default.
 */
export default class extends BaseCoreGenerator {
  /** @type {string} */
  samplesGroup;
  /** @type {object} */
  matrix;

  get [BaseCoreGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async buildMatrix() {
        const { samplesGroup = 'samples' } = this;
        if (!samplesGroupOf(samplesGroup)) {
          throw new Error(`Samples group ${samplesGroup} not found, expected a folder of samples or one of ${WORKFLOWS.join(', ')}`);
        }
        this.matrix = samplesGroupMatrix(samplesGroup);
        const githubOutputFile = getGithubOutputFile();
        this.log.info('matrix', this.matrix);
        if (githubOutputFile) {
          setGithubTaskOutput('matrix', JSON.stringify(this.matrix));
        }
      },
    });
  }
}
