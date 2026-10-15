import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'languages';
const BLUEPRINT_NAMESPACE = `jhipster:${SUB_GENERATOR}`;

describe('SubGenerator languages of nodejs JHipster blueprint', () => {
  describe('run', () => {
    beforeAll(async function () {
      await helpers
        .run(BLUEPRINT_NAMESPACE)
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

  describe('adding a language', () => {
    beforeAll(async function () {
      await helpers
        .run(BLUEPRINT_NAMESPACE)
        .withJHipsterConfig({ skipClient: true, enableTranslation: true, nativeLanguage: 'en', languages: ['en'] })
        .withArguments(['fr'])
        .withOptions({
          ignoreNeedlesError: true,
          skipPrompts: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should write the server messages of the language, named by its language tag', () => {
      result.assertFile('server/src/i18n/messages_fr.properties');
      result.assertNoFile('server/src/i18n/messages_fr_FR.properties');
      result.assertNoFile('src/main/resources/i18n/messages_fr.properties');
    });
  });
});
