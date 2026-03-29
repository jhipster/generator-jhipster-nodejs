import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

import { SERVER_NODEJS_SRC_DIR } from '../../../generator-nodejs-constants.js';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      async loadingTemplateTask({ applicationDefaults }) {
        applicationDefaults({
          backendType: 'NodeJS',
          withAdminUi: false,
          clientRootDir: 'client/',
          clientSrcDir: 'client/src/',
          clientTestDir: 'client/test/',
          clientDistDir: 'server/dist/static/',
          temporaryDir: 'tmp/',
          dockerServicesDir: 'docker/',
          nodeServerRootDir: `${SERVER_NODEJS_SRC_DIR}/`,
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
}
