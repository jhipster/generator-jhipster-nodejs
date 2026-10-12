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
