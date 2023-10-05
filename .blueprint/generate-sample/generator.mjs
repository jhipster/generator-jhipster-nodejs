import { readdir } from 'node:fs/promises';
import BaseGenerator from 'generator-jhipster/generators/base';
import command from './command.mjs';

export default class extends BaseGenerator {
  sampleName;
  templateName;

  get [BaseGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async initializeOptions() {
        this.parseJHipsterCommand(command);
      },
    });
  }

  get [BaseGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup({
      async askForSample() {
        if (!this.sampleName) {
          const answers = await this.prompt({
            type: 'list',
            name: 'sampleName',
            message: 'which sample do you want to generate?',
            choices: async () => readdir(this.templatePath('samples')),
          });
          this.sampleName = answers.sampleName;
        }
      },
    });
  }

  get [BaseGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async copySample() {
        this.copyTemplate(`samples/${this.sampleName}/{.,}**`, '');

        if (this.sampleName.includes('-template-')) {
          if (!this.templateName) {
            throw new Error('Template name is required');
          }

          const clientFrameworks = ['angular', 'vue', 'react'];
          const authenticationTypes = ['jwt', 'oauth2'];
          const databaseTypes = ['mysql', 'mssql', 'postgresql', 'mongodb'];

          const split = this.templateName.split('-');

          this._.intersection(clientFrameworks, split);
          const clientFramework = this._.intersection(clientFrameworks, split)[0];
          const authenticationType = this._.intersection(authenticationTypes, split)[0];
          const databaseType = this._.intersection(databaseTypes, split)[0];

          if (clientFramework) {
            this.editFile(`${this.sampleName}.jdl`, content => content.replace('REPLACE_CLIENT_FRAMEWORK', clientFramework));
          }
          if (authenticationType) {
            this.editFile(`${this.sampleName}.jdl`, content => content.replace('REPLACE_AUTH', authenticationType));
          }
          if (databaseType) {
            this.editFile(`${this.sampleName}.jdl`, content => content.replace('REPLACE_PROD_DATABASE_TYPE', databaseType));
          }
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.asEndTaskGroup({
      async generateSample() {
        const generator = this.sampleName.endsWith('-jdl') ? 'jdl' : 'app';
        const generatorArgs = this.sampleName.endsWith('-jdl') ? [this.sampleName] : undefined;
        await this.composeWithJHipster(generator, {
          generatorArgs,
          generatorOptions: {
            skipJhipsterDependencies: true,
            insight: false,
            skipChecks: true,
            skipInstall: true,
          },
        });
      },
      async jhipsterInfo() {
        await this.composeWithJHipster('info');
      },
    });
  }
}
