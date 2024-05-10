import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { SERVER_NODEJS_SRC_DIR } from '../generator-nodejs-constants.js';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      validateNode() {
        // Until this blueprint implements syncUserWithIdp option, this will remain true by default
        if (this.jhipsterConfig.syncUserWithIdp) {
          return;
        }
        this.log.warn('Option syncUserWithIdp is not supported in this blueprint, setting to default value true');
        this.jhipsterConfig.syncUserWithIdp = true;
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      async loadingTemplateTask({ application }) {
        application.clientRootDir = 'client/';
        application.clientSrcDir = 'client/src/';
        application.clientTestDir = 'client/test/';
        application.dockerServicesDir = 'docker/';
        application.withAdminUi = false;
        application.backendType = 'NodeJS';
        application.nodeServerRootDir = `${SERVER_NODEJS_SRC_DIR}/`;
        application.dbPortValue = undefined;
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      async preparingTemplateTask({ application }) {
        application.clientDistDir = 'server/dist/static/';
        application.temporaryDir = 'tmp/';
      },
    });
  }
}
