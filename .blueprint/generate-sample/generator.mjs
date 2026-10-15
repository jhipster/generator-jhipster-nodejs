import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractSampleFiles } from 'generator-jhipster/ci';
import BaseCoreGenerator from 'generator-jhipster/generators/base-core';

// The describe-samples module awaits its descriptions at its top level: imported when used, not with this generator,
// which yeoman-environment requires (a required module cannot have a top-level await).
const describeSamples = () => import('../describe-samples/index.mjs');
const root = fileURLToPath(new URL('../../', import.meta.url));

/**
 * Generates a sample of the CI by its name, as `.blueprint/describe-samples` describes it, like the generate-sample of
 * generator-jhipster: writes the files of its project (extractSampleFiles), then generates them with its options, by the
 * jdl generator when it has jdl files, else by its command (the defaultCommand of its .yo-rc.json).
 */
export default class extends BaseCoreGenerator {
  /** @type {string | undefined} */
  samplesGroup;
  /** @type {string} */
  sampleName;
  /** @type {boolean} */
  all;
  /** @type {import('../describe-samples/index.mjs').SampleSummary | undefined} */
  sample;
  /**
   * The files of the project of the sample, its inline jdl as files.
   * @type {import('generator-jhipster/ci').SampleFile[]}
   */
  sampleFiles = [];

  get [BaseCoreGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async copySample() {
        const { describeSample, samplesGroupFolder } = await describeSamples();
        if (this.all) {
          // Every jdl of the samples folder, generated together in a workspace (the npm cache of the CI).
          this.copyTemplate('*.jdl', '', { fromBasePath: join(samplesGroupFolder, 'samples') });
          return;
        }
        const sample = describeSample(this.sampleName);
        if (this.samplesGroup && sample.workflow !== this.samplesGroup) {
          throw new Error(`Sample ${this.sampleName} belongs to the ${sample.workflow} samples group, not to ${this.samplesGroup}`);
        }
        this.sample = sample;
        this.sampleFiles = extractSampleFiles(sample, { root });
        for (const file of this.sampleFiles) {
          if ('source' in file) {
            this.copyTemplate(file.source, file.destination, { noGlob: true });
          } else {
            this.writeDestination(file.destination, file.contents);
          }
        }
      },
    });
  }

  get [BaseCoreGenerator.END]() {
    return this.asAnyTaskGroup({
      async generateSample() {
        const generatorOptions = this.getDefaultComposeOptions();
        if (this.all) {
          const jdlFiles = (await readdir(this.destinationPath())).filter(file => file.endsWith('.jdl'));
          await this.composeWithJHipster('jdl', {
            generatorArgs: jdlFiles,
            generatorOptions: { ...generatorOptions, workspaces: true, monorepository: true },
          });
          return;
        }
        // The jdl files of the project, the inline ones included, which the jdl generator concatenates.
        const jdlFiles = this.sampleFiles.map(file => file.destination).filter(destination => extname(destination) === '.jdl');
        const sampleOptions = { ...generatorOptions, ...this.sample.generatorOptions };
        if (jdlFiles.length > 0) {
          await this.composeWithJHipster('jdl', { generatorArgs: jdlFiles, generatorOptions: { ...sampleOptions, skipInstall: true } });
        } else {
          await this.composeWithJHipster(this.sample.defaultCommand, { generatorOptions: sampleOptions });
        }
      },
      async jhipsterInfo() {
        await this.composeWithJHipster('info');
      },
    });
  }

  getDefaultComposeOptions() {
    const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), { encoding: 'utf-8' }));
    return {
      skipJhipsterDependencies: true,
      projectVersion: `${packageJson.version}-git`,
    };
  }
}
