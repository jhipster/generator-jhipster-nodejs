import { prepareSample } from '../support/prepare-sample.js';

const samples = [
  'monolith-angular-jwt-jdl',
  'monolith-angular-jwt-i18n-jdl',
  'monolith-angular-oauth2-jdl',
  'monolith-angular-oauth2-mongodb-jdl',
  'monolith-angular-oauth2-i18n-jdl',
  'monolith-angular-jwt-i18n-dev',
  'monolith-angular-jwt-mongodb-jdl',
  'monolith-angular-mssql-prod-jdl',
  'monolith-angular-postgresql-prod-jdl',
];

export default Object.fromEntries(samples.map(sample => [sample, prepareSample(sample)]));
