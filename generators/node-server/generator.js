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
  contentTypeColumnOptions,
  fieldColumnOptions,
  fieldColumnTypeImports,
  fieldTypeValidators,
  getDatabasePort,
  getNodeDevDatabaseType,
  hasRuntimeColumnTypes,
  insertSortedImport,
  joinTable,
  mutateEntityAuthorities,
  mutateEntityPaths,
  mutateRelatedValues,
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
  // A text, a longtext on MySQL and MariaDB at runtime like the blobs a longblob (src/common/database/column-types.ts).
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
      sqliteDevDatabase() {
        // The embedded development database of the NodeJS server is SQLite, not the H2 of JHipster Spring Boot: the H2
        // database of an application is migrated to SQLite, on disk or in memory like it.
        const sqliteDevDatabaseTypes = { h2Disk: 'sqlite', h2Memory: 'sqliteMemory' };
        const { devDatabaseType } = this.jhipsterConfig;
        if (sqliteDevDatabaseTypes[devDatabaseType]) {
          this.log.info(`The development database ${devDatabaseType} migrated to ${sqliteDevDatabaseTypes[devDatabaseType]}.`);
          this.jhipsterConfig.devDatabaseType = sqliteDevDatabaseTypes[devDatabaseType];
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
          // The sessions of the users of the application, like JHipster Spring Boot, in a monolith with its user management.
          ...(config.authenticationType === 'session' && (config.applicationType ?? 'monolith') !== 'monolith'
            ? [`authenticationType session of a ${config.applicationType} (use jwt or oauth2)`]
            : []),
          ...(config.authenticationType === 'session' && config.skipUserManagement
            ? ['authenticationType session with skipUserManagement']
            : []),
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
      async composeMigrations() {
        // The migrations of the entities of a SQL database, from their changelogs, like the incremental Liquibase changelogs.
        if (this.jhipsterConfigWithDefaults.databaseType === 'sql') {
          await this.composeWithJHipster('jhipster-nodejs:node-server:migrations');
        }
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
      passwords({ applicationDefaults }) {
        applicationDefaults({
          __override__: false,
          // The bcrypt rounds of the passwords of the users: the property of the JWT applications, kept, else the one of
          // the session applications.
          nodejsPasswordRoundsProperty: ({ authenticationTypeJwt }) =>
            authenticationTypeJwt
              ? 'jhipster.security.authentication.jwt.hash-salt-or-rounds'
              : 'jhipster.security.authentication.hash-salt-or-rounds',
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
          // The SQLite development database: in memory for sqliteMemory, else a file of the temporary folder of the
          // application, at its root, from the server folder the server runs in.
          nodeDevSqliteDatabase: ({ devDatabaseType, nodeServerRootDir, temporaryDir }) =>
            devDatabaseType === 'sqliteMemory' ? ':memory:' : `${this.relativeDir(nodeServerRootDir, temporaryDir)}db/sqlite-dev-db.sql`,
          nodeDatabasePort: getDatabasePort,
          nodejsRuntimeColumnTypes: hasRuntimeColumnTypes,
        });
      },
      async source({ source }) {
        // An import of orm.config.ts at its sorted place, else at the needle (see insertSortedImport).
        const addOrmConfigImport = importLine =>
          function (content, filePath) {
            return (
              insertSortedImport(content, importLine) ??
              createNeedleCallback({ needle: 'add-entity-to-ormconfig-imports', contentToAdd: importLine }).call(this, content, filePath)
            );
          };
        source.addEntityToNodeConfig = ({ nodejsEntityPath, persistClass }) =>
          this.editFile(
            `${SERVER_NODEJS_SRC_DIR}/src/orm.config.ts`,
            addOrmConfigImport(`import { ${persistClass} } from './${nodejsEntityPath}';`),
            createNeedleCallback({
              needle: 'add-entity-to-ormconfig-entities',
              contentToAdd: `${persistClass},`,
            }),
          );
        source.addMigrationToNodeConfig = ({ className, fileName }) =>
          this.editFile(
            `${SERVER_NODEJS_SRC_DIR}/src/orm.config.ts`,
            addOrmConfigImport(`import { ${className} } from './migrations/${fileName}.ts';`),
            createNeedleCallback({
              needle: 'add-migration-to-ormconfig-migrations',
              contentToAdd: `${className},`,
            }),
          );
        source.addEntityToAppModule = ({ entityClass, nodejsModulePath }) =>
          this.editFile(
            `${SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            createNeedleCallback({
              needle: 'jhipster-needle-add-entity-module-to-main-import',
              contentToAdd: `import { ${entityClass}Module } from './${nodejsModulePath}';`,
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
      prepareEntityPaths({ entityDefaults }) {
        // The files of the entity in its feature module (support/entity-paths.js).
        entityDefaults(mutateEntityPaths);
      },
      prepareEntityAuthorities({ entityDefaults }) {
        // The roles of the endpoints of the entity, like the @PreAuthorize of JHipster Spring Boot (support/entity-authorities.js).
        entityDefaults(mutateEntityAuthorities);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelatedValues({ entity, relationshipDefaults }) {
        // The values of the related record of the relationship tests (support/api-fake-data.js).
        relationshipDefaults(mutateRelatedValues(entity));
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
      prepareAuthorityAlertName({ application }) {
        // The name of the built-in Authority in its alerts (adminAuthority), the key of its translations in the client.
        application.nodejsAuthorityAlertName = application.authority?.entityAlertName ?? 'authority';
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
        // The migrations of the entities are the ones of their changelogs (the migrations generator).
        for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
          // The join tables of the entity, its @JoinTable the same as its constraints migration.
          for (const relationship of entity.relationships.filter(relationship => relationship.shouldWriteJoinTable)) {
            relationship.nodejsJoinTable = joinTable(entity, relationship);
          }
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
            '4.2.1': [
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
              // The development profile of 4.2.0 (BACKEND_ENV=dev) is in .env.dev: the .env file, loaded by every start of the
              // server, would start the built server with the development profile.
              'server/.env',
              // The files of 4.2.0 moved to the feature modules (auth, users, management, common), their specs next to them.
              'server/src/domain/authority.entity.ts',
              'server/src/domain/user.entity.ts',
              'server/src/domain/base/base.entity.ts',
              'server/src/domain/base/pagination.entity.ts',
              'server/src/domain/base/pagination.entity.spec.ts',
              'server/src/module/auth.module.ts',
              'server/src/module/user.module.ts',
              'server/src/security/decorators/auth-user.decorator.ts',
              'server/src/security/decorators/roles.decorator.ts',
              'server/src/security/guards/auth.guard.ts',
              'server/src/security/guards/roles.guard.ts',
              'server/src/security/index.ts',
              'server/src/security/oauth2.authorities.ts',
              'server/src/security/oauth2.config.ts',
              'server/src/security/passport.jwt.strategy.ts',
              'server/src/security/passport.oauth2.strategy.ts',
              'server/src/security/password-util.ts',
              'server/src/security/payload.interface.ts',
              'server/src/security/role-type.ts',
              'server/src/service/auth.service.ts',
              'server/src/service/user.service.ts',
              'server/src/service/dto/base.dto.ts',
              'server/src/service/dto/password-change.dto.ts',
              'server/src/service/dto/user-login.dto.ts',
              'server/src/service/dto/user.dto.ts',
              'server/src/service/mapper/user.mapper.ts',
              'server/src/web/rest/account.controller.ts',
              'server/src/web/rest/management.controller.ts',
              'server/src/web/rest/public.user.controller.ts',
              'server/src/web/rest/user.controller.ts',
              'server/src/web/rest/user.jwt.controller.ts',
              'server/src/web/rest/user.oauth2.controller.ts',
              'server/test/admin/management.controller.spec.ts',
              'server/test/config.spec.ts',
              'server/test/security/oauth2.authorities.spec.ts',
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
            // The files of the entities, of 4.2.0, moved to their feature module (src/entities/<entity>).
            '4.2.1': entities
              .filter(entity => !entity.skipServer && !entity.builtIn)
              .flatMap(({ entityFileName, fields }) => [
                `server/src/domain/${entityFileName}.entity.ts`,
                `server/src/module/${entityFileName}.module.ts`,
                `server/src/service/${entityFileName}.service.ts`,
                `server/src/service/dto/${entityFileName}.dto.ts`,
                `server/src/service/mapper/${entityFileName}.mapper.ts`,
                `server/src/web/rest/${entityFileName}.controller.ts`,
                ...fields.filter(field => field.fieldIsEnum).map(field => `server/src/domain/enumeration/${field.enumFileName}.ts`),
              ]),
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

          const webappEnumerationsDir = `${SERVER_NODEJS_SRC_DIR}/src/entities/enumeration/`;
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
          const { nodejsEntityPath, nodejsModulePath, persistClass, entityClass } = entity;
          if (!entity.builtInUserManagement) {
            source.addEntityToNodeConfig({ nodejsEntityPath, persistClass });
          }
          if (!entity.builtIn) {
            source.addEntityToAppModule({ nodejsModulePath, entityClass });
          }
        }
      },
    });
  }
}
