import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { SERVER_NODEJS_SRC_DIR } from '../generator-nodejs-constants.js';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      async loadingTemplateTask({ application }) {
        application.clientRootDir = 'client/';
        application.clientSrcDir = 'client/src/';
        application.clientTestDir = 'client/test/';
        application.clientDistDir = 'server/dist/static/';
        application.dockerServicesDir = 'docker/';
        application.withAdminUi = false;
        application.temporaryDir = 'tmp/';
        application.backendType = 'NodeJS';
        application.nodeServerRootDir = `${SERVER_NODEJS_SRC_DIR}/`;
        application.dbPortValue = undefined;
      },
    });
  }
}
