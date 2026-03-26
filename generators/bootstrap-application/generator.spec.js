import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'bootstrap-application';
const SUB_GENERATOR_NAMESPACE = `jhipster-nodejs:${SUB_GENERATOR}`;

describe('SubGenerator bootstrap-application of nodejs JHipster blueprint', () => {
  describe('run', () => {
    beforeAll(async function () {
      await helpers
        .runJHipster(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig()
        .withOptions({
          ignoreNeedlesError: true,
          blueprint: ['nodejs'],
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should succeed', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('application should expose expected NodeJS defaults', () => {
      expect(result.application).toMatchObject({
        clientRootDir: 'client/',
        clientSrcDir: 'client/src/',
        clientTestDir: 'client/test/',
        dockerServicesDir: 'docker/',
        nodeServerRootDir: 'server/',
        temporaryDir: 'tmp/',
        withAdminUi: false,
      });
    });
  });
});
