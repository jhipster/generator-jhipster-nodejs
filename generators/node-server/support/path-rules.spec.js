import { describe, expect, it } from 'expect-node';

import { nodejsPathRules, pathPatternRegExp } from './path-rules.js';

/** The regular expression of a literal, as the template renders it. */
const literalRegExp = literal => new Function(`return ${literal};`)();

const regExpOf = pattern => literalRegExp(pathPatternRegExp(pattern));

/** The access the first rule matching a request gives, undefined when none matches. */
const accessOf = (rules, method, path) =>
  rules.find(({ methods, regExp }) => (!methods || methods.includes(method)) && literalRegExp(regExp).test(path))?.access;

describe('pathPatternRegExp', () => {
  it('should match the paths under a ** pattern, its own path included, whatever their case', () => {
    const regExp = regExpOf('/api/admin/**');
    expect(['/api/admin', '/api/admin/', '/api/admin/users/x', '/API/Admin/users'].map(path => regExp.test(path))).toEqual([
      true,
      true,
      true,
      true,
    ]);
    expect(['/api/administration', '/api', '/x/api/admin'].map(path => regExp.test(path))).toEqual([false, false, false]);
  });

  it('should match one path with a trailing slash, like the routes of Express', () => {
    const regExp = regExpOf('/management/info');
    expect(['/management/info', '/management/info/', '/management/info/x', '/management/infos'].map(path => regExp.test(path))).toEqual([
      true,
      true,
      false,
      false,
    ]);
  });

  it('should match a * within a segment only, and the dots literally', () => {
    const regExp = regExpOf('/services/*/*.js');
    expect(['/services/app/main.js', '/services/app/x/main.js', '/services/app/mainxjs'].map(path => regExp.test(path))).toEqual([
      true,
      false,
      false,
    ]);
  });
});

describe('nodejsPathRules', () => {
  const jwtBackend = { skipClient: true, authenticationTypeJwt: true, generateUserManagement: true, generateUserRegistration: true };

  it('should give the access of JHipster Spring Boot to the paths of a JWT application without client', () => {
    const rules = nodejsPathRules(jwtBackend);
    expect(
      [
        ['POST', '/api/authenticate'],
        ['DELETE', '/api/authenticate'],
        ['POST', '/api/register'],
        ['GET', '/api/admin/users'],
        ['GET', '/api/nothing'],
        ['GET', '/management/health/readiness'],
        ['GET', '/management/env'],
        ['GET', '/v3/api-docs'],
        ['GET', '/index.html'],
        ['GET', '/nothing'],
      ].map(([method, path]) => accessOf(rules, method, path)),
    ).toEqual(['permitAll', 'authenticated', 'permitAll', 'admin', 'authenticated', 'permitAll', 'admin', 'admin', undefined, undefined]);
  });

  it('should not permit the registration when the users are created by an administrator only', () => {
    const rules = nodejsPathRules({ ...jwtBackend, generateUserRegistration: false });
    expect(['/api/register', '/api/activate', '/api/account/reset-password/init'].map(path => accessOf(rules, 'POST', path))).toEqual([
      'authenticated',
      'authenticated',
      'permitAll',
    ]);
  });

  it('should permit the files of the client of its bundler', () => {
    const rules = nodejsPathRules({ ...jwtBackend, skipClient: false, clientBundlerVite: true });
    expect(['/index.html', '/main.js', '/assets/x.css', '/content/x.css'].map(path => accessOf(rules, 'GET', path))).toEqual([
      'permitAll',
      'permitAll',
      'permitAll',
      undefined,
    ]);
  });

  it('should permit the login and the logout of the sessions before the API', () => {
    const rules = nodejsPathRules({ skipClient: true, authenticationTypeSession: true, generateUserManagement: true });
    expect(
      [
        ['POST', '/api/authentication'],
        ['POST', '/api/logout'],
        ['GET', '/api/logout'],
      ].map(([method, path]) => accessOf(rules, method, path)),
    ).toEqual(['permitAll', 'permitAll', 'authenticated']);
  });

  it('should permit the OAuth2 login of the applications with the login only', () => {
    const paths = ['/oauth2/authorization/oidc', '/login/oauth2/code/oidc', '/api/auth-info'];
    const accessesOf = application => paths.map(path => accessOf(nodejsPathRules({ skipClient: true, ...application }), 'GET', path));
    expect(accessesOf({ authenticationTypeOauth2: true, authenticationUsesCsrf: true, generateAuthenticationApi: true })).toEqual([
      'permitAll',
      'permitAll',
      'permitAll',
    ]);
    expect(accessesOf({ authenticationTypeOauth2: true, authenticationUsesCsrf: true })).toEqual([undefined, undefined, 'permitAll']);
  });
});
