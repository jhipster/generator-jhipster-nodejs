import ServerGenerator from 'generator-jhipster/generators/server';
import command from './command.js';

export default class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, {
      ...features,
      checkBlueprint: true,
    });
  }

  get [ServerGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async initializingTemplateTask() {
        this.parseJHipsterCommand(command);
      },
    });
  }

  get [ServerGenerator.COMPOSING]() {
    return this.asComposingTaskGroup({
      async composingTemplateTask() {
        await this.composeWithJHipster('jhipster-nodejs:node-server');
      },
    });
  }
}
