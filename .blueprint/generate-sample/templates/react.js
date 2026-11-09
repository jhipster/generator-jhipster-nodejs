import { prepareSampleEntry } from '../support/prepare-sample.js';

const samples = [
  // Without the registration of the users (skipUserRegistration), on SQL and on MongoDB.
  ['monolith-react-jwt-jdl', { generatorOptions: { skipUserRegistration: true } }],
  'monolith-react-jwt-i18n-jdl',
  'monolith-react-oauth2-jdl',
  'monolith-react-oauth2-i18n-jdl',
  'monolith-react-mysql-prod-jdl',
  'monolith-react-sqlite-prod-jdl',
  ['monolith-react-mongodb-prod-jdl', { e2e: 'false', generatorOptions: { skipUserRegistration: true } }],
  'monolith-react-oauth2-dev',
];

export default Object.fromEntries(samples.map(sample => prepareSampleEntry(sample)));
