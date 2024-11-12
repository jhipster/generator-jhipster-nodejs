import { prepareSampleEntry } from '../support/prepare-sample.js';

const samples = [
  'monolith-react-jwt-jdl',
  'monolith-react-jwt-i18n-jdl',
  'monolith-react-oauth2-jdl',
  'monolith-react-oauth2-i18n-jdl',
  'monolith-react-mysql-prod-jdl',
  ['monolith-react-mongodb-prod-jdl', { 'legacy-sample-file': 'monolith-client-database-prod-template-jdl', e2e: 'false' }],
  'monolith-react-oauth2-dev',
];

export default Object.fromEntries(samples.map(sample => prepareSampleEntry(sample)));
