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

    it('should match the files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('with Vue', () => {
    beforeAll(async function () {
      await helpers
        .run(BLUEPRINT_NAMESPACE)
        .withJHipsterConfig({ clientFramework: 'vue' })
        .withOptions({ ignoreNeedlesError: true, useVersionPlaceholders: false })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should give the root the axios of the client, the one npm hoists to the root of the workspaces', () => {
      const { dependencies } = result.fs.readJSON(`${result.cwd}/client/package.json`);
      result.assertJsonFileContent('package.json', { devDependencies: { axios: dependencies.axios } });
    });
  });

  describe('with Vue in the application', () => {
    beforeAll(async function () {
      await helpers
        .run('jhipster:app')
        .withJHipsterConfig({ clientFramework: 'vue' })
        .withOptions({ ignoreNeedlesError: true, useVersionPlaceholders: false })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should give the root the overrides of the client, which npm reads from the root only', () => {
      const overridesOf = file => result.fs.readJSON(`${result.cwd}/${file}`)?.overrides ?? {};
      const { dependencies, devDependencies } = result.fs.readJSON(`${result.cwd}/client/package.json`);
      const versions = { ...dependencies, ...devDependencies };
      const resolved = JSON.parse(
        JSON.stringify(overridesOf('client/package.json'), (_key, value) =>
          typeof value === 'string' && value.startsWith('$') ? versions[value.slice(1)] : value,
        ),
      );
      expect(overridesOf('package.json')).toMatchObject(resolved);
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
