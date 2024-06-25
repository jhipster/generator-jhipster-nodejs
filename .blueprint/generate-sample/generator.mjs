import { readdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import BaseGenerator from 'generator-jhipster/generators/base';

export default class extends BaseGenerator {
  sampleName;
  all;
  samplesFolder;

  constructor(args, opts, features) {
    super(args, opts, { ...features, jhipsterBootstrap: false });
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async parseCommand() {
        await this.parseCurrentJHipsterCommand();
      },
    });
  }

  get [BaseGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup({
      async askForSample() {
        await this.promptCurrentJHipsterCommand();
      },
    });
  }

  get [BaseGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      async loadCommand() {
        await this.loadCurrentJHipsterCommandConfig(this);
      },
    });
  }

  get [BaseGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async copySample() {
        if (this.all) {
          this.copyTemplate(`${this.samplesFolder}/*.jdl`, '');
        } else {
          this.copyTemplate(`${this.samplesFolder}/${this.sampleName}`, this.sampleName, { noGlob: true });
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.asEndTaskGroup({
      async generateSample() {
        const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url)));
        const projectVersion = `${packageJson.version}-git`;

        await this.composeWithJHipster('jdl', {
          generatorArgs: this.all ? await readdir(this.templatePath('samples')) : [this.sampleName],
          generatorOptions: {
            skipJhipsterDependencies: true,
            insight: false,
            skipChecks: true,
            projectVersion,
            ...(this.all ? { workspaces: true, monorepository: true } : { skipInstall: true }),
          },
        });
      },
      async jhipsterInfo() {
        await this.composeWithJHipster('info');
      },
    });
  }
}
