import ServerGenerator from 'generator-jhipster/generators/server';

export default class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, queueCommandTasks: true, sbsBlueprint: true, checkBlueprint: true });
  }

  get [ServerGenerator.COMPOSING]() {
    return this.asComposingTaskGroup({
      async composingTemplateTask() {
        await this.composeWithJHipster('jhipster-nodejs:node-server');
      },
    });
  }
}
