import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { hibernateSnakeCase } from 'generator-jhipster/generators/server/support';
import { prepareSqlApplicationProperties } from 'generator-jhipster/generators/spring-boot/generators/data-relational/support';

import { SERVER_NODEJS_SRC_DIR } from '../../../generator-nodejs-constants.js';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  async beforeQueue() {
    await this.dependsOnBootstrap('server');
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      async loadingTemplateTask({ applicationDefaults }) {
        applicationDefaults({
          backendType: 'NodeJS',
          backendTypeJavaAny: false,
          withAdminUi: false,
          clientRootDir: 'client/',
          clientSrcDir: 'client/src/',
          clientTestDir: 'client/test/',
          clientDistDir: 'server/dist/static/',
          temporaryDir: 'tmp/',
          dockerServicesDir: 'docker/',
          nodeServerRootDir: `${SERVER_NODEJS_SRC_DIR}/`,
          jhiTablePrefix: ({ jhiPrefix }) => hibernateSnakeCase(jhiPrefix),
          generateBuiltInUserEntity: true,
          clientPackageManager: 'npm',
          dbPortValue: undefined,
        });
      },

      defaultSyncUserWithIdp({ application, applicationDefaults }) {
        // Until this blueprint implements syncUserWithIdp option, this will remain true by default
        if (application.syncUserWithIdp === undefined && application.authenticationType === 'oauth2') {
          this.log.warn('Option syncUserWithIdp is not supported in this blueprint, setting to default value true');
          applicationDefaults({
            syncUserWithIdp: true,
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      preparing({ application, applicationDefaults }) {
        if (application.databaseTypeSql) {
          prepareSqlApplicationProperties({ application });
        } else {
          applicationDefaults({
            prodDatabaseName: undefined,
            prodDatabaseUsername: undefined,
            prodDatabasePassword: undefined,
            devDatabaseName: undefined,
            devDatabaseUsername: undefined,
            devDatabasePassword: undefined,
          });
        }
      },
    });
  }
}
