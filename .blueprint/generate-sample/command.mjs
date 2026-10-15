/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @type {import('generator-jhipster').JHipsterCommandDefinition}
 */
const command = {
  arguments: {
    sampleName: {
      description: 'The sample to generate, by its name: unique across the samples groups',
      type: String,
    },
  },
  configs: {
    samplesGroup: {
      description: 'The samples group of the sample, checked when given (the CI gives it)',
      cli: {
        type: String,
      },
      scope: 'generator',
    },
    sampleName: {
      prompt: gen => ({
        when: !gen.all,
        type: 'select',
        message: 'which sample do you want to generate?',
        // The describe-samples module awaits its descriptions at its top level, imported when the choices are asked.
        choices: async () => {
          const { describeSampleGroups } = await import('../describe-samples/index.mjs');
          return Object.values(describeSampleGroups()).flatMap(group => group.samples);
        },
      }),
      scope: 'generator',
    },
    all: {
      description: 'Generate every jdl of the samples folder in a workspace',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
  },
  import: ['app'],
};

export default command;
