/**
 * A JHipster Spring Boot gateway and a NodeJS microservice deployed with JHipster's docker-compose generator, like the
 * microservices samples of JHipster: a workspace (the gateway, the microservice and the deployment), each application
 * with the blueprints of its JDL, tested by the ci:e2e scripts of the workspace.
 */
const sample = testFramework => ({
  'sample-file': `microservice-stack-${testFramework}`,
  // Out of the jdl files of the samples folder, which generate-sample --all (build-cache) generates together.
  'sample-folder': 'samples/microservice-stack/',
  'sample-type': 'jdl',
  generatorOptions: { workspaces: true, monorepository: true },
});

export default {
  'microservice-stack-cypress': sample('cypress'),
  'microservice-stack-playwright': sample('playwright'),
};
