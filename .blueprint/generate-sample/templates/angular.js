import { prepareSampleEntry } from '../support/prepare-sample.js';

const samples = [
  'monolith-angular-jwt-jdl',
  'monolith-angular-jwt-i18n-jdl',
  'monolith-angular-oauth2-jdl',
  ['monolith-angular-session-jdl', { generatorOptions: { skipUserRegistration: true } }],
  ['monolith-angular-oauth2-mongodb-jdl', { e2e: 'false' }],
  'monolith-angular-oauth2-i18n-jdl',
  'monolith-angular-jwt-i18n-dev',
  ['monolith-angular-jwt-mongodb-jdl', { e2e: 'false' }],
  // Disabled due to https://github.com/jhipster/generator-jhipster/issues/28258
  // 'monolith-angular-mssql-prod-jdl',
  'monolith-angular-postgresql-prod-jdl',
];

export default {
  ...Object.fromEntries(samples.map(sample => prepareSampleEntry(sample))),
  // The entities of the parity of the backends with JHipster Spring Boot: the jdl files of jdl-entities/ next to
  // the one of the application. Without a client, like the case it measures: disabled, out of the matrix of this
  // workflow, which tests a client.
  'monolith-jwt-jdl-entities': {
    'sample-folder': 'samples/',
    'sample-type': 'jdl',
    'jdl-entities': 'jdl-entities',
    disabled: true,
  },
};
