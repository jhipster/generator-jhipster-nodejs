import { prepareSample } from '../support/prepare-sample.js';

const samples = ['monolith-vue-jwt-i18n-jdl', 'monolith-vue-oauth2-i18n-jdl', 'monolith-vue-mongodb-prod-jdl'];

export default Object.fromEntries(samples.map(sample => [sample, prepareSample(sample)]));
