import { defineConfig } from 'eslint/config';
import prettier from 'eslint-plugin-prettier/recommended';
import jhipster from 'generator-jhipster/eslint';
import { ejsTemplates } from 'generator-jhipster/eslint/ejs-templates';
import globals from 'globals';
// jhipster-needle-eslint-add-import - JHipster will add additional import here

export default defineConfig(
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  { ignores: ['coverage/**'] },
  jhipster.recommended,
  // jhipster-needle-eslint-add-config - JHipster will add additional config here
  prettier,
  // The templates, like generator-jhipster lints its own.
  ejsTemplates({ allowedGlobals: ['relativeDir'] }),
);
