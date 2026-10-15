import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

import { SERVER_NODEJS_SRC_DIR } from '../../../generator-nodejs-constants.js';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  async beforeQueue() {
    // The client uses what the server gives (its built-in entities, user management), also when the client generator
    // runs without the server one.
    await this.dependsOnBootstrap('server');
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      clientFolders({ applicationDefaults }) {
        // The client is a workspace of its own (client/, JHipster derives its src/ and test/ folders), and its build is
        // served by the NodeJS server.
        applicationDefaults({
          clientRootDir: 'client/',
          clientDistDir: `${SERVER_NODEJS_SRC_DIR}/dist/static/`,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      withoutAdminUi({ application }) {
        // The NodeJS server has no endpoints of the administration pages of JHipster (configuration, logs, metrics).
        application.withAdminUi = false;
      },
    });
  }
}
