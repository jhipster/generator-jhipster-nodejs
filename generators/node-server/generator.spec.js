import { beforeAll, describe, expect, it } from 'expect-node';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

import { compareModulePaths } from './support/index.js';

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

    it('should match the files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should register the configuration in the ConfigModule of @nestjs/config', () => {
      result.assertFileContent(
        'server/src/app.module.ts',
        'ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, cache: true, load: [configuration] })',
      );
      result.assertJsonFileContent('server/package.json', { dependencies: { '@nestjs/config': /./ } });
    });

    it('should check the server and the client sources with prettier', () => {
      result.assertJsonFileContent('package.json', { scripts: { 'prettier:check': /server\/src\/\*\*\/.*client\// } });
    });

    it('should declare express, which the server imports: pnpm exposes no package a dependency brings', () => {
      result.assertJsonFileContent('server/package.json', { dependencies: { express: /./, '@nestjs/platform-express': /./ } });
    });

    it('should import the TypeScript files', () => {
      result.assertFileContent('server/tsconfig.json', '"rewriteRelativeImportExtensions": true');
      result.assertFileContent('server/src/main.ts', "import { AppModule } from './app.module.ts';");
    });

    it('should generate the server as ES modules', () => {
      result.assertJsonFileContent('server/package.json', {
        type: 'module',
        // Node.js runs the TypeScript scripts as they are (type stripping)
        scripts: { typeorm: /typeorm -d ormconfig\.ts$/ },
      });
      const { devDependencies } = result.fs.readJSON(join(result.cwd, 'server/package.json'));
      expect(devDependencies).not.toHaveProperty('ts-node');
      result.assertFileContent('server/tsconfig.json', '"ormconfig.ts"');
    });

    it('should build and start the server with the Nest CLI', () => {
      expect(result.fs.readJSON(join(result.cwd, 'server/package.json'))).toMatchObject({
        // The development scripts run with the profile of .env.dev, the built application with the BACKEND_ENV of its environment.
        scripts: { build: 'nest build', 'start:dev': 'nest start --watch --env-file .env.dev', 'start:prod': 'node dist/main.js' },
        devDependencies: { '@nestjs/cli': expect.any(String) },
      });
      // The Nest CLI copies the configuration files next to the build.
      result.assertJsonFileContent('server/nest-cli.json', {
        compilerOptions: { assets: [{ include: 'config/**/*', outDir: 'dist' }], watchAssets: true },
      });
      result.assertNoFile('server/scripts/copy-resources.ts');
      result.assertFileContent('server/.env.dev', 'BACKEND_ENV=dev');
      result.assertNoFile('server/.env');
      result.assertFileContent('.gitignore', /^server\/\.env$/m);
      result.assertFileContent('server/src/main.ts', "import { AppModule } from './app.module.ts';");
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

    it('should build the server with tsc, without a webpack bundle', () => {
      const { scripts, devDependencies } = result.fs.readJSON(join(result.cwd, 'server/package.json'));
      expect(Object.entries({ ...scripts, ...devDependencies }).filter(entry => entry.join(' ').includes('webpack'))).toEqual([]);
      result.assertNoFile('server/webpack.server.prod.config.js');
    });

    it('should convert the mail templates of JHipster Spring Boot to Handlebars', () => {
      result.assertFileContent(
        'server/src/templates/mail/activationEmail.hbs',
        "<p>{{message 'email.activation.greeting' user.login}}</p>",
      );
      result.assertFileContent(
        'server/src/templates/mail/creationEmail.hbs',
        '<a href="{{baseUrl}}/account/reset/finish?key={{user.resetKey}}">{{baseUrl}}/account/reset/finish?key={{user.resetKey}}</a>',
      );
      result.assertFileContent('server/src/templates/mail/passwordResetEmail.hbs', "<title>{{message 'email.reset.title'}}</title>");
      for (const template of ['activationEmail', 'creationEmail', 'passwordResetEmail']) {
        result.assertNoFileContent(`server/src/templates/mail/${template}.hbs`, 'th:');
      }
    });

    it('should create the JWT secret', () => {
      const { jwtSecretKey } = result.fs.readJSON(join(result.cwd, '.yo-rc.json'))['generator-jhipster'];
      expect(jwtSecretKey).toBeTruthy();
      result.assertFileContent('server/src/config/application-secret-samples.yml', `base64-secret: ${jwtSecretKey}`);
      result.assertNoFileContent('server/src/config/application.yml', 'base64-secret:');
    });

    it('should write the profiles of JHipster Spring Boot', () => {
      result.assertFile([
        'server/src/config/application-secret-samples.yml',
        'server/src/config/application-tls.yml',
        'server/src/config/application-tls-samples.yml',
        'server/src/config/tls/keystore-samples.p12',
      ]);
      result.assertFileContent('server/src/main.ts', "if (isProfileActive('api-docs')) {");
    });

    it('should keep the credentials of the prod database in the secret-samples profile', () => {
      result.assertFileContent('server/src/config/application-prod.yml', "  username: ''\n  password: ''\n");
      result.assertFileContent('server/src/config/application-secret-samples.yml', /^database:\n {2}username: \S+/m);
    });
  });
  describe('with reproducible secrets', () => {
    // The JWT secret and the keystore of a generation, with or without --reproducible-secrets.
    const generate = async options => {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true, creationTimestamp: 1700000000000 })
        .withOptions({ ignoreNeedlesError: true, ...options })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
      return {
        jwtSecretKey: result.fs.readJSON(join(result.cwd, '.yo-rc.json'))['generator-jhipster'].jwtSecretKey,
        keyStore: result.fs.read(join(result.cwd, 'server/src/config/tls/keystore-samples.p12'), { raw: true }),
      };
    };

    it('should derive the JWT secret and the keystore from the creation timestamp, like JHipster Spring Boot', async () => {
      const first = await generate({ reproducibleSecrets: true });
      const second = await generate({ reproducibleSecrets: true });
      const random = await generate({});

      expect(second.jwtSecretKey).toBe(first.jwtSecretKey);
      expect(second.keyStore.equals(first.keyStore)).toBe(true);
      expect(random.jwtSecretKey).not.toBe(first.jwtSecretKey);
      expect(random.keyStore.equals(first.keyStore)).toBe(false);
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
      result.assertFileContent('server/src/common/header-util.ts', '`${this.applicationName}.${entityName}.created`');
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
      result.assertFileContent('server/src/common/header-util.ts', '`A new ${entityName} is created with identifier ${param}`');
      result.assertNoFileContent('server/src/common/header-util.ts', '.created`');
      result.assertNoFileContent('server/src/common/header-util.ts', 'enableTranslation');
    });
  });

  describe('with skipUserRegistration', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true, skipUserRegistration: true })
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should not write the registration nor the activation of an account, like JHipster Spring Boot', () => {
      result.assertNoFile([
        'server/src/auth/registration.service.ts',
        'server/src/auth/registration.controller.ts',
        'server/e2e/registration.e2e-spec.ts',
      ]);
      result.assertNoFileContent('server/src/auth/auth.module.ts', 'Registration');
      result.assertNoFileContent('server/src/mail/mail.service.ts', 'sendActivationEmail');
      result.assertNoFile('server/src/templates/mail/activationEmail.hbs');
    });

    it('should not remove the users not activated, with no scheduled task', () => {
      result.assertNoFileContent('server/src/app.module.ts', 'ScheduleModule');
      const { dependencies } = result.fs.readJSON(join(result.cwd, 'server/package.json'));
      expect(dependencies).not.toHaveProperty('@nestjs/schedule');
    });

    it('should keep the other mails and pages of an account', () => {
      result.assertFile(['server/src/templates/mail/creationEmail.hbs', 'server/src/templates/mail/passwordResetEmail.hbs']);
      result.assertFileContent('server/src/auth/account.controller.ts', "@Post('/account/reset-password/init')");
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

    it('should match the files snapshot', () => {
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
          // The watch scripts of JHipster run the server alone without a client.
          'backend:start': 'npm run start:server',
          watch: 'concurrently npm:backend:start',
        },
      });
      expect(result.fs.readJSON(join(result.cwd, 'package.json')).devDependencies).toHaveProperty('concurrently');
      result.assertNoFileContent('package.json', 'no client');
    });
  });
  describe('in a monorepository', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true })
        .withOptions({
          ignoreNeedlesError: true,
          monorepository: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should leave the prettier scripts to the root of the monorepository', () => {
      const { scripts } = result.fs.readJSON(join(result.cwd, 'package.json'));
      expect(scripts).not.toHaveProperty('prettier:check');
      expect(scripts).not.toHaveProperty('prettier:format');
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

  describe('with sqlite as the prod database', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ prodDatabaseType: 'sqlite', skipClient: true })
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should open a SQLite file, without a database server', () => {
      result.assertFileContent('server/src/config/application-prod.yml', /type: better-sqlite3\n.*\n {2}name: 'jhipster\.sqlite'/);
      // The database section, up to the next one: no host, port, username or password.
      const database = /^database:\n(?: {2}.*\n|\n)*/m.exec(result.fs.read(join(result.cwd, 'server/src/config/application-prod.yml')))[0];
      expect(database).not.toMatch(/^ {2}(host|port|username|password):/m);
      result.assertNoFileContent('server/src/config/application-secret-samples.yml', /^database:/m);
    });

    it('should declare better-sqlite3 as a dependency of the server, once', () => {
      const { dependencies, devDependencies } = result.fs.readJSON(join(result.cwd, 'server/package.json'));
      expect(dependencies).toHaveProperty('better-sqlite3');
      expect(devDependencies).not.toHaveProperty('better-sqlite3');
      result.assertFileContent('server/src/orm.config.ts', "'better-sqlite3': () => require('better-sqlite3')");
    });

    it('should build the native module of SQLite and keep the database in a folder of the node user in the image', () => {
      result.assertFileContent('Dockerfile', 'npm rebuild better-sqlite3');
      result.assertFileContent('Dockerfile', 'ENV DATABASE_NAME=/usr/src/app/data/jhipster.sqlite');
    });

    it('should not write the docker:db scripts of a database service', () => {
      const { scripts } = result.fs.readJSON(join(result.cwd, 'package.json'));
      expect(scripts['docker:db:up']).toMatch(/^echo /);
      expect(scripts).not.toHaveProperty('docker:db:down');
    });
  });

  for (const [devDatabaseType, sqliteDevDatabaseType, database] of [
    ['h2Disk', 'sqlite', '../tmp/db/sqlite-dev-db.sql'],
    ['h2Memory', 'sqliteMemory', ':memory:'],
  ]) {
    describe(`with devDatabaseType ${devDatabaseType}`, () => {
      beforeAll(async function () {
        await helpers
          .run(SUB_GENERATOR_NAMESPACE)
          .withJHipsterConfig({ devDatabaseType, skipClient: true })
          .withOptions({ ignoreNeedlesError: true })
          .withJHipsterGenerators()
          .withConfiguredBlueprint()
          .withBlueprintConfig({});
      });

      it(`should migrate it to ${sqliteDevDatabaseType}`, () => {
        result.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { devDatabaseType: sqliteDevDatabaseType } });
        result.assertFileContent('server/src/config/application-dev.yml', `name: '${database}'`);
      });
    });
  }

  for (const [config, refused] of [
    [{ searchEngine: 'elasticsearch' }, 'searchEngine elasticsearch'],
    [{ cacheProvider: 'redis' }, 'cacheProvider redis'],
    [{ websocket: 'spring-websocket' }, 'websocket spring-websocket'],
    [{ messageBroker: 'kafka' }, 'messageBroker kafka'],
    [{ authenticationType: 'session', applicationType: 'microservice' }, 'authenticationType session of a microservice'],
    [{ authenticationType: 'session', skipUserManagement: true }, 'authenticationType session with skipUserManagement'],
    [{ reactive: true }, 'reactive'],
  ]) {
    describe(`with ${refused}`, () => {
      it('should fail with an unsupported option error', async () => {
        await expect(
          helpers
            .run(SUB_GENERATOR_NAMESPACE)
            .withJHipsterConfig({ ...config, skipClient: true })
            .withOptions({ ignoreNeedlesError: true })
            .withJHipsterGenerators()
            .withConfiguredBlueprint()
            .withBlueprintConfig({}),
        ).rejects.toThrow(`The JHipster NodeJS blueprint does not support ${refused}`);
      });
    });
  }

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

    it('should match the files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should not generate built-in users by default (syncUserWithIdp disabled)', () => {
      result.assertFile(['server/src/auth/account.controller.ts', 'server/src/management/management.controller.ts']);
      result.assertNoFile([
        'server/src/users/user.entity.ts',
        'server/src/users/authority.entity.ts',
        'server/src/users/user.module.ts',
        'server/src/users/user.controller.ts',
        'server/src/users/public.user.controller.ts',
        'server/src/migrations/1570200490072-SeedUsersRoles.ts',
      ]);
      result.assertFileContent('server/src/management/management.module.ts', 'ManagementController');
      result.assertNoFileContent('server/src/auth/auth.module.ts', 'ManagementController');
    });
  });
  describe('with session', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({
          authenticationType: 'session',
          skipClient: true,
        })
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should generate the session login and the user management, without JWT nor OAuth2', () => {
      result.assertFile([
        'server/src/auth/user.session.controller.ts',
        'server/src/auth/csrf.middleware.ts',
        'server/src/auth/password.service.ts',
        'server/src/users/user.controller.ts',
        'server/e2e/session.e2e-spec.ts',
        'server/src/auth/session.entity.ts',
        'server/src/auth/session.store.ts',
        'server/src/migrations/1570200270082-CreateSessions.ts',
        'server/src/auth/persistent-token.entity.ts',
        'server/src/auth/remember-me.service.ts',
        'server/src/migrations/1570200270083-CreatePersistentTokens.ts',
      ]);
      result.assertNoFile([
        'server/src/auth/user.jwt.controller.ts',
        'server/src/auth/passport.jwt.strategy.ts',
        'server/src/auth/user.oauth2.controller.ts',
      ]);
      result.assertJsonFileContent('server/package.json', { dependencies: { 'express-session': /./, bcrypt: /./ } });
      result.assertNoJsonFileContent('server/package.json', { dependencies: { '@nestjs/jwt': /./ } });
      result.assertFileContent('server/src/auth/password.service.ts', 'jhipster.security.authentication.hash-salt-or-rounds');
      result.assertFileContent('server/src/config/application-secret-samples.yml', /session:\n\s+secret:/);
    });
  });
  describe('with skipUserManagement', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({
          skipUserManagement: true,
          skipClient: true,
        })
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should not depend on bcrypt, which only the passwords of the user management use', () => {
      result.assertNoFile(['server/src/auth/password.service.ts', 'server/src/auth/password-util.ts']);
      result.assertNoJsonFileContent('server/package.json', { dependencies: { bcrypt: /./ } });
      result.assertNoJsonFileContent('server/package.json', { devDependencies: { '@types/bcrypt': /./ } });
    });
  });
  describe('microservice with eureka', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({
          applicationType: 'microservice',
          authenticationType: 'jwt',
          serviceDiscoveryType: 'eureka',
          skipClient: true,
        })
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should register in the Eureka server of the defaultZone once the application listens', () => {
      result.assertFileContent(
        'server/src/registry/eureka.service.ts',
        "this.configService.get('eureka.client.service-url.defaultZone', { infer: true })",
      );
      result.assertFileContent('server/src/registry/eureka.service.ts', 'beforeApplicationShutdown');
      result.assertFileContent('server/src/app.module.ts', 'EurekaService,');
      result.assertFileContent('server/src/main.ts', /await app\.listen\(port\);[\s\S]*app\.get\(EurekaService\)\.register/);
      result.assertNoFileContent('server/src/main.ts', 'registerAsEurekaService');
    });
  });

  describe('microservice with consul', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({
          applicationType: 'microservice',
          authenticationType: 'jwt',
          serviceDiscoveryType: 'consul',
          skipClient: true,
        })
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should register in Consul with the health check of the application once it listens', () => {
      result.assertFileContent('server/src/registry/consul.service.ts', "discovery['health-check-path']");
      result.assertFileContent('server/src/registry/consul.service.ts', 'beforeApplicationShutdown');
      result.assertFileContent('server/src/app.module.ts', 'ConsulService,');
      result.assertFileContent('server/src/main.ts', /await app\.listen\(port\);[\s\S]*app\.get\(ConsulService\)\.register/);
      expect(result.fs.readJSON(join(result.cwd, 'server/package.json')).dependencies).toHaveProperty('consul');
      result.assertNoFile('server/src/registry/eureka.service.ts');
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

    it('should match the files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should only validate the tokens, without users, authentication API nor account API', () => {
      result.assertFile(['server/src/auth/passport.jwt.strategy.ts']);
      result.assertNoFile([
        'server/src/auth/account.controller.ts',
        'server/src/users/user.entity.ts',
        'server/src/users/user.service.ts',
        'server/src/auth/user.jwt.controller.ts',
        'server/src/auth/password-util.ts',
        'server/src/auth/dto/user-login.dto.ts',
        'server/src/auth/dto/password-change.dto.ts',
      ]);
      result.assertNoFileContent('server/src/auth/passport.jwt.strategy.ts', 'AuthService');
    });
  });

  describe('microservice with a microfrontend', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({
          applicationType: 'microservice',
          baseName: 'notes',
          clientFramework: 'angular',
          microfrontend: true,
        })
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should wait for the microservice through its gateway, like JHipster Spring Boot', () => {
      expect(result.fs.readJSON(join(result.cwd, 'package.json')).scripts['ci:server:await']).toContain(
        'wait-on -t 180000 http-get://127.0.0.1:8080/services/notes/management/health/readiness ',
      );
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

    it('should match the files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should generate the users of the identity provider without the users administration', () => {
      result.assertFile([
        'server/src/users/user.entity.ts',
        'server/src/users/authority.entity.ts',
        'server/src/users/public.user.controller.ts',
        'server/src/migrations/1570200490072-SeedUsersRoles.ts',
      ]);
      result.assertNoFile(['server/src/users/user.controller.ts', 'server/e2e/user.e2e-spec.ts']);
      result.assertNoFileContent('server/src/users/user.module.ts', /\bUserController\b/);
    });
  });
  describe('with the authorities of the entities', () => {
    const entities = [
      {
        name: 'Report',
        changelogDate: '20240101000001',
        entityAuthority: 'ROLE_MANAGER',
        entityReadAuthority: 'ROLE_USER',
        fields: [{ fieldName: 'title', fieldType: 'String' }],
      },
      { name: 'Note', changelogDate: '20240101000002', fields: [{ fieldName: 'title', fieldType: 'String' }] },
    ];

    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true }, entities)
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should prepare the roles of the endpoints, like the @PreAuthorize of JHipster Spring Boot', () => {
      expect(result.entities.Report).toMatchObject({
        nodejsWriteRoles: "'ROLE_MANAGER'",
        nodejsReadRoles: "'ROLE_MANAGER', 'ROLE_USER'",
        nodejsReadOnlyRoles: "'ROLE_USER'",
      });
      expect(result.entities.Note).toMatchObject({ nodejsWriteRoles: undefined, nodejsReadRoles: undefined });
      // The built-in Authority is an admin entity.
      expect(result.entities.Authority).toMatchObject({ nodejsWriteRoles: "'ROLE_ADMIN'", nodejsReadOnlyRoles: undefined });
    });
  });

  describe.each([
    ['angular', false],
    ['react', false],
    ['vue', false],
    ['no', true],
  ])('with the client %s', (clientFramework, skipClient) => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ clientFramework })
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should give the built-in Authority the screens of a client of JHipster, which its user management uses', () => {
      expect(result.entities.Authority.skipClient).toBe(skipClient);
    });
  });

  describe('with many relationships to an entity of a unique field', () => {
    // JHipster keeps the unique values of a field for the whole generation: the relationship tests draw their own.
    const owner = {
      name: 'Owner',
      changelogDate: '20240101000000',
      fields: [{ fieldName: 'name', fieldType: 'String', fieldValidateRules: ['required', 'unique'] }],
    };
    const related = Array.from({ length: 7 }, (_, index) => ({
      name: `Item${index}`,
      changelogDate: `2024010100000${index + 1}`,
      fields: [{ fieldName: 'title', fieldType: 'String' }],
      relationships: [{ relationshipName: 'owner', otherEntityName: 'owner', relationshipType: 'many-to-one', otherEntityField: 'name' }],
    }));

    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true }, [owner, ...related])
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should give the related record of every relationship test its own value of the unique field', () => {
      const names = related.map(({ name }) => {
        const [owner] = result.entities[name].relationships;
        expect(owner.nodejsRelatedValues).toMatchObject({ name: expect.any(String) });
        return owner.nodejsRelatedValues.name;
      });
      expect(new Set(names).size).toBe(related.length);
    });
  });

  describe('with required relationships to an entity of a unique field', () => {
    const owner = {
      name: 'Owner',
      changelogDate: '20240101000000',
      fields: [{ fieldName: 'name', fieldType: 'String', fieldValidateRules: ['required', 'unique'] }],
    };
    const related = Array.from({ length: 3 }, (_, index) => ({
      name: `Item${index}`,
      changelogDate: `2024010100000${index + 1}`,
      fields: [{ fieldName: 'title', fieldType: 'String' }],
      relationships: [
        {
          relationshipName: 'owner',
          otherEntityName: 'owner',
          relationshipType: 'many-to-one',
          otherEntityField: 'name',
          relationshipValidateRules: ['required'],
        },
      ],
    }));

    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true }, [owner, ...related])
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should write the sample of the entity, with its unique field', () => {
      result.assertFileContent(
        'server/e2e/samples/owner.test-samples.ts',
        /export const sampleWithNewData: Record<string, any> = \{"name":"[^"]+"/,
      );
    });

    it('should reference the sample of the owner stored once from the samples of the other entities', () => {
      for (const { name } of related) {
        const samples = `server/e2e/samples/item-${name.slice(-1)}.test-samples.ts`;
        result.assertFileContent(samples, "import * as ownerSamples from './owner.test-samples.ts';");
        result.assertFileContent(samples, 'owner: { id: (await ownerSamples.storedSample(app)).id },');
      }
    });

    it('should send the references of the required relationships from the database tests', () => {
      result.assertFileContent(
        'server/e2e/item-0.database.e2e-spec.ts',
        "import * as item0Samples from './samples/item-0.test-samples.ts';",
      );
      result.assertFileContent(
        'server/e2e/item-0.database.e2e-spec.ts',
        '.send({ ...createdValues, ...(await item0Samples.requiredReferences(app)) })',
      );
    });
  });
  describe('with filter, like the jpaMetamodelFiltering of JHipster Spring Boot', () => {
    const country = {
      name: 'Country',
      changelogDate: '20240101000000',
      jpaMetamodelFiltering: true,
      fields: [{ fieldName: 'name', fieldType: 'String' }],
    };
    const region = {
      name: 'Region',
      changelogDate: '20240101000001',
      jpaMetamodelFiltering: true,
      fields: [
        { fieldName: 'name', fieldType: 'String' },
        { fieldName: 'population', fieldType: 'Long' },
        { fieldName: 'founded', fieldType: 'Instant' },
        { fieldName: 'coastal', fieldType: 'Boolean' },
        { fieldName: 'code', fieldType: 'UUID' },
        { fieldName: 'area', fieldType: 'Float' },
        { fieldName: 'flag', fieldType: 'byte[]', fieldTypeBlobContent: 'image' },
      ],
      relationships: [
        { relationshipName: 'country', otherEntityName: 'country', relationshipType: 'many-to-one' },
        { relationshipName: 'neighbour', otherEntityName: 'country', relationshipType: 'many-to-many' },
      ],
    };
    const city = { name: 'City', changelogDate: '20240101000002', fields: [{ fieldName: 'name', fieldType: 'String' }] };

    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true }, [country, region, city])
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should write the criteria shared by the entities', () => {
      result.assertFile(['server/src/common/database/criteria.ts', 'server/src/common/database/criteria.spec.ts']);
    });

    it('should declare the properties of the criteria on the entity by their kind, a relationship to one by the id of the related record', () => {
      const entity = 'server/src/entities/region/region.entity.ts';
      result.assertFileContent(entity, "import { Filterable } from '../../common/database/criteria.ts';");
      result.assertFileContent(entity, /@Filterable\(\{ kind: 'range', type: 'number' \}\)\n\s+id\?: number;/);
      result.assertFileContent(entity, /@Filterable\(\{ kind: 'string', type: 'string' \}\)\n\s+name\?: string;/);
      result.assertFileContent(entity, /@Filterable\(\{ kind: 'range', type: 'number' \}\)\n\s+population\?: number;/);
      result.assertFileContent(entity, /@Filterable\(\{ kind: 'range', type: 'date' \}\)\n\s+founded\?: Date;/);
      result.assertFileContent(entity, /@Filterable\(\{ kind: 'equality', type: 'boolean' \}\)\n\s+coastal\?: boolean;/);
      // A UUID, which the lists of JHipster do not sort by.
      result.assertFileContent(entity, /@Filterable\(\{ kind: 'equality', type: 'uuid' \}\)\n\s+@NotSortable\(\)\n\s+code\?: string;/);
      result.assertFileContent(entity, /@Filterable\(\{ kind: 'range', type: 'number' \}\)\n\s+country\?: Relation<Country>;/);
      // Like JHipster Spring Boot, no filter of a binary blob; the relationships to many records are left out.
      result.assertNoFileContent(entity, /@Filterable\([^)]*\)\n\s+flag\?/);
      result.assertNoFileContent(entity, /@Filterable\([^)]*\)\n\s+neighbours\?/);
    });

    it('should filter the list and count the records of the criteria', () => {
      const controller = 'server/src/entities/region/region.controller.ts';
      result.assertFileContent(controller, 'where: criteriaWhere(req.query, criteriaOf(this.regionService.metadata)),');
      result.assertFileContent(controller, "@Get('/count')");
      result.assertFileContent(
        'server/src/entities/region/region.service.ts',
        'async count(options: FindManyOptions<Region>): Promise<number> {',
      );
    });

    it('should test the criteria of every property on the database', () => {
      result.assertFileContent('server/e2e/region.database.e2e-spec.ts', '"name": "countryId",');
      result.assertFileContent('server/e2e/region.database.e2e-spec.ts', '"approximate": true');
    });

    it('should not filter the lists of an entity without filter', () => {
      result.assertNoFileContent('server/src/entities/city/city.controller.ts', 'criteriaWhere');
      result.assertNoFileContent('server/src/entities/city/city.entity.ts', 'Filterable');
      result.assertNoFileContent('server/src/entities/city/city.controller.ts', "@Get('/count')");
    });
  });

  describe('with the @NotSortable annotation of the JDL, like JHipster Spring Boot', () => {
    const country = { name: 'Country', changelogDate: '20240101000000', fields: [{ fieldName: 'name', fieldType: 'String' }] };
    const region = {
      name: 'Region',
      changelogDate: '20240101000001',
      fields: [
        { fieldName: 'name', fieldType: 'String' },
        { fieldName: 'secret', fieldType: 'String', options: { notSortable: true } },
        { fieldName: 'flag', fieldType: 'byte[]', fieldTypeBlobContent: 'image' },
        { fieldName: 'description', fieldType: 'TextBlob' },
        { fieldName: 'code', fieldType: 'UUID' },
      ],
      relationships: [
        { relationshipName: 'country', otherEntityName: 'country', relationshipType: 'many-to-one' },
        { relationshipName: 'capital', otherEntityName: 'country', relationshipType: 'one-to-one', options: { notSortable: true } },
      ],
    };

    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true }, [country, region])
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should mark @NotSortable what the lists of JHipster do not sort by (fieldSupportsSortBy) and the relationships the JDL marks', () => {
      const entity = 'server/src/entities/region/region.entity.ts';
      result.assertFileContent(entity, "import { NotSortable } from '../../common/sortable-properties.ts';");
      result.assertFileContent(entity, /@NotSortable\(\)\n\s+secret\?: string;/);
      result.assertFileContent(entity, /@NotSortable\(\)\n\s+flag\?: /);
      result.assertFileContent(entity, /@NotSortable\(\)\n\s+code\?: string;/);
      result.assertFileContent(entity, /@NotSortable\(\)\n\s+capital\?: Relation<Country>;/);
      // A TextBlob is a text, and the relationship the JDL does not mark stays sortable.
      result.assertNoFileContent(entity, /@NotSortable\(\)\n\s+description\?/);
      result.assertNoFileContent(entity, /@NotSortable\(\)\n\s+country\?/);
    });

    it('should not mark an entity without what cannot be sorted by', () => {
      result.assertNoFileContent('server/src/entities/country/country.entity.ts', 'NotSortable');
    });

    it('should test the sort by a relationship the JDL does not mark', () => {
      result.assertFileContent('server/e2e/region.e2e-spec.ts', '/api/regions?sort=country.name,desc');
    });
  });

  describe('with filter on MongoDB', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true, databaseType: 'mongodb' }, [
          {
            name: 'Note',
            changelogDate: '20240101000000',
            jpaMetamodelFiltering: true,
            fields: [{ fieldName: 'title', fieldType: 'String' }],
          },
        ])
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should not filter the lists, like JHipster Spring Boot needing a SQL database', () => {
      result.assertNoFile('server/src/common/database/criteria.ts');
      result.assertNoFileContent('server/src/entities/note/note.controller.ts', 'criteriaWhere');
      result.assertJsonFileContent('.jhipster/Note.json', { jpaMetamodelFiltering: false });
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
        { fieldName: 'genre', fieldType: 'Genre', fieldValues: 'NOVEL,ESSAY' },
        { fieldName: 'format', fieldType: 'BookFormat', fieldValues: 'PAPER,EBOOK', fieldValidateRules: ['required'] },
        { fieldName: 'cover', fieldType: 'byte[]', fieldTypeBlobContent: 'image', fieldValidateRules: ['required'] },
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
      result.assertFileContent('server/src/entities/book/dto/book.dto.ts', String.raw`@Matches("^(?:^\\d{3}-[0-9]{6}$)$")`);
      result.assertNoFileContent('server/src/entities/book/dto/book.dto.ts', 'undefined');
    });

    it('should validate a required blob, so the whitelist of the ValidationPipe keeps it', () => {
      result.assertFileContent('server/src/entities/book/dto/book.dto.ts', /@IsNotEmpty\(\)\s+@ApiProperty\([^)]*\)\s+cover!/);
    });

    it('should refuse a value out of an enum, like the JSON deserialization of Spring Boot', () => {
      result.assertFileContent('server/src/entities/book/dto/book.dto.ts', /@IsOptional\(\)\s+@IsEnum\(Genre\)/);
      result.assertFileContent('server/src/entities/book/dto/book.dto.ts', /@IsNotEmpty\(\)\s+@IsEnum\(BookFormat\)/);
      result.assertFileContent('server/e2e/book.e2e-spec.ts', "genre: 'NOT_A_GENRE'");
      result.assertFileContent('server/src/entities/book/book.entity.ts', 'enum: Genre, nullable: true })');
      result.assertFileContent('server/src/entities/book/book.entity.ts', 'enum: BookFormat })');
    });

    it('should accept a missing value of an optional validated field', () => {
      expect(result.getSnapshot('**/book.dto.ts')).toMatchSnapshot();
    });
  });

  describe('with a built-in entity of a blueprint, like the layers of JHipster', () => {
    const screen = {
      name: 'Screen',
      builtIn: true,
      changelogDate: '20240101000000',
      fields: [{ fieldName: 'title', fieldType: 'String' }],
    };
    const panel = {
      name: 'Panel',
      builtIn: true,
      changelogDate: '20240101000001',
      entityRestLayer: false,
      fields: [{ fieldName: 'title', fieldType: 'String' }],
    };

    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true }, [screen, panel])
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should write a built-in entity without layers declared like an entity of the JDL, in its feature module', () => {
      result.assertFile([
        'server/src/entities/screen/screen.entity.ts',
        'server/src/entities/screen/screen.service.ts',
        'server/src/entities/screen/screen.controller.ts',
        'server/e2e/screen.e2e-spec.ts',
        'server/e2e/screen.database.e2e-spec.ts',
      ]);
      result.assertFileContent('server/src/app.module.ts', 'ScreenModule');
    });

    it('should write the REST layer only with entityRestLayer', () => {
      result.assertFile(['server/src/entities/panel/panel.entity.ts', 'server/src/entities/panel/panel.service.ts']);
      result.assertNoFile(['server/src/entities/panel/panel.controller.ts', 'server/e2e/panel.e2e-spec.ts']);
      result.assertNoFileContent('server/src/entities/panel/panel.module.ts', 'PanelController');
    });

    it('should keep the files of User and Authority in the users module', () => {
      result.assertFile(['server/src/users/user.entity.ts', 'server/src/users/authority.entity.ts']);
      result.assertNoFile(['server/src/entities/user/user.entity.ts', 'server/src/entities/authority/authority.entity.ts']);
    });
  });

  describe('with a relationship to the built-in Authority', () => {
    const book = {
      name: 'Book',
      changelogDate: '20240101000000',
      fields: [{ fieldName: 'title', fieldType: 'String' }],
      relationships: [
        { relationshipName: 'authority', otherEntityName: 'authority', relationshipType: 'many-to-many', otherEntityField: 'name' },
      ],
    };

    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true }, [book])
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should store an authority of the test in the relationship test', () => {
      result.assertFileContent('server/e2e/book.database.e2e-spec.ts', 'ROLE_BOOK_AUTHORIT');
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
      'server/src/module/auth.module.ts',
      'server/src/security/index.ts',
      'server/.env',
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
        result.assertFile(['server/src/users/user.entity.ts', 'server/src/users/authority.entity.ts']);
      });

      it('should remove the users administration', () => {
        result.assertNoFile([
          'server/src/web/rest/user.controller.ts',
          'server/src/users/user.controller.ts',
          'server/e2e/user.e2e-spec.ts',
        ]);
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

      it('should move the files of 4.2.0 to the feature modules', () => {
        result.assertNoFile(['server/src/module/auth.module.ts', 'server/src/security/index.ts']);
        result.assertFile(['server/src/auth/auth.module.ts', 'server/src/auth/index.ts']);
      });
    });

    describe('generated with 4.3.0', () => {
      beforeAll(async function () {
        await helpers
          .run(SUB_GENERATOR_NAMESPACE)
          .doInDir(writeExistingProject({ syncUserWithIdp: false }, '4.3.0'))
          .withOptions({ ignoreNeedlesError: true })
          .withJHipsterGenerators()
          .withConfiguredBlueprint();
      });

      it('should keep the files at the paths of 4.2.0, moved before 4.3.0', () => {
        result.assertFile([
          'server/src/client/request.ts',
          'server/src/module/auth.module.ts',
          'server/src/security/index.ts',
          'server/.env',
        ]);
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

  describe('regenerated with changed entities', () => {
    const migrationsDir = 'server/src/migrations';
    // The entities of the former generation.
    const previousEntities = [
      {
        name: 'Customer',
        changelogDate: '20200101000100',
        fields: [
          { fieldName: 'original', fieldType: 'String' },
          { fieldName: 'legacy', fieldType: 'String' },
          { fieldName: 'photo', fieldType: 'ImageBlob' },
        ],
        relationships: [],
      },
      {
        name: 'Purchase',
        changelogDate: '20200101000200',
        fields: [{ fieldName: 'total', fieldType: 'Integer' }],
        relationships: [
          { relationshipName: 'customer', otherEntityName: 'customer', relationshipType: 'many-to-one', relationshipSide: 'left' },
          { relationshipName: 'seller', otherEntityName: 'customer', relationshipType: 'many-to-one', relationshipSide: 'left' },
          { relationshipName: 'gifts', otherEntityName: 'customer', relationshipType: 'many-to-many', relationshipSide: 'left' },
        ],
      },
    ];
    // The migrations of the former generation, named by the date of their changelog, and their classes.
    const previousMigrations = {
      '20200101000100-AddedEntityCustomer.ts': 'AddedEntityCustomer1577836860000',
      '20200101000200-AddedEntityPurchase.ts': 'AddedEntityPurchase1577836920000',
      '20200101000200-AddedEntityConstraintsPurchase.ts': 'AddedEntityConstraintsPurchase4577836920000',
    };
    // The entities of the regeneration: a field added and two removed, relationships added and removed, a new entity.
    const entities = [
      {
        ...previousEntities[0],
        fields: [
          { fieldName: 'original', fieldType: 'String' },
          { fieldName: 'status', fieldType: 'String', fieldValidateRules: ['maxlength'], fieldValidateRulesMaxlength: 20 },
        ],
      },
      {
        ...previousEntities[1],
        relationships: [
          { relationshipName: 'customer', otherEntityName: 'customer', relationshipType: 'many-to-one', relationshipSide: 'left' },
          { relationshipName: 'products', otherEntityName: 'product', relationshipType: 'many-to-many', relationshipSide: 'left' },
          { relationshipName: 'voucher', otherEntityName: 'product', relationshipType: 'one-to-one', relationshipSide: 'left' },
        ],
      },
      { name: 'Product', changelogDate: '20200103000000', fields: [{ fieldName: 'title', fieldType: 'String' }] },
    ];
    let previousFiles;
    // The objects of the .yo-rc.json of the former generation, its changelogs.
    let previousObjects;

    /** The class of a migration, the timestamp TypeORM runs it at ending its name. */
    const classOf = file =>
      /export class (\w+) implements/.exec(result.fs.read(join(result.cwd, file.replace(/^.*?server\//, 'server/'))))[1];
    const timestampOf = file => Number(/(\d{13})$/.exec(classOf(file))[1]);

    /** The migration of a change, of the regeneration, by its kind and its entity. */
    const updatedMigration = name => {
      const files = Object.keys(result.getSnapshot(`**/${migrationsDir}/*-${name}.ts`));
      expect(files).toHaveLength(1);
      return files[0];
    };

    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true }, previousEntities)
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
      previousFiles = Object.fromEntries(
        Object.keys(previousMigrations).map(file => [file, result.fs.read(join(result.cwd, migrationsDir, file))]),
      );
      previousObjects = result.fs.readJSON(join(result.cwd, '.yo-rc.json')).objects;
      await result
        .create(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true, entities: entities.map(entity => entity.name) })
        // The entity files replaced, like a JDL replaces them: a JSON object would be merged with the former ones.
        .withFiles(Object.fromEntries(entities.map(entity => [`.jhipster/${entity.name}.json`, JSON.stringify(entity)])))
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .run();
    });

    it('should keep the migrations of the former generation, a database may have run them', () => {
      for (const [file, content] of Object.entries(previousFiles)) {
        expect(result.fs.read(join(result.cwd, migrationsDir, file))).toBe(content);
      }
      expect(Object.keys(result.getSnapshot(`**/${migrationsDir}/*-AddedEntity{,Constraints}{Customer,Purchase}.ts`))).toEqual([]);
    });

    it('should write the migrations of the changelogs JHipster records, at their date', () => {
      const { objects } = result.fs.readJSON(join(result.cwd, '.yo-rc.json'));
      const update = name => Object.values(objects).find(object => object.entityName === name && object.operation === 'update');
      expect(update('Customer')).toMatchObject({ addedFields: ['status'], removedFields: ['legacy', 'photo'] });
      const { changelogDate } = update('Customer');
      expect(updatedMigration('UpdatedEntityCustomer')).toMatch(new RegExp(`/${changelogDate}-UpdatedEntityCustomer\\.ts$`));
      expect(timestampOf(updatedMigration('UpdatedEntityCustomer'))).toBe(
        Date.parse(changelogDate.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$1-$2-$3T$4:$5:$6Z')) + 6 * 10 ** 12,
      );
      expect(classOf(updatedMigration('UpdatedEntityConstraintsPurchase'))).toMatch(/^UpdatedEntityConstraintsPurchase\d{12}1$/);
    });

    it('should add the migrations of a new entity', () => {
      result.assertFile([join(migrationsDir, '20200103000000-AddedEntityProduct.ts')]);
      expect(classOf(join(migrationsDir, '20200103000000-AddedEntityProduct.ts'))).toBe('AddedEntityProduct1578009600000');
    });

    it('should add the columns of the added fields and drop the ones of the removed fields, like the updated_entity changelog', () => {
      const file = updatedMigration('UpdatedEntityCustomer');
      result.assertFileContent(
        file,
        "await addColumns(queryRunner, 'customer', [\n      { name: 'status', type: String, length: 20, nullable: true },\n    ]);",
      );
      result.assertFileContent(file, "await dropColumns(queryRunner, 'customer', ['legacy', 'photo', 'photo_content_type']);");
      result.assertFileContent(file, "await dropColumns(queryRunner, 'customer', ['status']);");
    });

    it('should change the join columns and the join tables of the relationships, like the updated_entity_constraints changelog', () => {
      const file = updatedMigration('UpdatedEntityConstraintsPurchase');
      result.assertFileContent(file, "await queryRunner.dropTable('rel_purchase__gifts', true);");
      result.assertFileContent(file, "await dropColumns(queryRunner, 'purchase', ['sellerId']);");
      result.assertFileContent(file, "{ name: 'voucherId', type: Number, nullable: true },");
      result.assertFileContent(file, "{ relationUniques: ['voucherId'] },");
      result.assertFileContent(file, "{ columnName: 'voucherId', referencedTableName: 'product', referencedColumnName: 'id' },");
      result.assertFileContent(file, "await createJoinTable(\n      queryRunner,\n      'rel_purchase__products',");
      result.assertNoFileContent(file, 'customerId');
      expect(Object.keys(result.getSnapshot(`**/${migrationsDir}/*-UpdatedEntityPurchase.ts`))).toEqual([]);
    });

    it('should run the migrations of the changes after the constraints of every entity', () => {
      for (const name of ['UpdatedEntityCustomer', 'UpdatedEntityConstraintsPurchase']) {
        expect(timestampOf(updatedMigration(name))).toBeGreaterThan(7 * 10 ** 12);
      }
    });

    it('should run the migrations kept and the ones of the changes', () => {
      const ormConfig = result.fs.read(join(result.cwd, 'server/src/orm.config.ts'));
      for (const file of [
        ...Object.keys(previousMigrations),
        updatedMigration('UpdatedEntityCustomer'),
        updatedMigration('UpdatedEntityConstraintsPurchase'),
        '20200103000000-AddedEntityProduct.ts',
      ]) {
        const fileName = basename(file, '.ts');
        expect(ormConfig).toContain(`import { ${classOf(join(migrationsDir, `${fileName}.ts`))} } from './migrations/${fileName}.ts';`);
      }
    });

    it('should record the migrations of each changelog in its object', () => {
      const { objects } = result.fs.readJSON(join(result.cwd, '.yo-rc.json'));
      expect(objects['20200101000200_Purchase'].nodejsMigrations).toEqual([
        '20200101000200-AddedEntityPurchase',
        '20200101000200-AddedEntityConstraintsPurchase',
      ]);
      const update = Object.values(objects).find(object => object.entityName === 'Customer' && object.operation === 'update');
      expect(update.nodejsMigrations).toEqual([updatedMigration('UpdatedEntityCustomer').replace(/^.*\/(.*)\.ts$/, '$1')]);
    });

    describe('from the configuration of the project only, without its migrations', () => {
      beforeAll(async function () {
        await helpers
          .run(SUB_GENERATOR_NAMESPACE)
          .withJHipsterConfig({ skipClient: true, entities: entities.map(entity => entity.name) })
          .withYoRcConfig('objects', previousObjects)
          .withFiles(Object.fromEntries(entities.map(entity => [`.jhipster/${entity.name}.json`, JSON.stringify(entity)])))
          .withOptions({ ignoreNeedlesError: true })
          .withJHipsterGenerators()
          .withConfiguredBlueprint();
      });

      it('should run the migrations of the former changelogs, the ones they record, without writing them', () => {
        const ormConfig = result.fs.read(join(result.cwd, 'server/src/orm.config.ts'));
        for (const [file, className] of Object.entries(previousMigrations)) {
          expect(ormConfig).toContain(`import { ${className} } from './migrations/${file}';`);
        }
        expect(Object.keys(result.getSnapshot(`**/${migrationsDir}/*-AddedEntity{,Constraints}{Customer,Purchase}.ts`))).toEqual([]);
        expect(Object.keys(result.getSnapshot(`**/${migrationsDir}/*-UpdatedEntityCustomer.ts`))).toHaveLength(1);
      });
    });
  });

  describe('regenerated with an entity removed', () => {
    const migrationsDir = 'server/src/migrations';
    const product = { name: 'Product', changelogDate: '20200103000000', fields: [{ fieldName: 'title', fieldType: 'String' }] };
    const purchase = {
      name: 'Purchase',
      changelogDate: '20200101000200',
      fields: [{ fieldName: 'total', fieldType: 'Integer' }],
      relationships: [
        { relationshipName: 'products', otherEntityName: 'product', relationshipType: 'many-to-many', relationshipSide: 'left' },
        { relationshipName: 'voucher', otherEntityName: 'product', relationshipType: 'one-to-one', relationshipSide: 'left' },
      ],
    };
    // The regeneration without Product, nor the relationships of Purchase referencing it.
    const entities = [{ ...purchase, relationships: [] }];

    /** The migration of the regeneration, by its kind and its entity. */
    const migrationFile = name => {
      const files = Object.keys(result.getSnapshot(`**/${migrationsDir}/*-${name}.ts`));
      expect(files).toHaveLength(1);
      return files[0];
    };
    const classOf = file =>
      /export class (\w+) implements/.exec(result.fs.read(join(result.cwd, file.replace(/^.*?server\//, 'server/'))))[1];
    const timestampOf = file => Number(/(\d{13})$/.exec(classOf(file))[1]);

    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true }, [purchase, product])
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
      // The entity removed from the project: its entity file and its name in the .yo-rc.json, which the regeneration reads.
      result.fs.delete(join(result.cwd, '.jhipster/Product.json'));
      const yoRc = result.fs.readJSON(join(result.cwd, '.yo-rc.json'));
      result.fs.writeJSON(join(result.cwd, '.yo-rc.json'), {
        ...yoRc,
        'generator-jhipster': { ...yoRc['generator-jhipster'], entities: entities.map(entity => entity.name) },
      });
      await result
        .create(SUB_GENERATOR_NAMESPACE)
        .withFiles(Object.fromEntries(entities.map(entity => [`.jhipster/${entity.name}.json`, JSON.stringify(entity)])))
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .run();
    });

    it('should drop the table of the removed entity, like the dropTable of Liquibase', () => {
      const file = migrationFile('RemovedEntityProduct');
      result.assertFileContent(file, "await queryRunner.dropTable('product', true);");
      result.assertNoFileContent(file, 'rel_');
    });

    it('should drop the join columns and the join tables referencing it first, in the update of the entities that had them', () => {
      const file = migrationFile('UpdatedEntityConstraintsPurchase');
      result.assertFileContent(file, "await queryRunner.dropTable('rel_purchase__products', true);");
      result.assertFileContent(file, "await dropColumns(queryRunner, 'purchase', ['voucherId']);");
      // Nothing to undo: the join columns and the join tables dropped are not restored.
      result.assertFileContent(file, 'public async down(_queryRunner: QueryRunner): Promise<void> {');
      expect(timestampOf(migrationFile('RemovedEntityProduct'))).toBeGreaterThan(timestampOf(file));
    });

    it('should keep running the migrations of the removed entity, which created its table, and the one dropping it', () => {
      const ormConfig = result.fs.read(join(result.cwd, 'server/src/orm.config.ts'));
      expect(ormConfig).toContain("import { AddedEntityProduct1578009600000 } from './migrations/20200103000000-AddedEntityProduct.ts';");
      const fileName = basename(migrationFile('RemovedEntityProduct'), '.ts');
      expect(ormConfig).toContain(`import { ${classOf(migrationFile('RemovedEntityProduct'))} } from './migrations/${fileName}.ts';`);
    });
  });

  describe('with entities on the disk without changelogs', () => {
    const migrationsDir = 'server/src/migrations';
    const customer = { name: 'Customer', changelogDate: '20200101000100', fields: [{ fieldName: 'name', fieldType: 'String' }] };
    const order = {
      name: 'Order',
      changelogDate: '20200101000200',
      fields: [{ fieldName: 'total', fieldType: 'Integer' }],
      relationships: [
        { relationshipName: 'customer', otherEntityName: 'customer', relationshipType: 'many-to-one', relationshipSide: 'left' },
      ],
    };

    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({ skipClient: true }, [customer, order])
        // A migration named by its timestamp, like up to 0.0.2 of the blueprint.
        .withFiles({ [join(migrationsDir, '1577836860000-AddedEntityCustomer.ts')]: 'export class AddedEntityCustomer1577836860000 {}\n' })
        // The entity files on the disk, like a project generated before JHipster recorded its changelogs.
        .commitFiles()
        .withOptions({ ignoreNeedlesError: true })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should write the migrations of the creation of the entities, their last changelog, and record them', () => {
      result.assertFile([
        join(migrationsDir, '20200101000100-AddedEntityCustomer.ts'),
        join(migrationsDir, '20200101000200-AddedEntityOrder.ts'),
        join(migrationsDir, '20200101000200-AddedEntityConstraintsOrder.ts'),
      ]);
      const { objects } = result.fs.readJSON(join(result.cwd, '.yo-rc.json'));
      expect(objects['20200101000200_Order'].nodejsMigrations).toEqual([
        '20200101000200-AddedEntityOrder',
        '20200101000200-AddedEntityConstraintsOrder',
      ]);
      const ormConfig = result.fs.read(join(result.cwd, 'server/src/orm.config.ts'));
      expect(ormConfig).toContain("import { AddedEntityCustomer1577836860000 } from './migrations/20200101000100-AddedEntityCustomer.ts';");
    });

    it('should remove the file of a migration generated again named by its timestamp, like up to 0.0.2 of the blueprint', () => {
      result.assertNoFile(join(migrationsDir, '1577836860000-AddedEntityCustomer.ts'));
    });

    it('should write the imports of orm.config.ts sorted by path, like the eslint transform of JHipster', () => {
      const ormConfig = result.fs.read(join(result.cwd, 'server/src/orm.config.ts'));
      const paths = [...ormConfig.matchAll(/^import .+ from '(\.\/[^']+)';$/gm)].map(([, path]) => path);
      expect(paths).toEqual(paths.toSorted(compareModulePaths));
      expect(paths).toContain('./entities/order/order.entity.ts');
    });

    describe('regenerated without a change', () => {
      let previous;

      beforeAll(async function () {
        previous = result.fs.read(join(result.cwd, migrationsDir, '20200101000200-AddedEntityConstraintsOrder.ts'));
        await result
          .create(SUB_GENERATOR_NAMESPACE)
          .withOptions({ ignoreNeedlesError: true })
          .withJHipsterGenerators()
          .withConfiguredBlueprint()
          .run();
      });

      it('should generate the migrations of the creations again, the same, and register them', () => {
        // The ones named by the date of their changelog (the one named by its timestamp removed by the former generation).
        expect(Object.keys(result.getSnapshot(`**/${migrationsDir}/20200101*-AddedEntity*.ts`))).toHaveLength(3);
        expect(result.fs.read(join(result.cwd, migrationsDir, '20200101000200-AddedEntityConstraintsOrder.ts'))).toBe(previous);
        expect(Object.keys(result.getSnapshot(`**/${migrationsDir}/*-UpdatedEntity*.ts`))).toEqual([]);
        const ormConfig = result.fs.read(join(result.cwd, 'server/src/orm.config.ts'));
        expect(ormConfig).toContain(
          "import { AddedEntityConstraintsOrder4577836920000 } from './migrations/20200101000200-AddedEntityConstraintsOrder.ts';",
        );
      });
    });
  });
});
