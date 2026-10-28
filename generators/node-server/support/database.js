/**
 * The default port of each production database type of JHipster, the port of its docker service: the database of the
 * application-dev.yml and application-prod.yml files.
 */
export const databasePorts = {
  postgresql: 5432,
  mysql: 3306,
  mariadb: 3306,
  mssql: 1433,
  oracle: 1521,
  mongodb: 27017,
};

/** The default port of the production database of an application. */
export const getDatabasePort = ({ databaseType, prodDatabaseType = databaseType }) => databasePorts[prodDatabaseType];

/** The embedded development databases of JHipster (H2) and of the former versions of the blueprint: SQLite. */
const embeddedDevDatabaseTypes = ['h2Disk', 'h2Memory', 'sqlite'];

/** The TypeORM type of the development database: better-sqlite3 for an embedded one, else the server type. */
export const getNodeDevDatabaseType = ({ databaseType, devDatabaseType = databaseType }) => {
  if (embeddedDevDatabaseTypes.includes(devDatabaseType)) return 'better-sqlite3';
  return devDatabaseType === 'postgresql' ? 'postgres' : devDatabaseType;
};
