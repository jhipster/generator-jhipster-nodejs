import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'ci-cd';

describe('SubGenerator ci-cd of nodejs JHipster blueprint', () => {
  describe('run', () => {
    beforeAll(async function () {
      await helpers
        .runJHipster(SUB_GENERATOR)
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
  });
});
