import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'node-server';
const SUB_GENERATOR_NAMESPACE = `jhipster-nodejs:${SUB_GENERATOR}`;

describe('SubGenerator node-server of nodejs JHipster blueprint', () => {
  describe('run', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig()
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should succeed', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });
  });
  describe('without client', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({
          skipClient: true,
        })
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should succeed', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('README should match snapshot', () => {
      expect(result.getSnapshot('**/README.md')).toMatchSnapshot();
    });
  });
  describe('with oauth2', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({
          authenticationType: 'oauth2',
          skipClient: true,
        })
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should succeed', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should generate the users of the identity provider without the users administration', () => {
      result.assertFile(['server/src/domain/user.entity.ts', 'server/src/web/rest/account.controller.ts']);
      result.assertNoFile(['server/src/web/rest/user.controller.ts', 'server/e2e/user.e2e-spec.ts']);
      result.assertNoFileContent('server/src/module/user.module.ts', 'UserController');
    });
  });
});
