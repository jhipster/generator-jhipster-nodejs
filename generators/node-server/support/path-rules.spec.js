import { describe, expect, it } from 'expect-node';

import { nodejsPathRules } from './path-rules.js';

/** The rules as `METHODS pattern access`, in their order. */
const rulesOf = application =>
  nodejsPathRules(application).map(({ methods, pattern, access }) => `${methods ? `${methods.join(',')} ` : ''}${pattern} ${access}`);

describe('nodejsPathRules', () => {
  const jwtBackend = { skipClient: true, authenticationTypeJwt: true, generateUserManagement: true, generateUserRegistration: true };

  it('should give the rules of JHipster Spring Boot, in their order, to a JWT application without client', () => {
    expect(rulesOf(jwtBackend)).toEqual([
      'POST,GET /api/authenticate permitAll',
      '/api/register permitAll',
      '/api/activate permitAll',
      '/api/account/reset-password/init permitAll',
      '/api/account/reset-password/finish permitAll',
      '/api/admin/** admin',
      '/api/** authenticated',
      '/v3/api-docs/** admin',
      '/management/health permitAll',
      '/management/health/** permitAll',
      '/management/info permitAll',
      '/management/prometheus permitAll',
      '/management/** admin',
    ]);
  });

  it('should not permit the registration when the users are created by an administrator only', () => {
    const rules = rulesOf({ ...jwtBackend, generateUserRegistration: false });
    expect(rules).not.toContain('/api/register permitAll');
    expect(rules).not.toContain('/api/activate permitAll');
    expect(rules).toContain('/api/account/reset-password/init permitAll');
  });

  it('should permit the files of the client of its bundler, before the API', () => {
    const rules = rulesOf({ ...jwtBackend, skipClient: false, clientBundlerVite: true });
    expect(rules.slice(0, 3)).toEqual(['/index.html permitAll', '/*.js permitAll', '/*.txt permitAll']);
    expect(rules).toContain('/assets/** permitAll');
    expect(rules).not.toContain('/content/** permitAll');
    expect(rules.indexOf('/swagger-ui/** permitAll')).toBeLessThan(rules.indexOf('/api/** authenticated'));
  });

  it('should permit the login and the logout of the sessions first, by POST only', () => {
    const rules = rulesOf({ skipClient: true, authenticationTypeSession: true, generateUserManagement: true });
    expect(rules.slice(0, 2)).toEqual(['POST /api/authentication permitAll', 'POST /api/logout permitAll']);
  });

  it('should permit the OAuth2 login of the applications with the login only', () => {
    const login = ['/oauth2/authorization/** permitAll', '/login/oauth2/code/** permitAll'];
    const oauth2 = { skipClient: true, authenticationTypeOauth2: true, authenticationUsesCsrf: true };
    expect(rulesOf({ ...oauth2, generateAuthenticationApi: true }).slice(0, 2)).toEqual(login);
    const microservice = rulesOf(oauth2);
    expect(microservice).not.toContain(login[0]);
    expect(microservice).not.toContain(login[1]);
    expect(microservice).toContain('/api/auth-info permitAll');
  });

  it('should protect the paths of the microservices of a gateway', () => {
    const rules = rulesOf({ ...jwtBackend, applicationTypeGateway: true });
    expect(rules).toContain('/services/*/management/health/readiness permitAll');
    expect(rules.indexOf('/services/*/v3/api-docs admin')).toBeLessThan(rules.indexOf('/services/** authenticated'));
  });
});
