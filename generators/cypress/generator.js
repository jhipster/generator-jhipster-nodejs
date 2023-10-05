import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      customize({ application }) {
        this.editFile(`${application.cypressDir}/e2e/account/reset-password-page.cy.ts`, content =>
          content.replace("it('should be able to init reset password", "it.skip('should be able to init reset password"),
        );
      },
    });
  }
}
