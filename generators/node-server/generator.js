import { readFile } from 'node:fs/promises';
import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { createNeedleCallback, mutateData } from 'generator-jhipster/generators/base/support';
import { getEnumInfo } from 'generator-jhipster/generators/base-application/support';
import { TEMPLATES_WEBAPP_SOURCES_DIR } from 'generator-jhipster';
import { SERVER_NODEJS_SRC_DIR } from '../generator-nodejs-constants.js';
import { serverFiles } from './files.js';
import { entityFiles } from './entity-files.js';

function sanitizeDbType(fieldType, dbType) {
  if (dbType === 'sqlite') {
    if (fieldType === 'timestamp') {
      return 'datetime';
    }
  }
  return fieldType;
}

const fieldTypes = {
  Boolean: 'boolean',
  Integer: 'number',
  Long: 'number',
  Float: 'number',
  Double: 'number',
  BigDecimal: 'number',
  String: 'string',
  UUID: 'string',
};

const dbTypes = {
  Boolean: 'boolean',
  Integer: 'integer',
  Long: 'long',
  Float: 'float',
  Double: 'double',
  BigDecimal: 'decimal',
  LocalDate: 'date',
  Instant: 'timestamp',
  ZonedDateTime: 'datetime',
  AnyBlob: 'blob',
  ImageBlob: 'blob',
  Blob: 'blob',
  TextBlob: 'blob',
  'byte[]': 'blob',
};

const databaseDrivers = {
  mongodb: 'mongodb',
  mysql: 'mysql2',
  postgresql: 'pg',
  oracle: 'oracledb',
  mssql: 'mssql',
};

const databaseDevDrivers = {
  mongodb: 'mongodb-memory-server',
  mysql: 'sqlite3',
  postgresql: 'sqlite3',
  oracle: 'sqlite3',
  mssql: 'sqlite3',
};

export default class extends BaseApplicationGenerator {
  oldNodejsVersion;
  nodejsPackageJson;

  constructor(args, opts, features) {
    super(args, opts, { ...features, queueCommandTasks: true });
  }

  async beforeQueue() {
    await this.dependsOnJHipster('bootstrap-application');
    await this.dependsOnJHipster('common');
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async initializing() {
        this.oldNodejsVersion = this.blueprintConfig.nodejsVersion ?? '3.0.0';
        this.nodejsPackageJson = JSON.parse((await readFile(this.templatePath('../../../package.json'), 'utf-8')).toString());
        this.blueprintConfig.nodejsVersion = this.nodejsPackageJson.version;
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.asConfiguringTaskGroup({
      async configuringTemplateTask() {
        const { prodDatabaseType, databaseType } = this.jhipsterConfigWithDefaults;
        const databaseTypeMongodb = (prodDatabaseType ?? databaseType) === 'mongodb';
        this.jhipsterConfig.databaseType = databaseTypeMongodb ? 'mongodb' : 'sql';
        if (databaseTypeMongodb) {
          this.jhipsterConfig.prodDatabaseType = 'mongodb';
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.asComposingTaskGroup({
      async composingTemplateTask() {
        await this.composeWithJHipster('docker');
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
      drivers({ applicationDefaults }) {
        applicationDefaults({
          __override__: false,
          nodeProdDatabaseDriver: ({ databaseType, prodDatabaseType = databaseType }) => databaseDrivers[prodDatabaseType],
          nodeDevDatabaseDriver: ({ databaseType, prodDatabaseType = databaseType }) => databaseDevDrivers[prodDatabaseType],
          nodeProdDatabaseType: ({ databaseType, prodDatabaseType = databaseType }) =>
            prodDatabaseType === 'postgresql' ? 'postgres' : prodDatabaseType,
          nodeDevDatabaseType: ({ databaseType, devDatabaseType = databaseType }) =>
            devDatabaseType === 'postgresql' ? 'postgres' : devDatabaseType,
        });
      },
      async source({ source }) {
        source.addEntityToNodeConfig = ({ entityFileName, persistClass }) =>
          this.editFile(
            `${SERVER_NODEJS_SRC_DIR}/src/orm.config.ts`,
            createNeedleCallback({
              needle: 'add-entity-to-ormconfig-imports',
              contentToAdd: `import { ${persistClass} } from './domain/${entityFileName}.entity';`,
            }),
            createNeedleCallback({
              needle: 'add-entity-to-ormconfig-entities',
              contentToAdd: `${persistClass},`,
            }),
          );
        source.addEntityToAppModule = ({ entityClass, entityFileName }) =>
          this.editFile(
            `${SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            createNeedleCallback({
              needle: 'jhipster-needle-add-entity-module-to-main-import',
              contentToAdd: `import { ${entityClass}Module } from './module/${entityFileName}.module';`,
            }),
            createNeedleCallback({
              needle: 'jhipster-needle-add-entity-module-to-main',
              contentToAdd: `${entityClass}Module,`,
            }),
          );
      },
      async preparing({ application }) {
        application.typeormOrderSupport = !application.databaseTypeMongodb;
        application.typeormRelationsSupport = !application.databaseTypeMongodb;
      },
      adjusts({ application }) {
        application.dockerContainers.mssql = 'mcr.microsoft.com/mssql/server:2022-CU16-ubuntu-22.04';
        application.dockerContainers.mssqlTag = '2022-CU16-ubuntu-22.04';
        application.dockerContainers.mssqlImage = 'mcr.microsoft.com/mssql/server';
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

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.asPreparingEachEntityFieldTaskGroup({
      async preparingEachEntityTemplateTask({ application, field }) {
        const { fieldType } = field;
        if (field.skipServer) return;

        if (field.fieldValues) {
          mutateData(field, {
            __override__: true,
            nodejsFieldType: fieldType,
            nodejsColumnType: application.prodDatabaseTypePostgresql ? 'varchar' : 'simple-enum',
          });
        } else {
          mutateData(field, {
            __override__: true,
            nodejsFieldType: fieldTypes[fieldType] ?? 'any',
            nodejsColumnType: sanitizeDbType(dbTypes[fieldType], application.devDatabaseType),
          });
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
          });
        }
      },
      async writingTemplateTask({ application }) {
        await this.writeFiles({
          sections: serverFiles,
          context: application,
        });
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
            const enumInfo = getEnumInfo(field, entity.clientRootFolder);
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
        if (application.clientTestFrameworksCypress) {
          const clientPackageJson = this.createStorage(this.destinationPath(application.clientRootDir, 'package.json'));
          clientPackageJson.merge({
            scripts: {
              'pree2e:headless': '',
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
        }
      },
    });
  }
}
