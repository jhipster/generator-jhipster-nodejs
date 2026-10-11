import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const appYml = `name: notes
services:
  app:
    image: notes
    build: ..
    environment:
      - BACKEND_ENV=prod
      - DATABASE_HOST=postgresql
    depends_on:
      postgresql:
        condition: service_healthy
`;

const postgresqlYml = `name: notes
services:
  postgresql:
    image: postgres:18.6
    ports:
      - 127.0.0.1:5432:5432
`;

const gatewayAppYml = `name: gateway
services:
  app:
    image: gateway
    ports:
      - 127.0.0.1:8080:8080
`;

describe('SubGenerator docker-compose of nodejs JHipster blueprint', () => {
  describe('with a NodeJS microservice', () => {
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
          // Like a deployment generated with the JHipster CLI, the blueprint is in the deployment configuration.
          'docker-compose/.yo-rc.json': { 'generator-jhipster': { blueprints: [{ name: 'generator-jhipster-nodejs' }] } },
          'gateway/.yo-rc.json': {
            'generator-jhipster': { baseName: 'gateway', applicationType: 'gateway', databaseType: 'no', serviceDiscoveryType: 'no' },
          },
          'gateway/src/main/docker/app.yml': gatewayAppYml,
          'notes/docker/app.yml': appYml,
          'notes/docker/postgresql.yml': postgresqlYml,
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

    it('should use the Docker Compose files of the NodeJS application', () => {
      result.assertFileContent('docker-compose/docker-compose.yml', '    image: notes\n');
      result.assertFileContent('docker-compose/docker-compose.yml', 'DATABASE_HOST=notes-postgresql');
      result.assertFileContent('docker-compose/docker-compose.yml', 'notes-postgresql:\n    image: postgres');
      result.assertNoFileContent('docker-compose/docker-compose.yml', 'build:');
    });

    it('should not write the copies of the Docker Compose files', () => {
      expect(existsSync(join(result.cwd, 'notes/docker/app.yml'))).toBe(true);
      expect(existsSync(join(result.cwd, 'notes/src'))).toBe(false);
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
