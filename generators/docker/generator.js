import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      async preparingTemplateTask({ application }) {
        // The app service, which docker:bootstrap adds too: the bootstrap alone runs for a deployment.
        if (!application.dockerServices.includes('app')) application.dockerServices.push('app');
      },
    });
  }
}
