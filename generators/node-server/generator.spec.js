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
          // The watch scripts of JHipster run the server alone without a client.
          'backend:start': 'npm run start:server',
          watch: 'concurrently npm:backend:start',
        },
      });
      expect(result.fs.readJSON(join(result.cwd, 'package.json')).devDependencies).toHaveProperty('concurrently');
      result.assertNoFileContent('package.json', 'no client');
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

  for (const [config, refused] of [
    [{ searchEngine: 'elasticsearch' }, 'searchEngine elasticsearch'],
    [{ cacheProvider: 'redis' }, 'cacheProvider redis'],
    [{ websocket: 'spring-websocket' }, 'websocket spring-websocket'],
    [{ messageBroker: 'kafka' }, 'messageBroker kafka'],
    [{ authenticationType: 'session' }, 'authenticationType session'],
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
        'server/src/service/eureka.service.ts',
        "this.configService.get('eureka.client.service-url.defaultZone', { infer: true })",
      );
      result.assertFileContent('server/src/service/eureka.service.ts', 'beforeApplicationShutdown');
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
      result.assertFileContent('server/src/service/consul.service.ts', "discovery['health-check-path']");
      result.assertFileContent('server/src/service/consul.service.ts', 'beforeApplicationShutdown');
      result.assertFileContent('server/src/app.module.ts', 'ConsulService,');
      result.assertFileContent('server/src/main.ts', /await app\.listen\(port\);[\s\S]*app\.get\(ConsulService\)\.register/);
      expect(result.fs.readJSON(join(result.cwd, 'server/package.json')).dependencies).toHaveProperty('consul');
      result.assertNoFile('server/src/service/eureka.service.ts');
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
      result.assertFileContent('server/src/service/dto/book.dto.ts', String.raw`@Matches("^(?:^\\d{3}-[0-9]{6}$)$")`);
      result.assertNoFileContent('server/src/service/dto/book.dto.ts', 'undefined');
    });

    it('should validate a required blob, so the whitelist of the ValidationPipe keeps it', () => {
      result.assertFileContent('server/src/service/dto/book.dto.ts', /@IsNotEmpty\(\)\s+@ApiProperty\([^)]*\)\s+cover!/);
    });

    it('should refuse a value out of an enum, like the JSON deserialization of Spring Boot', () => {
      result.assertFileContent('server/src/service/dto/book.dto.ts', /@IsOptional\(\)\s+@IsEnum\(Genre\)/);
      result.assertFileContent('server/src/service/dto/book.dto.ts', /@IsNotEmpty\(\)\s+@IsEnum\(BookFormat\)/);
      result.assertFileContent('server/e2e/book.e2e-spec.ts', "genre: 'NOT_A_GENRE'");
      result.assertFileContent('server/src/domain/book.entity.ts', 'enum: Genre, nullable: true })');
      result.assertFileContent('server/src/domain/book.entity.ts', 'enum: BookFormat })');
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
