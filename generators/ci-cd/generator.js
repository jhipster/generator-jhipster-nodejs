import CiCdGenerator from 'generator-jhipster/generators/ci-cd';
import command from './command.js';

export default class extends CiCdGenerator {
  constructor(args, opts, features) {
    super(args, opts, {
      ...features,
      checkBlueprint: true,
    });
  }

  async beforeQueue() {
    await super.beforeQueue();
  }

  get [CiCdGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      ...super.initializing,
      async initializingTemplateTask() {
        this.parseJHipsterArguments(command.arguments);
        this.parseJHipsterOptions(command.options);
      },
    });
  }

  get [CiCdGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup({
      ...super.prompting,
      async promptingTemplateTask() {},
    });
  }

  get [CiCdGenerator.CONFIGURING]() {
    return this.asConfiguringTaskGroup({
      ...super.configuring,
      async configuringTemplateTask() {},
    });
  }

  get [CiCdGenerator.COMPOSING]() {
    return this.asComposingTaskGroup({
      ...super.composing,
      async composingTemplateTask() {},
    });
  }

  get [CiCdGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      ...super.loading,
      async loadingTemplateTask() {},
    });
  }

  get [CiCdGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      ...super.preparing,
      async preparingTemplateTask() {},
    });
  }

  get [CiCdGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.asConfiguringEachEntityTaskGroup({
      ...super.configuringEachEntity,
      async configuringEachEntityTemplateTask() {},
    });
  }

  get [CiCdGenerator.LOADING_ENTITIES]() {
    return this.asLoadingEntitiesTaskGroup({
      ...super.loadingEntities,
      async loadingEntitiesTemplateTask() {},
    });
  }

  get [CiCdGenerator.PREPARING_EACH_ENTITY]() {
    return this.asPreparingEachEntityTaskGroup({
      ...super.preparingEachEntity,
      async preparingEachEntityTemplateTask() {},
    });
  }

  get [CiCdGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.asPreparingEachEntityFieldTaskGroup({
      ...super.preparingEachEntityField,
      async preparingEachEntityFieldTemplateTask() {},
    });
  }

  get [CiCdGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      ...super.preparingEachEntityRelationship,
      async preparingEachEntityRelationshipTemplateTask() {},
    });
  }

  get [CiCdGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.asPostPreparingEachEntityTaskGroup({
      ...super.postPreparingEachEntity,
      async postPreparingEachEntityTemplateTask() {},
    });
  }

  get [CiCdGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup({
      ...super.default,
      async defaultTemplateTask() {},
    });
  }

  get [CiCdGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      ...super.writing,
      async writingTemplateTask({ application }) {
        await this.writeFiles({
          sections: {
            files: [],
          },
          context: application,
        });
      },
    });
  }

  get [CiCdGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      ...super.writingEntities,
      async writingEntitiesTemplateTask() {},
    });
  }

  get [CiCdGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      ...super.postWriting,
      async postWritingTemplateTask() {},
    });
  }

  get [CiCdGenerator.POST_WRITING_ENTITIES]() {
    return this.asPostWritingEntitiesTaskGroup({
      ...super.postWritingEntities,
      async postWritingEntitiesTemplateTask() {},
    });
  }

  get [CiCdGenerator.LOADING_TRANSLATIONS]() {
    return this.asLoadingTranslationsTaskGroup({
      ...super.loadingTranslations,
      async loadingTranslationsTemplateTask() {},
    });
  }

  get [CiCdGenerator.INSTALL]() {
    return this.asInstallTaskGroup({
      ...super.install,
      async installTemplateTask() {},
    });
  }

  get [CiCdGenerator.POST_INSTALL]() {
    return this.asPostInstallTaskGroup({
      ...super.postInstall,
      async postInstallTemplateTask() {},
    });
  }

  get [CiCdGenerator.END]() {
    return this.asEndTaskGroup({
      ...super.end,
      async endTemplateTask() {},
    });
  }
}
