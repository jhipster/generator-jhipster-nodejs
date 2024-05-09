import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'bootstrap-application';
const BLUEPRINT_NAMESPACE = `jhipster:${SUB_GENERATOR}`;

describe('SubGenerator bootstrap-application of nodejs JHipster blueprint', () => {
  describe('run', () => {
    beforeAll(async function () {
      await helpers
        .run(BLUEPRINT_NAMESPACE)
        .withJHipsterConfig()
        .withOptions({
          ignoreNeedlesError: true,
          blueprint: 'nodejs',
        })
        .withJHipsterLookup()
        .withParentBlueprintLookup();
    });

    it('should succeed', () => {
      // expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('application should match snapshot', () => {
      var clone = Object.assign({}, { ...result.generator.sharedData.getApplication(), user: undefined });
      // Temp test failure relief
      // 'faker' attribute in the object key is causing 'val.getMockName is not a function' error in jest/packages/pretty-format which is usedby vitest
      delete clone.authority;
      delete clone.userManagement;
      expect(clone).toMatchSnapshot();
    });
  });
});
