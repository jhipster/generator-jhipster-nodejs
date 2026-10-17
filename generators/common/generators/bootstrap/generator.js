import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

import { SERVER_NODEJS_SRC_DIR } from '../../../generator-nodejs-constants.js';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      backendType({ applicationDefaults }) {
        // The backend of the application, read by the server and the client generators of JHipster.
        applicationDefaults({
          backendType: 'NodeJS',
          backendTypeJavaAny: false,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      serverI18n({ applicationDefaults }) {
        // The messages of the server (server:i18n, the account mails), next to its sources instead of the Java resources,
        // without their test copies, each language in the file of its language tag, the langKey of the users
        // (messages_pt-br.properties). In the common bootstrap, which the languages command runs too.
        applicationDefaults({
          __override__: true,
          serverI18nDir: ({ generateUserManagement }) => (generateUserManagement ? `${SERVER_NODEJS_SRC_DIR}/src/i18n/` : undefined),
          serverI18nTestDir: undefined,
          serverI18nFileNaming: 'languageTag',
        });
      },
    });
  }
}
