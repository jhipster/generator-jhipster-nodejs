import { describe, expect, it } from 'vitest';

import { getDatabasePort, getNodeDevDatabaseType, getNodeDevSqliteDatabase, getNodejsTemporaryDir } from './database.js';

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
  it('should use SQLite for the embedded development databases', () => {
    for (const devDatabaseType of ['h2Disk', 'h2Memory', 'sqlite']) {
      expect(getNodeDevDatabaseType({ databaseType: 'sql', devDatabaseType })).toBe('better-sqlite3');
    }
  });

  it('should use the TypeORM type of a server database', () => {
    expect(getNodeDevDatabaseType({ databaseType: 'sql', devDatabaseType: 'postgresql' })).toBe('postgres');
    expect(getNodeDevDatabaseType({ databaseType: 'sql', devDatabaseType: 'mariadb' })).toBe('mariadb');
    expect(getNodeDevDatabaseType({ databaseType: 'mongodb' })).toBe('mongodb');
  });
});

describe('getNodeDevSqliteDatabase', () => {
  it('should keep an h2Memory database in memory and an h2Disk one in a file of the temporary folder', () => {
    expect(getNodeDevSqliteDatabase({ databaseType: 'sql', devDatabaseType: 'h2Memory', nodejsTemporaryDir: '../tmp/' })).toBe(':memory:');
    expect(getNodeDevSqliteDatabase({ databaseType: 'sql', devDatabaseType: 'h2Disk', nodejsTemporaryDir: '../tmp/' })).toBe(
      '../tmp/db/sqlite-dev-db.sql',
    );
  });
});

describe('getNodejsTemporaryDir', () => {
  it('should give the temporary folder of the root of the application from the folder of the server', () => {
    expect(getNodejsTemporaryDir({ nodeServerRootDir: 'server/', temporaryDir: 'tmp/' })).toBe('../tmp/');
  });
});
