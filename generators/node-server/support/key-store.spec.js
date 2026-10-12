import { describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSecureContext } from 'node:tls';

import { createSampleKeyStore } from './key-store.js';

describe('createSampleKeyStore', () => {
  it('should create a keystore the https server of node reads with the password of the tls-samples profile', async () => {
    const folder = await mkdtemp(join(tmpdir(), 'keystore-'));
    try {
      const { contents } = await createSampleKeyStore(join(folder, 'keystore-samples.p12'), { packageName: 'com.mycompany.myapp' });
      expect(contents).toBeInstanceOf(Buffer);
      expect(() => createSecureContext({ pfx: contents, passphrase: 'password' })).not.toThrow();
    } finally {
      await rm(folder, { recursive: true, force: true });
    }
  });
});
