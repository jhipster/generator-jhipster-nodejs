import { beforeAll, describe, expect, it } from 'vitest';
import { join } from 'node:path';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

import BootstrapApplicationGenerator from '../bootstrap-application/index.js';

const SUB_GENERATOR = 'node-server';
const SUB_GENERATOR_PATH = join(import.meta.dirname, 'index.js');

describe('SubGenerator node-server of nodejs JHipster blueprint', () => {
  describe('run', () => {
    beforeAll(async function () {
      await helpers
        .runJHipster(SUB_GENERATOR_PATH, { prepareEnvironment: true })
        .withJHipsterConfig({ backendType: 'NodeJS' })
        .withOptions({
          commandName: SUB_GENERATOR,
          skipChecks: true,
          ignoreNeedlesError: true,
          blueprint: ['nodejs'],
        })
        .withGenerators([[BootstrapApplicationGenerator, { namespace: 'jhipster-nodejs:bootstrap-application' }]])
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should succeed', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });
  });
  describe('without client', () => {
    beforeAll(async function () {
      await helpers
        .runJHipster(SUB_GENERATOR_PATH, { prepareEnvironment: true })
        .withJHipsterConfig({
          backendType: 'NodeJS',
          skipClient: true,
        })
        .withOptions({
          commandName: SUB_GENERATOR,
          skipChecks: true,
          ignoreNeedlesError: true,
          blueprint: ['nodejs'],
        })
        .withGenerators([[BootstrapApplicationGenerator, { namespace: 'jhipster-nodejs:bootstrap-application' }]])
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should succeed', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('README should match snapshot', () => {
      expect(result.getSnapshot('**/README.md')).toMatchSnapshot();
    });
  });
});
