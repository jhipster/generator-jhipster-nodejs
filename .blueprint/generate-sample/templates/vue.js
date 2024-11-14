import { prepareSampleEntry } from '../support/prepare-sample.js';

const samples = [
  'monolith-vue-jwt-i18n-jdl',
  'monolith-vue-oauth2-i18n-jdl',
  ['monolith-vue-mongodb-prod-jdl', { 'legacy-sample-file': 'monolith-client-auth-database-template-jdl', e2e: 'false' }],
];

export default Object.fromEntries(samples.map(sample => prepareSampleEntry(sample)));
