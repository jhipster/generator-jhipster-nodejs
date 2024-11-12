import { readFile } from 'node:fs/promises';
import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { createNeedleCallback } from 'generator-jhipster/generators/base/support';
import { getEnumInfo } from 'generator-jhipster/generators/base-application/support';
import { TEMPLATES_WEBAPP_SOURCES_DIR } from 'generator-jhipster';
import command from './command.js';
import { serverFiles } from './files.js';
import { entityFiles } from './entity-files.js';
import { SERVER_NODEJS_SRC_DIR } from '../generator-nodejs-constants.js';

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
      async initializingTemplateTask() {
        this.parseJHipsterCommand(command);
      },
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup({
      async promptingTemplateTask({ control }) {
        if (control.existingProject && !this.options.askAnswered) return;

        await this.prompt(this.prepareQuestions(command.configs));
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.asConfiguringTaskGroup({
      async configuringTemplateTask() {
        if (this.jhipsterConfigWithDefaults.prodDatabaseType === 'mongodb') {
          this.jhipsterConfig.databaseType = 'mongodb';
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
      async preparingEachEntityTemplateTask({ entity, application }) {
        for (const field of entity.fields) {
          const { fieldType } = field;
          field.nodejsFieldType = field.fieldValues ? fieldType : fieldTypes[fieldType] ?? 'any';
          field.nodejsColumnType = sanitizeDbType(dbTypes[fieldType], application.devDatabaseType);
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async cleanup({ control }) {
        if (control.existingProject) {
          if (this.isVersionLessThan(this.oldNodejsVersion, '3.0.1')) {
            this.removeFile('server/src/repository/authority.repository.ts');
            this.removeFile('server/src/repository/user.repository.ts');
          }
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
          if (this.isVersionLessThan(this.oldNodejsVersion, '3.0.1')) {
            for (const entity of entities) {
              this.removeFile(`server/src/repository/${entity.entityFileName}.repository.ts`);
            }
          }
        }
      },
      async customEntityServerFiles({ application, entities }) {
        if (this.databaseType === 'mongodb' && this.relationships.length > 0) {
          throw new Error('relationships not supported in mongodb!');
        }

        for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
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

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      adjustWorkspacePackageJson({ application }) {
        const { nodeServerDependencies, nodeDependencies } = application;

        const overrides = {
          '@nestjs/typeorm': {
            '@nestjs/common': nodeServerDependencies['@nestjs/common'],
            '@nestjs/core': nodeServerDependencies['@nestjs/core'],
          },
        };

        this.packageJson.merge({ overrides });
        this.mergeDestinationJson('server/package.json', { overrides });

        if (application.clientFrameworkAngular) {
          this.packageJson.merge({
            overrides: {
              'browser-sync': nodeDependencies['browser-sync'],
            },
          });
        }
      },
    });
  }
}
