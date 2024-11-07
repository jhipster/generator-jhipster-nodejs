import { prepareSample } from '../support/prepare-sample.js';

const samples = [
  'monolith-react-jwt-jdl',
  'monolith-react-jwt-i18n-jdl',
  'monolith-react-oauth2-jdl',
  'monolith-react-oauth2-i18n-jdl',
  'monolith-react-mysql-prod-jdl',
  'monolith-react-mongodb-prod-jdl',
  'monolith-react-oauth2-dev',
];

export default Object.fromEntries(samples.map(sample => [sample, prepareSample(sample)]));
