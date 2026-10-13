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

    it('should register the configuration in the ConfigModule of @nestjs/config', () => {
      result.assertFileContent(
        'server/src/app.module.ts',
        'ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, cache: true, load: [configuration] })',
      );
      result.assertJsonFileContent('server/package.json', { dependencies: { '@nestjs/config': /./ } });
    });

    it('should test the server with Vitest', () => {
      result.assertJsonFileContent('server/package.json', {
        scripts: { test: 'vitest run', 'test:e2e': 'vitest run --config ./vitest.config.e2e.ts --coverage --silent' },
        devDependencies: { vitest: /./, vite: /./, '@vitest/coverage-v8': /./ },
      });
      const { dependencies, devDependencies } = result.fs.readJSON(join(result.cwd, 'server/package.json'));
      expect(Object.keys({ ...dependencies, ...devDependencies }).filter(name => name.includes('jest'))).toEqual([]);
      result.assertFile(['server/vitest.config.ts', 'server/vitest.config.e2e.ts']);
      result.assertNoFile('server/e2e/jest.e2e.config.json');
    });

    it('root scripts should run the server and the client workspaces', () => {
      result.assertJsonFileContent('package.json', {
        scripts: {
          build: 'npm run build -w server && npm run build -w client',
          lint: 'npm run lint --workspaces',
          'lint:fix': 'npm run lint:fix --workspaces',
          test: 'npm test --workspaces',
        },
      });
    });

    it('root package.json should provide the tools and the server scripts the client scripts use', () => {
      expect(result.fs.readJSON(join(result.cwd, 'package.json'))).toMatchObject({
        config: { backend_port: 8080 },
        devDependencies: { concurrently: expect.any(String), 'wait-on': expect.any(String) },
        scripts: {
          'backend:start': 'npm run start:server',
          'ci:e2e:package': 'npm run build',
          'ci:e2e:server:start': 'BACKEND_ENV=test npm run start:prod -w server',
          'ci:server:await': expect.stringContaining(
            'wait-on -t 180000 http-get://127.0.0.1:$npm_package_config_backend_port/management/health ',
          ),
        },
      });
    });

    it('should create the JWT secret', () => {
      const { jwtSecretKey } = result.fs.readJSON(join(result.cwd, '.yo-rc.json'))['generator-jhipster'];
      expect(jwtSecretKey).toBeTruthy();
      result.assertFileContent('server/src/config/application-secret-samples.yml', `base64-secret: ${jwtSecretKey}`);
      result.assertNoFileContent('server/src/config/application.yml', 'base64-secret:');
    });

    it('should write the profiles of JHipster Spring Boot', () => {
      result.assertFile(['server/src/config/application-secret-samples.yml']);
      result.assertFileContent('server/src/main.ts', "if (isProfileActive('api-docs')) {");
    });

    it('should keep the credentials of the prod database in the secret-samples profile', () => {
      result.assertFileContent('server/src/config/application-prod.yml', "  username: ''\n  password: ''\n");
      result.assertFileContent('server/src/config/application-secret-samples.yml', /^database:\n {2}username: \S+/m);
    });
  });
  describe('with translations', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true, enableTranslation: true })
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('alert headers should be translation keys', () => {
      result.assertFileContent('server/src/common/header-util.ts', "applicationName + '.' + entityName + '.created'");
      result.assertNoFileContent('server/src/common/header-util.ts', 'is created with identifier');
    });
  });

  describe('without translations', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true, enableTranslation: false })
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('alert headers should be messages, without the translation keys', () => {
      result.assertFileContent('server/src/common/header-util.ts', "'A new ' + entityName + ' is created with identifier ' + param");
      result.assertNoFileContent('server/src/common/header-util.ts', "'.created'");
      result.assertNoFileContent('server/src/common/header-util.ts', 'enableTranslation');
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

    it('root scripts should run the server workspace', () => {
      result.assertJsonFileContent('package.json', {
        scripts: {
          build: 'npm run build -w server',
          lint: 'npm run lint --workspaces',
          'lint:fix': 'npm run lint:fix --workspaces',
          start: 'npm run start:server',
          test: 'npm test --workspaces',
        },
      });
      result.assertNoFileContent('package.json', 'no client');
      result.assertNoFileContent('package.json', 'concurrently');
      result.assertNoFileContent('package.json', 'wait-on');
    });
  });
  describe('with mariadb', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({
          prodDatabaseType: 'mariadb',
          skipClient: true,
        })
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should use the MySQL driver', () => {
      result.assertFileContent('server/src/config/application-prod.yml', 'type: mariadb');
      result.assertFileContent('server/src/orm.config.ts', /'?mariadb'?: \(\) => require\('mysql2'\)/);
      result.assertJsonFileContent('server/package.json', { dependencies: { mysql2: /./ } });
    });
  });

  for (const databaseType of ['cassandra', 'couchbase', 'neo4j', 'no']) {
    describe(`with ${databaseType} database type`, () => {
      it('should fail with an unsupported database type error', async () => {
        await expect(
          helpers
            .run(SUB_GENERATOR_NAMESPACE)
            .withJHipsterConfig({ databaseType, skipClient: true })
            .withOptions({ ignoreNeedlesError: true })
            .withJHipsterGenerators()
            .withConfiguredBlueprint()
            .withBlueprintConfig({}),
        ).rejects.toThrow(`The database type ${databaseType} is not supported by the JHipster NodeJS blueprint`);
      });
    });
  }

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
  describe('jwt microservice', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({
          applicationType: 'microservice',
          authenticationType: 'jwt',
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

    it('should only validate the tokens, without users nor authentication API', () => {
      result.assertFile(['server/src/security/passport.jwt.strategy.ts', 'server/src/web/rest/account.controller.ts']);
      result.assertNoFile([
        'server/src/domain/user.entity.ts',
        'server/src/service/user.service.ts',
        'server/src/web/rest/user.jwt.controller.ts',
        'server/src/security/password-util.ts',
        'server/src/service/dto/user-login.dto.ts',
        'server/src/service/dto/password-change.dto.ts',
      ]);
      result.assertNoFileContent('server/src/security/passport.jwt.strategy.ts', 'AuthService');
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
  describe('entity validators', () => {
    const bookEntity = {
      name: 'Book',
      changelogDate: '20261012000000',
      fields: [
        { fieldName: 'title', fieldType: 'String', fieldValidateRules: ['required', 'maxlength'], fieldValidateRulesMaxlength: 50 },
        { fieldName: 'isbn', fieldType: 'String', fieldValidateRules: ['pattern'], fieldValidateRulesPattern: '^\\d{3}-[0-9]{6}$' },
        {
          fieldName: 'pages',
          fieldType: 'Integer',
          fieldValidateRules: ['min', 'max'],
          fieldValidateRulesMin: 1,
          fieldValidateRulesMax: 5000,
        },
      ],
    };

    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true }, [bookEntity])
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should anchor the pattern of a field, like Bean Validation @Pattern', () => {
      result.assertFileContent('server/src/service/dto/book.dto.ts', String.raw`@Matches("^(?:^\\d{3}-[0-9]{6}$)$")`);
      result.assertNoFileContent('server/src/service/dto/book.dto.ts', 'undefined');
    });

    it('should accept a missing value of an optional validated field', () => {
      expect(result.getSnapshot('**/book.dto.ts')).toMatchSnapshot();
    });
  });

  describe('entity column types', () => {
    // The entities are shared by the prod database and by better-sqlite3 (dev and test).
    const sampleEntity = {
      name: 'Sample',
      changelogDate: '20261007000000',
      fields: [
        { fieldName: 'count', fieldType: 'Integer' },
        { fieldName: 'big', fieldType: 'Long' },
        { fieldName: 'ratio', fieldType: 'Float' },
        { fieldName: 'rate', fieldType: 'Double' },
        { fieldName: 'amount', fieldType: 'BigDecimal' },
        { fieldName: 'day', fieldType: 'LocalDate' },
        { fieldName: 'active', fieldType: 'Boolean' },
        { fieldName: 'level', fieldType: 'Level', fieldValues: 'LOW,HIGH' },
        { fieldName: 'photo', fieldType: 'byte[]', fieldTypeBlobContent: 'image' },
        { fieldName: 'notes', fieldType: 'byte[]', fieldTypeBlobContent: 'text' },
      ],
    };

    for (const prodDatabaseType of ['postgresql', 'mysql', 'mssql', 'oracle']) {
      describe(`with ${prodDatabaseType}`, () => {
        beforeAll(async function () {
          await helpers
            .run(SUB_GENERATOR_NAMESPACE)
            .withJHipsterConfig({ prodDatabaseType, skipClient: true }, [sampleEntity])
            .withOptions({ ignoreNeedlesError: true })
            .withJHipsterGenerators()
            .withConfiguredBlueprint();
        });

        it('should generate column types valid on the prod database and on SQLite', () => {
          expect(result.getSnapshot('**/sample.entity.ts')).toMatchSnapshot();
        });
      });
    }
  });
  describe('upgrading an oauth2 application generated with 4.0.0', () => {
    const oldFiles = [
      'server/scripts/entrypoint.sh',
      'server/src/client/header-util.ts',
      'server/src/client/request.ts',
      'server/src/client/interceptors/logging.interceptor.ts',
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

      it('should remove the entrypoint script', () => {
        result.assertNoFile('server/scripts/entrypoint.sh');
      });

      it('should move the HTTP helpers from src/client to src/common', () => {
        result.assertNoFile([
          'server/src/client/header-util.ts',
          'server/src/client/request.ts',
          'server/src/client/interceptors/logging.interceptor.ts',
        ]);
        result.assertFile([
          'server/src/common/header-util.ts',
          'server/src/common/request.ts',
          'server/src/common/interceptors/logging.interceptor.ts',
        ]);
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

    describe('generated with 4.2.0', () => {
      beforeAll(async function () {
        await helpers
          .run(SUB_GENERATOR_NAMESPACE)
          .doInDir(writeExistingProject({ syncUserWithIdp: false }, '4.2.0'))
          .withOptions({ ignoreNeedlesError: true })
          .withJHipsterGenerators()
          .withConfiguredBlueprint();
      });

      it('should move the HTTP helpers from src/client to src/common', () => {
        result.assertNoFile([
          'server/src/client/header-util.ts',
          'server/src/client/request.ts',
          'server/src/client/interceptors/logging.interceptor.ts',
        ]);
        result.assertFile('server/src/common/header-util.ts');
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
