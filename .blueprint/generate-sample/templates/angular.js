import { prepareSampleEntry } from '../support/prepare-sample.js';

const samples = [
  'monolith-angular-jwt-jdl',
  'monolith-angular-jwt-i18n-jdl',
  'monolith-angular-oauth2-jdl',
  ['monolith-angular-oauth2-mongodb-jdl', { 'legacy-sample-file': 'monolith-angular-auth-mongodb-template-jdl', e2e: 'false' }],
  'monolith-angular-oauth2-i18n-jdl',
  'monolith-angular-jwt-i18n-dev',
  ['monolith-angular-jwt-mongodb-jdl', { 'legacy-sample-file': 'monolith-client-auth-database-template-jdl', e2e: 'false' }],
  // 'monolith-angular-mssql-prod-jdl',
  'monolith-angular-postgresql-prod-jdl',
];

export default Object.fromEntries(samples.map(sample => prepareSampleEntry(sample)));
