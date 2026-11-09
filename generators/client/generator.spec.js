import { beforeAll, describe, expect, it } from 'expect-node';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'client';
const BLUEPRINT_NAMESPACE = `jhipster:${SUB_GENERATOR}`;

describe('SubGenerator client of nodejs JHipster blueprint', () => {
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

  describe('admin screens', () => {
    const run = config =>
      helpers
        .run(BLUEPRINT_NAMESPACE)
        .withJHipsterConfig(config)
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});

    const CONVERTERS = ['configuration', 'health', 'label', 'logs', 'metrics'].map(name => `client/src/app/shared/jhipster/${name}.ts`);

    describe('with the defaults', () => {
      beforeAll(() => run({}));

      it('should write the screens and the converters of the NodeJS server', () => {
        result.assertFile(['client/src/app/admin/metrics/metrics.ts', ...CONVERTERS]);
        result.assertFileContent('client/src/app/shared/jhipster/metrics.ts', "id: 'nodeMetrics'");
      });

      it('should not read the responses of Spring Boot', () => {
        result.assertNoFileContent('client/src/app/shared/jhipster/metrics.ts', 'jvm:');
        result.assertNoFileContent('client/src/app/shared/jhipster/configuration.ts', 'propertySources');
      });
    });

    describe('with withAdminUi disabled', () => {
      beforeAll(() => run({ withAdminUi: false }));

      it('should write neither the screens nor the converters', () => {
        result.assertNoFile(['client/src/app/admin/metrics/metrics.ts', ...CONVERTERS]);
      });
    });

    describe('with enableTranslation disabled', () => {
      beforeAll(() => run({ enableTranslation: false }));

      it('should replace the translations in the converters', () => {
        for (const file of CONVERTERS) {
          result.assertNoFileContent(file, '__jhiTransformTranslateStringify__');
          result.assertNoFileContent(file, 'translationKey');
        }
      });
    });
  });
});
