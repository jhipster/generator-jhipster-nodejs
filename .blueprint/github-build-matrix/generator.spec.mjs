import { beforeAll, describe, expect, it } from 'vitest';
import { basename, join } from 'path';

import { defaultHelpers as helpers, runResult } from 'generator-jhipster/testing';

import { WORKFLOWS } from '../describe-samples/support/describe-samples.mjs';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  // The workflows, and the folder of every sample.
  for (const workflow of [...WORKFLOWS, 'samples']) {
    describe(`with ${workflow}`, () => {
      beforeAll(async () => {
        await helpers.runJHipster(join(import.meta.dirname, 'index.mjs'), { prepareEnvironment: true }).withArguments(workflow);
      });

      it('should match matrix value', () => {
        const { matrix } = runResult.generator;
        // The node and npm versions are the ones generator-jhipster recommends, they change with generator-jhipster.
        expect({
          ...matrix,
          include: matrix.include.map(job => ({ ...job, 'node-version': expect.any(String), 'npm-version': expect.any(String) })),
        }).toMatchSnapshot();
      });
    });
  }
});
