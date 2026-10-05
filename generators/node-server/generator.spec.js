import { beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

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

    it('should not generate built-in users by default (syncUserWithIdp disabled)', () => {
      result.assertFile(['server/src/web/rest/account.controller.ts', 'server/src/web/rest/management.controller.ts']);
      result.assertNoFile([
        'server/src/domain/user.entity.ts',
        'server/src/domain/authority.entity.ts',
        'server/src/module/user.module.ts',
        'server/src/web/rest/user.controller.ts',
        'server/src/web/rest/public.user.controller.ts',
        'server/src/migrations/1570200490072-SeedUsersRoles.ts',
      ]);
      result.assertFileContent('server/src/module/auth.module.ts', 'ManagementController');
    });
  });
  describe('with oauth2 and syncUserWithIdp', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({
          authenticationType: 'oauth2',
          syncUserWithIdp: true,
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
      result.assertFile([
        'server/src/domain/user.entity.ts',
        'server/src/domain/authority.entity.ts',
        'server/src/web/rest/public.user.controller.ts',
        'server/src/migrations/1570200490072-SeedUsersRoles.ts',
      ]);
      result.assertNoFile(['server/src/web/rest/user.controller.ts', 'server/e2e/user.e2e-spec.ts']);
      result.assertNoFileContent('server/src/module/user.module.ts', 'UserController');
    });
  });
  describe('upgrading an oauth2 application generated with 4.0.0', () => {
    const oldFiles = [
      'server/src/web/rest/user.controller.ts',
      'server/e2e/user.e2e-spec.ts',
      'server/src/domain/user.entity.ts',
      'server/src/module/user.module.ts',
      'server/src/domain/authority.entity.ts',
      'server/src/migrations/1570200490072-SeedUsersRoles.ts',
    ];
    // An existing project is read from the disk: its .yo-rc.json and its files.
    const writeExistingProject =
      (config, nodejsVersion = '4.0.0') =>
      dir => {
        writeFileSync(
          join(dir, '.yo-rc.json'),
          JSON.stringify({
            'generator-jhipster': {
              baseName: 'jhipster',
              authenticationType: 'oauth2',
              skipClient: true,
              jhipsterVersion: '9.4.0',
              ...config,
            },
            'generator-jhipster-nodejs': { nodejsVersion },
          }),
        );
        for (const file of oldFiles) {
          mkdirSync(dirname(join(dir, file)), { recursive: true });
          writeFileSync(join(dir, file), '');
        }
      };

    describe('without syncUserWithIdp', () => {
      beforeAll(async function () {
        await helpers
          .run(SUB_GENERATOR_NAMESPACE)
          .doInDir(writeExistingProject({}))
          .withOptions({ ignoreNeedlesError: true })
          .withJHipsterGenerators()
          .withConfiguredBlueprint();
      });

      it('should keep synchronizing the users', () => {
        result.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { syncUserWithIdp: true } });
        result.assertFile(['server/src/domain/user.entity.ts', 'server/src/domain/authority.entity.ts']);
      });

      it('should remove the users administration', () => {
        result.assertNoFile(['server/src/web/rest/user.controller.ts', 'server/e2e/user.e2e-spec.ts']);
      });
    });

    describe('generated by the current version', () => {
      beforeAll(async function () {
        await helpers
          .run(SUB_GENERATOR_NAMESPACE)
          .doInDir(writeExistingProject({}, JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).version))
          .withOptions({ ignoreNeedlesError: true })
          .withJHipsterGenerators()
          .withConfiguredBlueprint();
      });

      it('should not enable syncUserWithIdp', () => {
        result.assertNoJsonFileContent('.yo-rc.json', { 'generator-jhipster': { syncUserWithIdp: true } });
      });
    });

    describe('with syncUserWithIdp disabled', () => {
      beforeAll(async function () {
        await helpers
          .run(SUB_GENERATOR_NAMESPACE)
          .doInDir(writeExistingProject({ syncUserWithIdp: false }))
          .withOptions({ ignoreNeedlesError: true })
          .withJHipsterGenerators()
          .withConfiguredBlueprint();
      });

      it('should remove the built-in users and authorities', () => {
        result.assertNoFile(oldFiles);
      });
    });
  });
});
