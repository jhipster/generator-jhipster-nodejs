import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

describe('SubGenerator docker:bootstrap of nodejs JHipster blueprint', () => {
  describe('deployed with a NodeJS microservice', () => {
    beforeAll(async function () {
      await helpers
        .runJHipster('jhipster:docker-compose')
        .withFiles({
          'notes/.yo-rc.json': {
            'generator-jhipster': {
              baseName: 'notes',
              applicationType: 'microservice',
              prodDatabaseType: 'postgresql',
              serviceDiscoveryType: 'no',
              skipClient: true,
              blueprints: [{ name: 'generator-jhipster-nodejs' }],
            },
          },
          // Each application of the deployment uses its own blueprints: the deployment declares none.
          'docker-compose/.yo-rc.json': { 'generator-jhipster': {} },
          'gateway/.yo-rc.json': {
            'generator-jhipster': { baseName: 'gateway', applicationType: 'gateway', databaseType: 'no', serviceDiscoveryType: 'no' },
          },
        })
        .commitFiles()
        .withOptions({ destinationRoot: 'docker-compose' })
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: '../',
          appsFolders: ['gateway', 'notes'],
          clusteredDbApps: [],
          monitoring: 'no',
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint();
    });

    it('should match the docker-compose.yml', () => {
      expect(result.fs.read(join(result.cwd, 'docker-compose/docker-compose.yml'))).toMatchSnapshot();
    });

    it('should deploy the NodeJS application from the data of its docker compose files', () => {
      result.assertFileContent('docker-compose/docker-compose.yml', '    image: notes\n');
      result.assertFileContent('docker-compose/docker-compose.yml', 'DATABASE_HOST=notes-postgresql');
      result.assertFileContent('docker-compose/docker-compose.yml', 'notes-postgresql:\n    image: postgres');
      result.assertNoFileContent('docker-compose/docker-compose.yml', 'build:');
    });

    it('should not write to the NodeJS application', () => {
      expect(existsSync(join(result.cwd, 'notes/src'))).toBe(false);
      expect(existsSync(join(result.cwd, 'notes/docker'))).toBe(false);
    });

    it('should keep the .yo-rc.json of the applications', () => {
      const blueprintsOf = app => JSON.parse(readFileSync(join(result.cwd, app, '.yo-rc.json'), 'utf8'))['generator-jhipster'].blueprints;
      expect(blueprintsOf('notes')).toEqual([{ name: 'generator-jhipster-nodejs' }]);
      // The blueprint of the deployment is not added to the Spring Boot gateway.
      expect(blueprintsOf('gateway')).toBeUndefined();
    });

    it('should keep the Spring Boot gateway', () => {
      result.assertFileContent('docker-compose/docker-compose.yml', '    image: gateway\n');
    });
  });
});
