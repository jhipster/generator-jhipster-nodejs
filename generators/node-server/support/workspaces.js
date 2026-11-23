/**
 * @typedef {object} WorkspacePackageJson
 * @property {Record<string, any>} [overrides]
 * @property {Record<string, boolean>} [allowScripts]
 * @property {Record<string, string>} [dependencies]
 * @property {Record<string, string>} [devDependencies]
 */

/**
 * The overrides and the allowScripts of the package.json of a workspace, for the root package.json: npm reads them from
 * the root only. Like the workspaces generator of JHipster, a `$name` reference of an override becomes the version the
 * workspace depends on, which the root does not.
 * @param {WorkspacePackageJson} [workspacePackageJson]
 * @returns {Pick<WorkspacePackageJson, 'overrides' | 'allowScripts'>}
 */
export const rootPackageJsonOfWorkspace = ({ overrides, allowScripts, dependencies, devDependencies } = {}) => {
  const versions = { ...dependencies, ...devDependencies };
  /** @param {any} value */
  const resolve = value => {
    if (typeof value === 'string') return value.startsWith('$') ? (versions[value.slice(1)] ?? value) : value;
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, resolve(nested)]));
    return value;
  };
  return { ...(overrides ? { overrides: resolve(overrides) } : {}), ...(allowScripts ? { allowScripts } : {}) };
};
