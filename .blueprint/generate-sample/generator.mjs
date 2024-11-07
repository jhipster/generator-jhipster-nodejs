import { readdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import BaseGenerator from 'generator-jhipster/generators/base';
import { getGithubSamplesGroup } from 'generator-jhipster/testing';

export default class extends BaseGenerator {
  sampleName;
  all;
  samplesFolder;
  sampleType;
  sampleFile;
  generatorOptions;

  constructor(args, opts, features) {
    super(args, opts, { ...features, queueCommandTasks: true, jhipsterBootstrap: false });
  }

  get [BaseGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async copySample() {
        const { samplesFolder, all, sampleName } = this;
        if (all) {
          this.copyTemplate(`${samplesFolder}/*.jdl`, '');
        } else if (extname(sampleName) === '.jdl') {
          this.copyTemplate(join(samplesFolder, sampleName), sampleName, { noGlob: true });
        } else {
          const { samples } = await getGithubSamplesGroup(this.templatePath(), samplesFolder);
          const {
            'sample-type': sampleType,
            'sample-file': sampleFile = sampleName,
            'sample-folder': sampleFolder = samplesFolder,
            generatorOptions,
          } = samples[sampleName];
          this.generatorOptions = generatorOptions;
          if (sampleType === 'jdl') {
            const jdlFile = `${sampleFile}.jdl`;
            this.copyTemplate(join(sampleFolder, jdlFile), jdlFile, { noGlob: true });
          } else if (sampleType === 'yo-rc') {
            this.copyTemplate(join(sampleFolder, sampleFile, '**'), '', {
              fromBasePath: this.templatesPath(sampleFolder, sampleFile),
            });
          }
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.asEndTaskGroup({
      async generateSample() {
        const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url)));
        const projectVersion = `${packageJson.version}-git`;
        const folderFiles = await readdir(this.destinationPath());
        const jdlFiles = folderFiles.filter(file => file.endsWith('.jdl'));

        await this.composeWithJHipster('jdl', {
          generatorArgs: jdlFiles,
          generatorOptions: {
            skipJhipsterDependencies: true,
            insight: false,
            skipChecks: true,
            projectVersion,
            ...this.generatorOptions,
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
