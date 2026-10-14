import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

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
}
