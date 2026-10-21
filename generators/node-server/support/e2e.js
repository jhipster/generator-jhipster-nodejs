/**
 * The health endpoint the end-to-end tests wait for (ci:server:await), like JHipster Spring Boot: a microservice through
 * its gateway, which the end-to-end tests of its microfrontend run against (its own port is not published by a
 * docker-compose deployment), the other applications on their own port.
 * @param {{ applicationTypeMicroservice?: boolean; gatewayServerPort?: number; endpointPrefix?: string }} application
 * @returns {string}
 */
export const serverAwaitEndpoint = ({ applicationTypeMicroservice, gatewayServerPort = 8080, endpointPrefix }) =>
  applicationTypeMicroservice
    ? `http-get://127.0.0.1:${gatewayServerPort}/${endpointPrefix}/management/health/readiness`
    : 'http-get://127.0.0.1:$npm_package_config_backend_port/management/health';
