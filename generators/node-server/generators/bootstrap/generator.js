import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { hibernateSnakeCase } from 'generator-jhipster/generators/server/support';
import { prepareSqlApplicationProperties } from 'generator-jhipster/generators/spring-boot/generators/data-relational/support';

import { SERVER_NODEJS_SRC_DIR } from '../../../generator-nodejs-constants.js';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  async beforeQueue() {
    // Node server is a Typescript server, we need typescript preparation.
    await this.dependsOnBootstrap('client');
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
          clientPackageManager: 'npm',
          dbPortValue: undefined,
          // As in JHipster's Spring Boot application, syncUserWithIdp is disabled by default, enabled for a gateway or
          // when an entity has a relationship with User (JHipster only derives it for a Java backend). Delayed until
          // anyEntityHasRelationshipWithUser is defined, before JHipster derives the built-in entities from it.
          syncUserWithIdp: ({ authenticationType, applicationType, anyEntityHasRelationshipWithUser }) =>
            authenticationType === 'oauth2' && (applicationType === 'gateway' || anyEntityHasRelationshipWithUser),
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      workarounds({ application }) {
        application.withAdminUi = false;
      },
      prettierFolders({ application }) {
        // The prettier:check and prettier:format scripts of the root package.json cover the server and the client
        // workspaces (JHipster only adds the client sources, and the build plugins of Angular at the root).
        const { nodeServerRootDir, clientRootDir } = application;
        const folders = [nodeServerRootDir, ...['src', 'test', 'e2e', 'scripts'].map(dir => `${nodeServerRootDir}${dir}/**/`)];
        if (application.clientFrameworkAny) {
          folders.push(clientRootDir);
          if (application.clientFrameworkAngular) {
            folders.push(`${clientRootDir}build-plugins/**/`);
          }
        }
        application.prettierFolders.push(...folders.filter(folder => !application.prettierFolders.includes(folder)));
      },
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

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup({
      postPreparing({ application }) {
        if (application.authority) {
          application.authority.skipClient = !application.clientFrameworkAngular;
        }
      },
    });
  }
}
