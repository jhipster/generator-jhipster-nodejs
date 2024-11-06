import assert from 'node:assert';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { intersection } from 'lodash-es';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const prepareSample = sample => {
  const clientFrameworks = ['angular', 'vue', 'react'];
  const authenticationTypes = ['jwt', 'oauth2'];
  const prodDatabaseTypes = ['mysql', 'mssql', 'postgresql'];

  let split = sample.split('-');
  if (!split.includes('jdl')) {
    assert(existsSync(path.join(__dirname, '../templates/samples', `${sample}`)), `The sample ${sample} does not exist.`);
    return {
      'sample-file': sample,
      'sample-folder': 'samples/',
      'sample-type': 'yo-rc',
    };
  }

  intersection(clientFrameworks, split);
  const clientFramework = intersection(clientFrameworks, split)[0];
  const authenticationType = intersection(authenticationTypes, split)[0];
  const prodDatabaseType = intersection(prodDatabaseTypes, split)[0];
  split = split
    .filter(s => s !== 'jdl')
    .map(s => (s === clientFramework ? 'client' : s === authenticationType ? 'auth' : s === prodDatabaseType ? 'database' : s));

  const extraArgs = [
    ...(clientFramework ? [`--client-framework ${clientFramework}`] : []),
    ...(authenticationType ? [`--auth ${authenticationType}`] : []),
    ...(prodDatabaseType ? [`--prod-database-type ${prodDatabaseType}`] : []),
  ];

  const sampleFile = [...split, 'template', 'jdl'].join('-');
  const file = path.join(__dirname, '../templates/samples', `${sampleFile}.jdl`);
  assert(existsSync(file), `The sample ${file} does not exist.`);

  return {
    'sample-file': sampleFile,
    'sample-folder': 'samples/',
    'extra-args': extraArgs.join(' '),
    'sample-type': 'jdl',
  };
};
