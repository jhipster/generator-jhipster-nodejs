import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({});
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.asComposingTaskGroup({
      async composingServerI18n() {
        // The messages of the server in the languages to generate, like java:i18n for a Java backend: generator-jhipster
        // leaves them to the blueprint of another backend. Its serverI18nDir comes from common:bootstrap.
        if (this.jhipsterConfigWithDefaults.skipUserManagement || this.jhipsterConfigWithDefaults.skipServer) return;
        await this.composeWithJHipster('jhipster:server:i18n');
      },
    });
  }
}
