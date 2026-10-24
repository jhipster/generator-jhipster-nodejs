import { readFile } from 'node:fs/promises';

import { TEMPLATES_WEBAPP_SOURCES_DIR } from 'generator-jhipster';
import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { createNeedleCallback } from 'generator-jhipster/generators/base-core/support';
import { createKeyStore } from 'generator-jhipster/generators/java/support';
import { createBase64Secret, createReproducibleBase64Secret, mutateData } from 'generator-jhipster/utils';

import { SERVER_NODEJS_SRC_DIR } from '../generator-nodejs-constants.js';

import { entityFiles } from './entity-files.js';
import { serverFiles } from './files.js';
import {
  MIGRATION_TIMESTAMP_OFFSET,
  apiFakeEntity,
  apiFakeValue,
  columnTransformer,
  constraintsMigration,
  contentTypeColumnOptions,
  entityMigration,
  fieldColumnOptions,
  fieldColumnTypeImports,
  fieldTypeValidators,
  getDatabasePort,
  getNodeDevDatabaseType,
  getNodeDevSqliteDatabase,
  hasRuntimeColumnTypes,
  mutateRequiredRelationship,
  mutateRequiredRelationshipsEntity,
  primaryKeyColumn,
  serverEnumInfo,
  thymeleafMailToHandlebars,
  userAuthorityJoinTable,
} from './support/index.js';

/** The time the end-to-end tests wait for the server, like the WAIT_TIMEOUT of java:server, which JHipster does not export. */
const WAIT_TIMEOUT = 3 * 60000;

const fieldTypes = {
  Boolean: 'boolean',
  Integer: 'number',
  Long: 'number',
  Float: 'number',
  Double: 'number',
  BigDecimal: 'number',
  String: 'string',
  UUID: 'string',
  // Without a column type, TypeORM gives a Date the date-time type of the database in use.
  Instant: 'Date',
  ZonedDateTime: 'Date',
  // The values of the JSON of JHipster Spring Boot: yyyy-MM-dd, HH:mm:ss, ISO-8601 (PT1H30M), base64 or text.
  LocalDate: 'string',
  LocalTime: 'string',
  Duration: 'string',
  'byte[]': 'string',
};

const dbTypes = {
  Boolean: 'boolean',
  Integer: 'integer',
  Long: 'bigint',
  Float: 'float',
  Double: 'double precision',
  BigDecimal: 'decimal',
  LocalDate: 'date',
  LocalTime: 'time',
  // The nanoseconds of the duration, like the bigint column of JHipster Spring Boot (the duration transformer).
  Duration: 'bigint',
  AnyBlob: 'blob',
  ImageBlob: 'blob',
  Blob: 'blob',
  TextBlob: 'blob',
  'byte[]': 'blob',
};

/**
 * Column types replacing the ones of dbTypes for a prodDatabaseType: the entities are shared by the prod database and by
 * better-sqlite3 (dev and test), so a type must be supported by TypeORM for both drivers. An undefined type omits it,
 * TypeORM then gives the type of the database for the TypeScript type (Boolean: bit on SQL Server, number on Oracle).
 * A byte[] field is an ImageBlob or an AnyBlob, a TextBlob is a byte[] field with a text content.
 */
const prodDatabaseColumnTypes = {
  // bytea is not a SQLite type: the blobs are kept as text, like the base64 strings the API exchanges.
  postgresql: { 'byte[]': 'text', TextBlob: 'text' },
  // SQL Server has no boolean type, and neither bit nor its binary types are SQLite ones.
  mssql: { Boolean: undefined, 'byte[]': 'text', TextBlob: 'text' },
  // Oracle has neither boolean nor bigint (integer is NUMBER(38)), nor a time type.
  oracle: { Boolean: undefined, Long: 'integer', Duration: 'integer', LocalTime: 'varchar', TextBlob: 'clob' },
  // A text, a longtext on MySQL and MariaDB at runtime like the blobs a longblob (src/domain/base/column-types.ts).
  mysql: { TextBlob: 'text' },
  mariadb: { TextBlob: 'text' },
};

/** Enum column types by prodDatabaseType, simple-enum otherwise: Oracle has no simple-enum. */
const enumColumnTypes = {
  postgresql: 'varchar',
  oracle: 'varchar',
};

const databaseDrivers = {
  mongodb: 'mongodb',
  mysql: 'mysql2',
  // TypeORM connects to MariaDB with the MySQL driver.
  mariadb: 'mysql2',
  postgresql: 'pg',
  oracle: 'oracledb',
  mssql: 'mssql',
};

const databaseDevDrivers = {
  mongodb: 'mongodb-memory-server',
  mysql: 'better-sqlite3',
  mariadb: 'better-sqlite3',
  postgresql: 'better-sqlite3',
  oracle: 'better-sqlite3',
  mssql: 'better-sqlite3',
};

export default class extends BaseApplicationGenerator {
  oldNodejsVersion;
  existingNodejsVersion;
  nodejsPackageJson;

  async beforeQueue() {
    await this.dependsOnJHipster('jhipster-nodejs:node-server:bootstrap');
    await this.dependsOnJHipster('server');
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async initializing() {
        this.existingNodejsVersion = this.blueprintConfig.nodejsVersion;
        this.oldNodejsVersion = this.existingNodejsVersion ?? '3.0.0';
        this.nodejsPackageJson = JSON.parse((await readFile(this.templatePath('../../../package.json'), 'utf-8')).toString());
        this.blueprintConfig.nodejsVersion = this.nodejsPackageJson.version;
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.asConfiguringTaskGroup({
      async configuringTemplateTask() {
        const { prodDatabaseType, databaseType } = this.jhipsterConfigWithDefaults;
        if (!['sql', 'mongodb'].includes(databaseType)) {
          throw new Error(
            `The database type ${databaseType} is not supported by the JHipster NodeJS blueprint: use sql (with prodDatabaseType mysql, mariadb, postgresql, mssql or oracle) or mongodb.`,
          );
        }
        const databaseTypeMongodb = (prodDatabaseType ?? databaseType) === 'mongodb';
        this.jhipsterConfig.databaseType = databaseTypeMongodb ? 'mongodb' : 'sql';
        if (databaseTypeMongodb) {
          this.jhipsterConfig.prodDatabaseType = 'mongodb';
        }
      },
      unsupportedOptions() {
        // Options of JHipster the NodeJS server does not implement: refused like the database types, instead of
        // generating an application without what they ask for. The configuration as given, as the defaults of
        // JHipster's spring-boot generator (cacheProvider ehcache) apply to every application.
        const config = this.jhipsterConfig;
        const enabled = value => value !== undefined && value !== null && value !== false && value !== 'no';
        const unsupported = [
          ...['searchEngine', 'cacheProvider', 'websocket', 'messageBroker']
            .filter(option => enabled(config[option]))
            .map(option => `${option} ${config[option]}`),
          ...(config.authenticationType === 'session' ? ['authenticationType session (use jwt or oauth2)'] : []),
          ...(config.reactive ? ['reactive'] : []),
        ];
        if (unsupported.length > 0) {
          throw new Error(`The JHipster NodeJS blueprint does not support ${unsupported.join(', ')}.`);
        }
      },
      jwtSecretKey() {
        // JHipster's spring-boot generator, which this blueprint replaces, creates the secret shared with JHipster's
        // Spring Boot applications.
        if (this.jhipsterConfigWithDefaults.authenticationType === 'jwt' && this.jhipsterConfig.jwtSecretKey === undefined) {
          const { creationTimestamp } = this.jhipsterConfig;
          // With --reproducible-secrets, derived from the creation timestamp like JHipster Spring Boot: the same
          // application gives the same secret.
          this.jhipsterConfig.jwtSecretKey =
            this.options.reproducibleSecrets && creationTimestamp
              ? createReproducibleBase64Secret(creationTimestamp, 'jwtSecretKey', 64)
              : createBase64Secret(64, this.options.reproducibleTests);
        }
      },
      keepSyncUserWithIdp() {
        // OAuth2 applications generated before 4.1.1 always synchronized their users, keep it for them. Not for an
        // application generated by this version itself (a development version records the version it will release).
        if (
          this.existingNodejsVersion &&
          this.isVersionLessThan(this.existingNodejsVersion, '4.1.1') &&
          this.isVersionLessThan(this.existingNodejsVersion, this.nodejsPackageJson.version) &&
          this.jhipsterConfigWithDefaults.authenticationType === 'oauth2' &&
          this.jhipsterConfig.syncUserWithIdp === undefined
        ) {
          this.jhipsterConfig.syncUserWithIdp = true;
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.asComposingTaskGroup({
      async composingTemplateTask() {
        await this.composeWithJHipster('docker');
      },
      async composeLanguages() {
        // Like the spring-boot generator: the languages of the application to generate (languagesToGenerate), the server
        // messages of server:i18n among them, without a client composing it.
        if (this.jhipsterConfigWithDefaults.enableTranslation) {
          await this.composeWithJHipster('languages');
        }
      },
      async composingServerI18n() {
        // The messages of the account mails, written to the serverI18nDir of the application (common:bootstrap), the
        // default ones without translation too. The languages generator composes it for the languages command.
        if (this.jhipsterConfigWithDefaults.skipUserManagement) return;
        await this.composeWithJHipster('jhipster:server:i18n');
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      async loadingTemplateTask({ application }) {
        application.nodeServerDependencies = {};
        this.loadNodeDependenciesFromPackageJson(application.nodeServerDependencies, this.templatePath('../resources/package.json'));
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      migrations({ applicationDefaults }) {
        applicationDefaults({
          __override__: false,
          // The offset of the timestamps of the migrations of the developers (see support/migrations.js).
          nodejsMigrationTimestampOffset: MIGRATION_TIMESTAMP_OFFSET,
        });
      },
      drivers({ applicationDefaults }) {
        applicationDefaults({
          __override__: false,
          nodeProdDatabaseDriver: ({ databaseType, prodDatabaseType = databaseType }) => databaseDrivers[prodDatabaseType],
          nodeDevDatabaseDriver: ({ databaseType, prodDatabaseType = databaseType }) => databaseDevDrivers[prodDatabaseType],
          nodeProdDatabaseType: ({ databaseType, prodDatabaseType = databaseType }) =>
            prodDatabaseType === 'postgresql' ? 'postgres' : prodDatabaseType,
          nodeDevDatabaseType: getNodeDevDatabaseType,
          nodeDevSqliteDatabase: getNodeDevSqliteDatabase,
          nodeDatabasePort: getDatabasePort,
          nodejsRuntimeColumnTypes: hasRuntimeColumnTypes,
        });
      },
      async source({ source }) {
        source.addEntityToNodeConfig = ({ entityFileName, persistClass }) =>
          this.editFile(
            `${SERVER_NODEJS_SRC_DIR}/src/orm.config.ts`,
            createNeedleCallback({
              needle: 'add-entity-to-ormconfig-imports',
              contentToAdd: `import { ${persistClass} } from './domain/${entityFileName}.entity.ts';`,
            }),
            createNeedleCallback({
              needle: 'add-entity-to-ormconfig-entities',
              contentToAdd: `${persistClass},`,
            }),
          );
        source.addMigrationToNodeConfig = ({ className, fileName }) =>
          this.editFile(
            `${SERVER_NODEJS_SRC_DIR}/src/orm.config.ts`,
            createNeedleCallback({
              needle: 'add-entity-to-ormconfig-imports',
              contentToAdd: `import { ${className} } from './migrations/${fileName}.ts';`,
            }),
            createNeedleCallback({
              needle: 'add-migration-to-ormconfig-migrations',
              contentToAdd: `${className},`,
            }),
          );
        source.addEntityToAppModule = ({ entityClass, entityFileName }) =>
          this.editFile(
            `${SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            createNeedleCallback({
              needle: 'jhipster-needle-add-entity-module-to-main-import',
              contentToAdd: `import { ${entityClass}Module } from './module/${entityFileName}.module.ts';`,
            }),
            createNeedleCallback({
              needle: 'jhipster-needle-add-entity-module-to-main',
              contentToAdd: `${entityClass}Module,`,
            }),
          );
      },
      async preparing({ application }) {
        application.typeormRelationsSupport = !application.databaseTypeMongodb;
      },
    });
  }

  get [BaseApplicationGenerator.LOADING_ENTITIES]() {
    return this.asLoadingEntitiesTaskGroup({
      async loadingEntitiesTemplateTask({ entitiesToLoad }) {
        for (const entity of entitiesToLoad) {
          entity.entityBootstrap.dto = true;
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.asPreparingEachEntityTaskGroup({
      prepareMappedByRelationships({ entityDefaults }) {
        entityDefaults({
          // The relationships the other entity stores (its join column or its join table), never stored from this entity,
          // like the mappedBy side of JHipster Spring Boot: the complement of the persistableRelationships of JHipster,
          // delayed until the relationships are prepared.
          nodejsMappedByRelationships: ({ relationships }, { delayMarker }) =>
            delayMarker ?? relationships.filter(relationship => !relationship.persistableRelationship),
        });
      },
      prepareRequiredRelationships({ application, entityDefaults }) {
        // The required relationships the entity stores, and the records its end-to-end tests create first for them
        // (support/required-relationships.js).
        entityDefaults(mutateRequiredRelationshipsEntity(application));
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRequiredRelationship({ relationshipDefaults }) {
        relationshipDefaults(mutateRequiredRelationship);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.asPreparingEachEntityFieldTaskGroup({
      async preparingEachEntityTemplateTask({ application, field }) {
        const { fieldType } = field;
        if (field.skipServer) return;

        if (field.fieldValues) {
          mutateData(field, {
            __override__: true,
            nodejsFieldType: fieldType,
            nodejsColumnType: enumColumnTypes[application.prodDatabaseType] ?? 'simple-enum',
          });
        } else {
          const columnTypes = { ...dbTypes, ...prodDatabaseColumnTypes[application.prodDatabaseType] };
          const nodejsColumnType = columnTypes[field.fieldTypeBlobContent === 'text' ? 'TextBlob' : fieldType];
          mutateData(field, {
            __override__: true,
            nodejsFieldType: fieldTypes[fieldType] ?? 'any',
            nodejsColumnType,
            nodejsColumnTransformer: application.databaseTypeSql ? columnTransformer({ fieldType, nodejsColumnType }) : undefined,
          });
        }
        mutateData(field, {
          __override__: true,
          nodejsColumnOptions: fieldColumnOptions(field, application),
          nodejsColumnTypeImports: fieldColumnTypeImports(field, application),
          nodejsTypeValidators: fieldTypeValidators(field),
          nodejsContentTypeColumnOptions: contentTypeColumnOptions(field, application),
        });
        // The fake value of the field as the API exchanges it, generated when a template calls it (after its faker seed).
        field.nodejsApiFakeValue = () => apiFakeValue(field);
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup({
      prepareColumnTransformers({ entities }) {
        // The transformers the columns of an entity use, imported by its entity.
        for (const entity of entities.filter(entity => !entity.skipServer)) {
          entity.nodejsColumnTransformers = [...new Set(entity.fields.map(field => field.nodejsColumnTransformer).filter(Boolean))];
          // The helpers of the column types chosen at runtime the columns of an entity use.
          entity.nodejsColumnTypeImports = [...new Set(entity.fields.flatMap(field => field.nodejsColumnTypeImports ?? []))];
          // The fake values of the fields as the API exchanges them, generated when a template calls it (after its faker seed).
          entity.nodejsApiFakeEntity = () => apiFakeEntity(entity);
        }
      },
      prepareAuthorityAlertName({ application, entities }) {
        // The name of the built-in Authority in its alerts (adminAuthority), the key of its translations in the client.
        const authority = entities.find(entity => entity.builtInAuthority);
        application.nodejsAuthorityAlertName = authority?.entityAlertName ?? 'authority';
      },
      prepareUserLoginVm({ application }) {
        // The class of the logged user's data: the DTO of the built-in User entity, prepared with the entities, else
        // UserDTO (OAuth2 without syncUserWithIdp has no built-in User).
        application.userLoginVmClass = application.user?.dtoClass ?? 'UserDTO';
      },
      prepareMigrations({ application, entities }) {
        if (!application.databaseTypeSql) return;
        // The migrations of the SQL databases, like the Liquibase changelogs of JHipster Spring Boot (see support/migrations.js).
        if (application.generateBuiltInUserEntity) {
          application.nodejsUserPrimaryKeyColumn = primaryKeyColumn(application.user);
          application.nodejsUserAuthorityJoinTable = userAuthorityJoinTable(application);
        }
        for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
          entity.nodejsMigration = entityMigration(entity);
          entity.nodejsConstraintsMigration = constraintsMigration(entity);
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async cleanup({ application, control }) {
        if (control.existingProject) {
          await control.cleanupFiles(this.oldNodejsVersion, {
            '3.0.1': [
              '.server.eslintrc.json',
              '.server.eslintignore',
              'server/src/repository/authority.repository.ts',
              'server/src/repository/user.repository.ts',
              [application.authenticationTypeOauth2, 'node/src/security/password-util.ts'],
            ],
            '4.1.1': [
              // The Dockerfile starts node itself, the database readiness comes from the compose healthchecks.
              'server/scripts/entrypoint.sh',
              [!application.generateUserManagement, 'server/src/web/rest/user.controller.ts', 'server/e2e/user.e2e-spec.ts'],
              [
                !application.generateBuiltInUserEntity,
                'server/src/domain/user.entity.ts',
                'server/src/service/mapper/user.mapper.ts',
                'server/src/service/user.service.ts',
                'server/src/module/user.module.ts',
                'server/src/web/rest/public.user.controller.ts',
              ],
              [
                !application.generateBuiltInAuthorityEntity,
                'server/src/domain/authority.entity.ts',
                'server/src/migrations/1570200490072-SeedUsersRoles.ts',
              ],
            ],
            '4.3.1': [
              // The HTTP helpers of the server moved from src/client (a name taken by the client workspace) to src/common.
              'server/src/client/header-util.ts',
              'server/src/client/request.ts',
              'server/src/client/interceptors/logging.interceptor.ts',
              // The tests run with Vitest (vitest.config.e2e.ts) instead of Jest.
              'server/e2e/jest.e2e.config.json',
              // The webpack bundle (webpack:prod) is removed: the server is built with tsc, like NestJS does by default.
              'server/webpack.server.prod.config.js',
              // The Nest CLI builds and starts the server, and copies the configuration files (assets of nest-cli.json).
              'server/scripts/copy-resources.ts',
            ],
          });
        }
      },
      async writingTemplateTask({ application }) {
        await this.writeFiles({
          sections: serverFiles,
          context: application,
        });
      },
      writeSampleKeyStore({ application }) {
        // The keystore of the tls-samples profile, written once like the one of JHipster Spring Boot.
        const keyStoreFile = this.destinationPath(`${SERVER_NODEJS_SRC_DIR}/src/config/tls/keystore-samples.p12`);
        if (this.fs.exists(keyStoreFile)) {
          // A write once file, written back as it is: the KeyStore is told apart from the files no generator writes.
          this.writeDestination(keyStoreFile, this.fs.read(keyStoreFile, { raw: true }), { metadata: { writeOnce: true } });
          this.log.info(`KeyStore '${keyStoreFile}' already exists. Leaving unchanged.`);
        } else {
          // Created with node:crypto, without the keytool of a JDK, like JHipster Spring Boot: with --reproducible-secrets,
          // derived from the creation timestamp, the same application gives the same file.
          const creationTimestamp = this.options.reproducibleSecrets ? this.jhipsterConfig.creationTimestamp : undefined;
          const packageName = application.packageName ?? application.baseName;
          this.writeDestination(keyStoreFile, createKeyStore({ packageName, creationTimestamp }), {
            metadata: { writeOnce: true },
          });
          this.log.info(`KeyStore '${keyStoreFile}' generated successfully.`);
        }
      },
      async writingMailTemplates({ application }) {
        if (!application.generateUserManagement) return;
        // The mail templates of JHipster Spring Boot (Thymeleaf) converted to the Handlebars templates of the mail module.
        for (const template of ['activationEmail', 'creationEmail', 'passwordResetEmail']) {
          const destination = `${SERVER_NODEJS_SRC_DIR}/src/templates/mail/${template}.hbs`;
          await this.writeFile(
            this.fetchFromInstalledJHipster(`spring-boot/templates/src/main/resources/templates/mail/${template}.html.ejs`),
            destination,
            application,
          );
          this.editFile(destination, thymeleafMailToHandlebars);
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      async cleanup({ control, entities }) {
        if (control.existingProject) {
          await control.cleanupFiles(this.oldNodejsVersion, {
            '3.0.1': entities.filter(e => !e.skipServer).map(e => `server/src/repository/${e.entityFileName}.repository.ts`),
          });
        }
      },
      async customEntityServerFiles({ application, entities }) {
        for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
          if (application.databaseType === 'mongodb' && entity.relationships.length > 0) {
            throw new Error('relationships not supported in mongodb!');
          }

          await this.writeFiles({
            sections: entityFiles,
            context: { ...application, ...entity },
          });

          const webappEnumerationsDir = `${SERVER_NODEJS_SRC_DIR}/src/domain/enumeration/`;
          for (const field of entity.fields.filter(field => field.fieldIsEnum)) {
            const enumInfo = serverEnumInfo(field, entity.clientRootFolder);
            await this.writeFile(
              this.fetchFromInstalledJHipster(
                `client/templates/${TEMPLATES_WEBAPP_SOURCES_DIR}app/entities/enumerations/enum.model.ts.ejs`,
              ),
              `${webappEnumerationsDir}${field.enumFileName}.ts`,
              enumInfo,
            );
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      adjustWorkspacePackageJson({ application }) {
        if (application.databaseTypeMongodb) {
          // download the mongod binary at install time, into a directory shared by all workspaces
          this.packageJson.merge({
            allowScripts: {
              'mongodb-memory-server': true,
            },
            config: {
              mongodbMemoryServer: {
                downloadDir: 'node_modules/.cache/mongodb-memory-server',
              },
            },
          });
        } else {
          // better-sqlite3 (dev and test database) downloads or builds its native binding at install time
          this.packageJson.merge({
            allowScripts: {
              'better-sqlite3': true,
            },
          });
        }
        if (application.clientFrameworkAngular) {
          this.packageJson.merge({
            overrides: {
              'browser-sync': application.nodeDependencies['browser-sync'],
            },
          });
        }
      },
      packageJsonE2eScripts({ application }) {
        if (!application.clientFrameworkAny) return;
        // Like the packageJsonE2eScripts of JHipster Spring Boot (java:server): the end-to-end tests wait for a microservice
        // through its gateway, which their microfrontend runs against (its own port is not published by a docker-compose
        // deployment), for the other applications on their own port; longer for a gateway and with OAuth2.
        let waitTimeout = WAIT_TIMEOUT * (application.applicationTypeGateway ? 2 : 1);
        waitTimeout = application.authenticationTypeOauth2 ? waitTimeout * 2 : waitTimeout;
        // With e2eTls, ci:e2e:run sets E2E_SERVER_PROTOCOL to https, the packaged server started with its tls profile.
        const protocol = application.e2eTls ? '${E2E_SERVER_PROTOCOL:-http}' : 'http';
        const endpoint = application.applicationTypeMicroservice
          ? `http-get://127.0.0.1:${application.gatewayServerPort}/${application.endpointPrefix}/management/health/readiness`
          : `${protocol}-get://127.0.0.1:$npm_package_config_backend_port/management/health`;
        this.packageJson.merge({
          scripts: {
            'ci:server:await': `echo "Waiting for server at port $npm_package_config_backend_port to start" && wait-on -t ${waitTimeout} ${endpoint} && echo "Server at port $npm_package_config_backend_port started"`,
          },
        });
      },
      ignoreClientIssues({ application }) {
        if (application.clientFrameworkNo) return;
        // TODO use source.addEslintConfig
        this.editFile(
          `${application.clientRootDir}/eslint.config.ts`,
          createNeedleCallback({
            needle: 'eslint-add-config',
            contentToAdd: String.raw`{
  files: ["${this.relativeDir(application.clientRootDir, application.clientSrcDir)}**/*"],
  rules: { "@typescript-eslint/no-unsafe-return": "off" },
},`,
          }),
        );
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.asPostWritingEntitiesTaskGroup({
      async postWritingEntitiesTemplateTask({ entities, source }) {
        for (const entity of entities.filter(entity => !entity.skipServer)) {
          const { entityFileName, persistClass, entityClass } = entity;
          if (!entity.builtInUserManagement) {
            source.addEntityToNodeConfig({ entityFileName, persistClass });
          }
          if (!entity.builtIn) {
            source.addEntityToAppModule({ entityFileName, entityClass });
          }
          for (const migration of [entity.nodejsMigration, entity.nodejsConstraintsMigration].filter(Boolean)) {
            source.addMigrationToNodeConfig(migration);
          }
        }
      },
    });
  }
}
