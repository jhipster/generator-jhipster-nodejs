import { readFile } from 'node:fs/promises';
import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { createNeedleCallback } from 'generator-jhipster/generators/base/support';
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

  get [BaseApplicationGenerator.LOADING_ENTITIES]() {
    return this.asLoadingEntitiesTaskGroup({
      async loadingEntitiesTemplateTask({ entitiesToLoad }) {
        for (const entity of entitiesToLoad) {
          entity.entityBootstrap.dto = true;
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async cleanup({ control }) {
        if (control.existingProject) {
          await control.cleanupFiles(this.oldNodejsVersion, {
            '3.0.1': ['.server.eslintrc.json', '.server.eslintignore'],
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

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      adjustWorkspacePackageJson({ application }) {
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
      async postWritingEntitiesTemplateTask({ entities }) {
        for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
          this.editFile(
            `${SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            createNeedleCallback({
              needle: 'jhipster-needle-add-entity-module-to-main-import',
              contentToAdd: `import { ${entity.entityClass}Module } from './module/${entity.entityFileName}.module';`,
            }),
            createNeedleCallback({
              needle: 'jhipster-needle-add-entity-module-to-main',
              contentToAdd: `${entity.entityClass}Module,`,
            }),
          );
        }
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.asEndTaskGroup({
      async endTemplateTask() {},
    });
  }

  getTsType(fieldType) {
    return fieldTypes[fieldType] || 'any';
  }

  addDbType(fieldType) {
    return sanitizeDbType(dbTypes[fieldType], this.devDatabaseType);
  }
}
