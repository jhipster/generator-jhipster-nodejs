import { describe, expect, it } from 'vitest';
import { createSecureContext } from 'node:tls';

import { createKeyStore } from 'generator-jhipster/generators/java/support';

describe('the sample keystore of the tls-samples profile', () => {
  it('should be read by the https server of node with the password of the tls-samples profile', () => {
    // The keystore JHipster creates with node:crypto, written by the node-server generator.
    const contents = createKeyStore({ packageName: 'com.mycompany.myapp' });
    expect(() => createSecureContext({ pfx: contents, passphrase: 'password' })).not.toThrow();
  });
});
