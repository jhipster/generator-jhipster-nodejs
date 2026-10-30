import { SERVER_NODEJS_SRC_DIR } from '../../../generator-nodejs-constants.js';

const SERVER_NODEJS_DIR = `${SERVER_NODEJS_SRC_DIR}/`;

/**
 * The migrations of an entity, like its Liquibase changelogs: its table, then its constraints when it has some, kept with
 * incrementalChangelog once written, and the ones of its changes of this generation.
 */
export const migrationFiles = {
  migrations: [
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => !ctx.nodejsMigrationsKept,
      renameTo: data => `${SERVER_NODEJS_DIR}src/migrations/${data.nodejsMigration.fileName}.ts`,
      templates: ['src/migrations/_entityMigration_.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => !ctx.nodejsMigrationsKept && ctx.nodejsConstraintsMigration,
      renameTo: data => `${SERVER_NODEJS_DIR}src/migrations/${data.nodejsConstraintsMigration.fileName}.ts`,
      templates: ['src/migrations/_entityConstraintsMigration_.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.nodejsUpdatedMigration,
      renameTo: data => `${SERVER_NODEJS_DIR}src/migrations/${data.nodejsUpdatedMigration.fileName}.ts`,
      templates: ['src/migrations/_entityUpdatedMigration_.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.nodejsUpdatedConstraintsMigration,
      renameTo: data => `${SERVER_NODEJS_DIR}src/migrations/${data.nodejsUpdatedConstraintsMigration.fileName}.ts`,
      templates: ['src/migrations/_entityUpdatedConstraintsMigration_.ts'],
    },
  ],
};
