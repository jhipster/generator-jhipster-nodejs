import ServerGenerator from 'generator-jhipster/generators/server';

export default class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, checkBlueprint: true });
  }

  async beforeQueue() {
    await this.dependsOnBootstrap('server');
    await this.dependsOnJHipster('common');
  }

  get [ServerGenerator.COMPOSING]() {
    return this.asComposingTaskGroup({
      async composingTemplateTask() {
        await this.composeWithJHipster('jhipster-nodejs:node-server');
      },
    });
  }
}
