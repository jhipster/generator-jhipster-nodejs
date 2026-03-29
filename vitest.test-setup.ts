import { fileURLToPath } from 'node:url';

import { defineDefaults } from 'generator-jhipster/testing';

await defineDefaults({
  blueprint: 'generator-jhipster-nodejs',
  blueprintPackagePath: fileURLToPath(new URL('./', import.meta.url)),
});
