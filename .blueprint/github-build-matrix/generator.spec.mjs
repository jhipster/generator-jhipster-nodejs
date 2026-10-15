import { beforeAll, describe, expect, it } from 'vitest';
import { basename, join } from 'path';

import { getGithubSamplesGroups } from 'generator-jhipster/ci';
import { defaultHelpers as helpers, runResult } from 'generator-jhipster/testing';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, async () => {
  const groups = await getGithubSamplesGroups(join(import.meta.dirname, '../generate-sample/templates/'));
  for (const workflow of groups.map(sample => sample.split('.')[0])) {
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
