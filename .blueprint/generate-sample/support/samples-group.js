import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const getBlueprintSamplesGroup = async (samplesGroupFolder, group) => {
  let samples = {};
  const warnings = [];
  const samplesFolderContent = await readdir(samplesGroupFolder);
  const availableGroups = samplesFolderContent.filter(sample => !sample.startsWith('_') && ['.json', '.js', '.ts', ''].includes(extname(sample)));
  const groupExt = ['js', 'ts', 'json'].find(ext => availableGroups.includes(`${group}.${ext}`));

  if (groupExt === 'js' || groupExt === 'ts') {
    const groupModule = await import(pathToFileURL(join(samplesGroupFolder, `${group}.${groupExt}`)).href);
    samples = Object.fromEntries(Object.entries(groupModule.default).map(([sample, value]) => [sample, { ...value, 'samples-group': group }]));
  } else if (groupExt === 'json') {
    const jsonFile = await readFile(join(samplesGroupFolder, `${group}.json`));
    samples = Object.fromEntries(
      Object.entries(JSON.parse(jsonFile.toString())).map(([sample, value]) => [sample, { ...value, 'samples-group': group }]),
    );
  } else if (availableGroups.includes(group)) {
    const groupFolderContent = await readdir(join(samplesGroupFolder, group));
    samples = Object.fromEntries(
      groupFolderContent
        .filter(sample => ['', '.jdl'].includes(extname(sample)))
        .map(sample => [
          sample.replace('.jdl', ''),
          {
            'samples-group': group,
            'sample-type': extname(sample) === '.jdl' ? 'jdl' : 'yo-rc',
          },
        ]),
    );
  }

  if (!samples || Object.keys(samples).length === 0) {
    throw new Error(`Sample group ${group} not found in ${samplesGroupFolder}`);
  }

  return { samples, warnings };
};
