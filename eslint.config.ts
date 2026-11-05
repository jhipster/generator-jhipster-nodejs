import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import ejs from 'eslint-plugin-ejs-templates';
import prettier from 'eslint-plugin-prettier/recommended';
import jhipster from 'generator-jhipster/eslint';
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
  ejs.configs.customize(
    {
      html: 'never',
      prettierBlocklist: true,
      stylisticBlocklist: true,
      experimental: true,
      allowedGlobals: ['relativeDir'],
    },
    js.configs.recommended,
    stylistic.configs.customize({
      jsx: false,
      semi: true,
    }),
    {
      rules: {
        'dot-notation': 'error',
        eqeqeq: ['error', 'always', { null: 'ignore' }],
        'no-else-return': 'error',
        'no-regex-spaces': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-return': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-const': 'error',
        'prefer-destructuring': ['error', { array: false, object: true }],
        'prefer-object-has-own': 'error',
        'prefer-object-spread': 'error',
        'prefer-template': 'error',
        'no-negated-condition': 'error',
        'no-nested-ternary': 'error',
        'no-useless-concat': 'error',
        '@stylistic/no-extra-parens': ['error', 'all', { nestedBinaryExpressions: false, ternaryOperandBinaryExpressions: false }],
        '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'never' }],
        '@stylistic/comma-dangle': ['error', 'always-multiline'],
        '@stylistic/no-mixed-operators': 'off',
      },
    },
  ),
);
