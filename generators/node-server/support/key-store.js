import * as javaSupport from 'generator-jhipster/generators/java/support';

/**
 * The contents of the sample keystore of the tls-samples profile, like the one of JHipster Spring Boot: a PKCS#12 file
 * with the public password `password`, holding a self-signed certificate under the `selfsigned` alias. Created with
 * node:crypto by the versions of generator-jhipster that have createKeyStore, else with the keytool of a JDK, which
 * gives a warning without a JDK.
 */
export const createSampleKeyStore = async (keyStoreFile, { packageName }) => {
  // TODO remove the keytool fallback with generator-jhipster 9.5.0, which creates the keystore with node:crypto.
  if (javaSupport.createKeyStore) {
    return { contents: javaSupport.createKeyStore({ packageName }), result: {} };
  }
  return javaSupport.generateKeyStoreContents(keyStoreFile, { packageName });
};
