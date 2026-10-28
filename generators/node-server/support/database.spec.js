import { describe, expect, it } from 'vitest';

import { getDatabasePort, getNodeDevDatabaseType } from './database.js';

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

describe('getNodeDevDatabaseType', () => {
  it('should use better-sqlite3 for the embedded development databases, SQLite on disk or in memory', () => {
    for (const devDatabaseType of ['sqlite', 'sqliteMemory']) {
      expect(getNodeDevDatabaseType({ databaseType: 'sql', devDatabaseType })).toBe('better-sqlite3');
    }
  });

  it('should use the TypeORM type of a server database', () => {
    expect(getNodeDevDatabaseType({ databaseType: 'sql', devDatabaseType: 'postgresql' })).toBe('postgres');
    expect(getNodeDevDatabaseType({ databaseType: 'sql', devDatabaseType: 'mariadb' })).toBe('mariadb');
    expect(getNodeDevDatabaseType({ databaseType: 'mongodb' })).toBe('mongodb');
  });
});
