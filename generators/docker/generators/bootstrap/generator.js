import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

const SERVICE_HEALTHY = 'service_healthy';

/**
 * The docker compose file of the NodeJS application, `app`, as its data: the docker generator merges it into the app.yml
 * it writes, a deployment (JHipster's docker-compose generator) into the app.yml template of JHipster, instead of reading
 * the app.yml of the application.
 */
export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup({
      app({ application }) {
        const { lowercaseBaseName, serverPort, prodDatabaseType, databaseType, databaseTypeSql } = application;
        const database = databaseTypeSql ? prodDatabaseType : databaseType;
        // The services the application waits for, like the ones JHipster adds to the app.yml of a Spring Boot application.
        const dependencies = [
          [database, application.databaseTypeSql || application.databaseTypeMongodb],
          ['keycloak', application.authenticationTypeOauth2],
          ['jhipster-registry', application.serviceDiscoveryEureka],
        ];
        const dependsOn = Object.fromEntries(
          dependencies.filter(([, enabled]) => enabled).map(([serviceName]) => [serviceName, { condition: SERVICE_HEALTHY }]),
        );
        application.dockerComposeFiles.app = {
          source: 'app.yml.ejs',
          data: {
            name: lowercaseBaseName,
            services: {
              app: {
                image: lowercaseBaseName,
                environment: [
                  'BACKEND_ENV=prod,api-docs,secret-samples',
                  `DATABASE_HOST=${database}`,
                  ...(application.serviceDiscoveryEureka
                    ? [
                        'EUREKA_CLIENT_ENABLED=true',
                        'CLOUD_CONFIG_URI=http://admin:$${jhipster.registry.password}@jhipster-registry:8761/config',
                      ]
                    : []),
                  ...(application.authenticationTypeOauth2
                    ? ['NODE_CLIENT_PROVIDER_OIDC_ISSUER_URI=http://keycloak:9080/realms/jhipster']
                    : []),
                ],
                // Published on the loopback interface of the host only, like the app.yml of JHipster Spring Boot.
                ...(application.applicationTypeMonolith || application.applicationTypeGateway
                  ? { ports: [`127.0.0.1:${serverPort}:${serverPort}`] }
                  : {}),
                healthcheck: {
                  test: [
                    'CMD',
                    'node',
                    '-e',
                    `fetch('http://localhost:${serverPort}/management/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))`,
                  ],
                  interval: '5s',
                  timeout: '5s',
                  retries: 10,
                },
                ...(Object.keys(dependsOn).length > 0 ? { depends_on: dependsOn } : {}),
              },
            },
          },
        };
      },
    });
  }
}
