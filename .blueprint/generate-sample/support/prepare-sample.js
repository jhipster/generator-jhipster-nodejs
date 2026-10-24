import assert from 'node:assert';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { intersection } from 'lodash-es';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The runner of the MongoDB samples: MongoDB 8 and 9 refuse to start on the Linux kernels 6.19 to 7.0.13
 * (https://jira.mongodb.org/browse/SERVER-125742), the kernel 7.0.0 of the ubuntu-24.04 runner (ubuntu-latest) since its
 * image 20261018; ubuntu-22.04 has the kernel 6.8. Back to ubuntu-latest once its kernel is 7.0.14 or newer.
 */
const MONGODB_RUNNER_OS = 'ubuntu-22.04';

export const prepareSampleEntry = sampleData => {
  const [sample, data = {}] = Array.isArray(sampleData) ? sampleData : [sampleData];
  const clientFrameworks = ['angular', 'vue', 'react'];
  const authenticationTypes = ['jwt', 'oauth2', 'session'];
  const databaseTypes = ['mysql', 'mssql', 'postgresql', 'mongodb'];

  let split = sample.split('-');
  if (!split.includes('jdl')) {
    assert(existsSync(path.join(__dirname, '../templates/samples', `${sample}`)), `The sample ${sample} does not exist.`);
    return [
      sample,
      {
        'sample-file': sample,
        'sample-folder': 'samples/',
        'sample-type': 'yo-rc',
        ...data,
      },
    ];
  }

  const clientFramework = intersection(clientFrameworks, split)[0];
  const authenticationType = intersection(authenticationTypes, split)[0];
  const databaseType = intersection(databaseTypes, split)[0];
  split = split
    .filter(s => s !== 'jdl')
    .map(s => (s === clientFramework ? 'client' : s === authenticationType ? 'auth' : s === databaseType ? 'database' : s));

  const generatorOptions = {};

  if (clientFramework) {
    generatorOptions.clientFramework = clientFramework;
  }
  if (authenticationType) {
    generatorOptions.authenticationType = authenticationType;
  }
  if (databaseType) {
    generatorOptions.prodDatabaseType = databaseType;
  }

  const sampleFile = [...split, 'template', 'jdl'].join('-');
  const file = path.join(__dirname, '../templates/samples', `${sampleFile}.jdl`);
  assert(existsSync(file), `The sample ${file} does not exist.`);

  return [
    sample,
    {
      'sample-file': sampleFile,
      'sample-folder': 'samples/',
      'sample-type': 'jdl',
      generatorOptions,
      ...(databaseType === 'mongodb' ? { os: MONGODB_RUNNER_OS } : {}),
      ...data,
    },
  ];
};
