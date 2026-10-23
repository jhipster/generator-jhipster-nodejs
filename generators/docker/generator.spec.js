import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'docker';
const BLUEPRINT_NAMESPACE = `jhipster:${SUB_GENERATOR}`;

describe('SubGenerator docker of nodejs JHipster blueprint', () => {
  describe('run', () => {
    beforeAll(async function () {
      await helpers
        .run(BLUEPRINT_NAMESPACE)
        .withJHipsterConfig()
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withBlueprintConfig({});
    });

    it('should succeed', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should publish the application on the loopback interface of the host, like JHipster Spring Boot', () => {
      result.assertFileContent('docker/app.yml', '- 127.0.0.1:8080:8080');
    });

    it('should name the database host like the service of its docker compose files, a deployment prefixing it', () => {
      result.assertFileContent('docker/app.yml', '- DATABASE_HOST=postgresql\n');
    });
  });
});
