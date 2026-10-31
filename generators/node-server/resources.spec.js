import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import semver from 'semver';

/** @param {string} path a package.json, from this folder */
const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

const resources = readJson('./resources/package.json');
// The package.json of TypeORM, which its exports do not give.
const typeorm = readJson('../../node_modules/typeorm/package.json');
const serverDependencies = { ...resources.dependencies, ...resources.devDependencies };

describe('the dependencies of the server', () => {
  it('should be checked against the TypeORM of the server, the dev dependency of the blueprint', () => {
    expect(typeorm.version).toBe(serverDependencies.typeorm);
  });

  // npm refuses to install a driver out of the peers of TypeORM in a server installed alone (ERESOLVE).
  for (const [driver, range] of Object.entries(typeorm.peerDependencies).filter(([driver]) => serverDependencies[driver])) {
    it(`should give ${driver} in a version TypeORM supports (${range})`, () => {
      expect(semver.satisfies(serverDependencies[driver], range)).toBe(true);
    });
  }
});
