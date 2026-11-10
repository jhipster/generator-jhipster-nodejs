/**
 * @typedef {'permitAll' | 'authenticated' | 'admin'} PathAccess
 * @typedef {{ methods?: string[]; pattern: string; access: PathAccess; regExp: string }} PathRule
 */

/** Escapes the characters of a regular expression literal, its slashes included. */
const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/**
 * The regular expression literal of a path pattern of Spring (PathPattern), case insensitive like the routes of Express:
 * `**` as the last segment any number of segments, none included, `*` any characters of a segment. A trailing slash is
 * allowed, as Express routes a path with one to the route without it.
 * @param {string} pattern a pattern like `/api/admin/**` or `/*.js`
 * @returns {string}
 */
export const pathPatternRegExp = pattern => {
  const segments = pattern.split('/').slice(1);
  const anySegments = segments.at(-1) === '**';
  const path = (anySegments ? segments.slice(0, -1) : segments)
    .map(segment => `\\/${segment.split('*').map(escapeRegExp).join('[^/]*')}`)
    .join('');
  return `/^${path}${anySegments ? '(?:\\/.*)?' : '\\/?'}$/i`;
};

/**
 * The access rules of the paths of the server, in their order, the first one matching a request deciding: the rules of
 * the SecurityConfiguration of JHipster Spring Boot, with the same conditions, preceded by the paths of the login and of
 * the logout, which its filters handle before them. Without a client, a path matching no rule is denied, like Spring
 * Security, which then tells nothing of the routes of the server.
 * @param {Record<string, any>} application
 * @returns {PathRule[]}
 */
export const nodejsPathRules = ({
  skipClient,
  clientBundlerVite,
  clientBundlerEsbuild,
  clientBundlerRsbuild,
  authenticationTypeJwt,
  authenticationTypeSession,
  authenticationTypeOauth2,
  authenticationUsesCsrf,
  generateAuthenticationApi,
  applicationTypeGateway,
  microfrontend,
  communicationSpringWebsocket,
  generateUserManagement,
  generateUserRegistration,
}) => {
  /** @type {Omit<PathRule, 'regExp'>[]} */
  const rules = [];
  const permitAll = (...patterns) => rules.push(...patterns.map(pattern => ({ pattern, access: 'permitAll' })));

  if (authenticationTypeSession) {
    // The form login and the logout of Spring Security, before its authorization.
    rules.push({ methods: ['POST'], pattern: '/api/authentication', access: 'permitAll' });
    rules.push({ methods: ['POST'], pattern: '/api/logout', access: 'permitAll' });
  }
  if (authenticationTypeOauth2 && authenticationUsesCsrf && generateAuthenticationApi) {
    // The OAuth2 login of Spring Security, before its authorization: a microservice has none.
    permitAll('/oauth2/authorization/**', '/login/oauth2/code/**');
  }
  if (!skipClient) {
    permitAll('/index.html', '/*.js', '/*.txt', '/*.json', '/*.map', '/*.css');
    permitAll('/*.ico', '/*.png', '/*.svg', '/*.webapp');
    if (clientBundlerVite) {
      permitAll('/assets/**');
    } else if (clientBundlerEsbuild) {
      permitAll('/content/**', '/resources/**');
    } else if (clientBundlerRsbuild) {
      permitAll('/static/**', '/content/**');
    } else {
      permitAll('/app/**', '/i18n/**', '/content/**');
    }
    permitAll('/swagger-ui/**');
  }
  if (authenticationTypeJwt) {
    rules.push({ methods: ['POST', 'GET'], pattern: '/api/authenticate', access: 'permitAll' });
  } else {
    permitAll('/api/authenticate');
  }
  if (generateUserManagement) {
    if (generateUserRegistration) {
      permitAll('/api/register', '/api/activate');
    }
    permitAll('/api/account/reset-password/init', '/api/account/reset-password/finish');
  }
  if (authenticationTypeOauth2) {
    permitAll('/api/auth-info');
  }
  rules.push({ pattern: '/api/admin/**', access: 'admin' });
  rules.push({ pattern: '/api/**', access: 'authenticated' });
  if (applicationTypeGateway) {
    if (microfrontend) {
      permitAll('/services/*/*.js', '/services/*/*.txt', '/services/*/*.json', '/services/*/i18n/*.json', '/services/*/*.js.map');
    }
    permitAll('/services/*/management/health/readiness');
    rules.push({ pattern: '/services/*/v3/api-docs', access: 'admin' });
    rules.push({ pattern: '/services/**', access: 'authenticated' });
  }
  if (communicationSpringWebsocket) {
    rules.push({ pattern: '/websocket/**', access: 'authenticated' });
  }
  rules.push({ pattern: '/v3/api-docs/**', access: 'admin' });
  permitAll('/management/health', '/management/health/**', '/management/info', '/management/prometheus');
  rules.push({ pattern: '/management/**', access: 'admin' });

  return rules.map(rule => ({ ...rule, regExp: pathPatternRegExp(rule.pattern) }));
};
