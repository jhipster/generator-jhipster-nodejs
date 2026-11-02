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

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      sqliteDatabaseScripts({ application }) {
        // The docker:db scripts JHipster writes for a SQL database: SQLite has no docker service, a file of the server.
        if (application.prodDatabaseType !== 'sqlite') return;
        const scripts = this.packageJson.createStorage('scripts');
        scripts.delete('docker:db:up');
        scripts.delete('docker:db:down');
      },
    });
  }
}
