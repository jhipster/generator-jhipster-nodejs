import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.POST_PREPARING]() {
    return this.asPostPreparingTaskGroup({
      async composeNodejsClient({ application }) {
        if (application.clientFrameworkBuiltIn) {
          await this.composeWithJHipster('jhipster-nodejs:client:nodejs');
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      async postWritingTemplateTask({ application }) {
        if (application.clientFrameworkAny) {
          const clientPackageJson = this.createStorage(`${application.clientRootDir}package.json`);
          const clientName = clientPackageJson.get('name');
          if (clientName === application.dasherizedBaseName) {
            clientPackageJson.set('name', `${application.dasherizedBaseName}-client`);
          }
        }
      },
    });
  }
}
