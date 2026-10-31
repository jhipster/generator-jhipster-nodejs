import { SERVER_NODEJS_SRC_DIR } from '../../../generator-nodejs-constants.js';

const SERVER_NODEJS_DIR = `${SERVER_NODEJS_SRC_DIR}/`;

/**
 * The migrations of a changelog of this generation, like the Liquibase changelogs of its entity: for its creation its table,
 * then its constraints when it has some; for an update its fields, then its relationships; for its removal its tables.
 */
export const migrationFiles = {
  migrations: [
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.nodejsMigration,
      renameTo: data => `${SERVER_NODEJS_DIR}src/migrations/${data.nodejsMigration.fileName}.ts`,
      templates: ['src/migrations/_entityMigration_.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.nodejsConstraintsMigration,
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
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.nodejsRemovedMigration,
      renameTo: data => `${SERVER_NODEJS_DIR}src/migrations/${data.nodejsRemovedMigration.fileName}.ts`,
      templates: ['src/migrations/_entityRemovedMigration_.ts'],
    },
  ],
};
