import { describe, expect, it } from 'expect-node';

import { rootPackageJsonOfWorkspace } from './workspaces.js';

describe('rootPackageJsonOfWorkspace', () => {
  it('should give the overrides with the versions of their references, like the workspaces generator of JHipster', () => {
    expect(
      rootPackageJsonOfWorkspace({
        devDependencies: { '@stylistic/eslint-plugin': '6.0.1' },
        overrides: { 'eslint-plugin-vue': { '@stylistic/eslint-plugin': '$@stylistic/eslint-plugin' }, other: '1.0.0' },
      }),
    ).toEqual({ overrides: { 'eslint-plugin-vue': { '@stylistic/eslint-plugin': '6.0.1' }, other: '1.0.0' } });
  });

  it('should keep a reference to a dependency the workspace has not', () => {
    expect(rootPackageJsonOfWorkspace({ overrides: { foo: '$bar' } })).toEqual({ overrides: { foo: '$bar' } });
  });

  it('should give the allowScripts', () => {
    expect(rootPackageJsonOfWorkspace({ allowScripts: { esbuild: true } })).toEqual({ allowScripts: { esbuild: true } });
  });

  it('should give nothing for a workspace without them', () => {
    expect(rootPackageJsonOfWorkspace({ devDependencies: { foo: '1.0.0' } })).toEqual({});
    expect(rootPackageJsonOfWorkspace(undefined)).toEqual({});
  });
});
