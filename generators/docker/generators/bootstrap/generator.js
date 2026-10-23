import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { mutateData } from 'generator-jhipster/utils';

/** The database service of the application, when it has one. */
const databaseServiceOf = ({ databaseTypeSql, databaseTypeMongodb, prodDatabaseType, databaseType }) =>
  databaseTypeSql ? prodDatabaseType : databaseTypeMongodb ? databaseType : undefined;

/**
 * The docker compose file of the NodeJS application, `app`, as its data: the docker generator merges it into the app.yml
 * it writes, a deployment (JHipster's docker-compose generator) into the app.yml template of JHipster, instead of reading
 * the app.yml of the application.
 */
export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      appService({ application }) {
        // The app service of the NodeJS application, which JHipster prepares (its docker compose file, its service of a
        // deployment) and writes (app.yml) like the one of a Spring Boot application.
        if (!application.dockerServices.includes('app')) application.dockerServices.push('app');
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING]() {
    return this.asPostPreparingTaskGroup({
      environment({ application }) {
        const database = databaseServiceOf(application);
        // The variables of the application, the hosts named like the services of its docker compose files, like JHipster
        // Spring Boot; a deployment names them with its prefix (notes-postgresql). At POST_PREPARING, like Spring Boot: the
        // derived properties (serviceDiscoveryEureka) are prepared by the other bootstraps during PREPARING.
        mutateData(application.dockerApplicationEnvironment, {
          BACKEND_ENV: 'prod,api-docs,secret-samples',
          ...(database ? { DATABASE_HOST: database } : {}),
          ...(application.serviceDiscoveryEureka
            ? {
                EUREKA_CLIENT_ENABLED: 'true',
                CLOUD_CONFIG_URI: 'http://admin:$${jhipster.registry.password}@jhipster-registry:8761/config',
              }
            : {}),
          ...(application.authenticationTypeOauth2 ? { NODE_CLIENT_PROVIDER_OIDC_ISSUER_URI: 'http://keycloak:9080/realms/jhipster' } : {}),
        });
        // The healthcheck of the app service in its docker compose file and in a deployment: the NodeJS image has no bash.
        application.dockerApplicationHealthcheckCommand = `node -e "fetch('http://localhost:${application.serverPort}/management/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"`;
        if (database) {
          mutateData(application.dockerDeploymentEnvironment, {
            DATABASE_HOST: `${application.dockerDeploymentServicePrefix}${database}`,
          });
        }
      },
    });
  }
}
