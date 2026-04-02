import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'server';

describe('SubGenerator server of nodejs JHipster blueprint', () => {
  describe('run', () => {
    beforeAll(async function () {
      await helpers
        .runJHipster(SUB_GENERATOR, { prepareEnvironment: true })
        .withJHipsterConfig({ backendType: 'NodeJS' }, [
          {
            name: 'Foo',
            fields: [
              { fieldName: 'name', fieldType: 'String', fieldValidateRules: ['required'] },
              { fieldName: 'myEnum', fieldType: 'MyEnum', fieldValues: 'FRENCH,ENGLISH' },
            ],
          },
        ])
        .withOptions({
          skipChecks: true,
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
