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
import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';

import { getGithubSamplesGroup } from 'generator-jhipster/ci';

import { WORKFLOWS, describeChangedSamples, samplesGroupFolder, samplesGroups } from './describe-samples.mjs';

describe('describe-samples', () => {
  it('should list every samples group of the folder', () => {
    const groups = readdirSync(samplesGroupFolder)
      .filter(file => file.endsWith('.js'))
      .map(file => file.replace(/\.js$/, ''));
    expect([...WORKFLOWS].sort()).toEqual(groups.sort());
  });

  it('should read the samples of every workflow synchronously, the ones getGithubSamplesGroup reads', async () => {
    for (const group of WORKFLOWS) {
      expect(samplesGroups[group]).toEqual((await getGithubSamplesGroup(samplesGroupFolder, group)).samples);
    }
  });

  it('should give the samples of the matrix of every workflow for any change', async () => {
    const changed = await describeChangedSamples(['generators/node-server/files.js']);
    expect(Object.keys(changed).sort()).toEqual([...WORKFLOWS].sort());
  });
});
