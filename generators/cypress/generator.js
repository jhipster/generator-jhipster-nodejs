import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, queueCommandTasks: true, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      async preparingTemplateTask({ application }) {
        // Disable cypress audit, it forces chrome to be installed at docker image.
        application.cypressAudit = false;
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      customize({ application }) {
        if (application.generateUserManagement) {
          this.editFile(`${application.cypressDir}/e2e/account/reset-password-page.cy.ts`, content =>
            content.replace("it('should be able to init reset password", "it.skip('should be able to init reset password"),
          );
        }
      },
      npmScripts({ application }) {
        const clientPackageJson = this.createStorage(this.destinationPath(application.clientRootDir, 'package.json'));
        clientPackageJson.merge({
          scripts: {
            'pree2e:headless': '',
          },
        });
      },
    });
  }
}
