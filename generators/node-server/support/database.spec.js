import { describe, expect, it } from 'vitest';

import { getDatabasePort } from './database.js';

describe('getDatabasePort', () => {
  it('should give the default port of the production database', () => {
    expect(getDatabasePort({ databaseType: 'sql', prodDatabaseType: 'postgresql' })).toBe(5432);
    expect(getDatabasePort({ databaseType: 'sql', prodDatabaseType: 'mariadb' })).toBe(3306);
    expect(getDatabasePort({ databaseType: 'sql', prodDatabaseType: 'oracle' })).toBe(1521);
  });

  it('should give the port of MongoDB from the database type', () => {
    expect(getDatabasePort({ databaseType: 'mongodb' })).toBe(27017);
  });
});
