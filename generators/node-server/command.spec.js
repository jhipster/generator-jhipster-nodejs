import { describe, expect, it } from 'expect-node';

import command from './command.js';

describe('node-server command', () => {
  it('should import the docker command of JHipster, its oauth2AppSchemes the redirect URIs of the Keycloak realm', () => {
    expect(command.import).toContain('docker');
  });
});
