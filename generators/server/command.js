import { asCommand } from 'generator-jhipster';

export default asCommand({
  configs: {},
  override: true,
  import: [':node-server'],
});
