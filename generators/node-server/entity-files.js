import { SERVER_NODEJS_SRC_DIR } from '../generator-nodejs-constants.js';

const SERVER_NODEJS_DIR = `${SERVER_NODEJS_SRC_DIR}/`;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
export const entityFiles = {
  server: [
    {
      path: SERVER_NODEJS_DIR,
      renameTo: (data, filepath) => `${SERVER_NODEJS_DIR}${filepath.replaceAll('_entityFileName_', data.entityFileName)}`,
      templates: [
        'src/entities/_entityFileName_/_entityFileName_.entity.ts',
        'src/entities/_entityFileName_/_entityFileName_.module.ts',
        'src/entities/_entityFileName_/_entityFileName_.service.ts',
        'src/entities/_entityFileName_/dto/_entityFileName_.dto.ts',
        'src/entities/_entityFileName_/_entityFileName_.mapper.ts',
        'src/entities/_entityFileName_/_entityFileName_.controller.ts',
        'e2e/_entityFileName_.e2e-spec.ts',
        'e2e/_entityFileName_.database.e2e-spec.ts',
      ],
    },
  ],
  // The migrations of the entity, like its Liquibase changelogs: its table, then its constraints when it has some.
  migrations: [
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.databaseTypeSql,
      renameTo: data => `${SERVER_NODEJS_DIR}src/migrations/${data.nodejsMigration.fileName}.ts`,
      templates: ['src/migrations/_entityMigration_.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.databaseTypeSql && ctx.nodejsConstraintsMigration,
      renameTo: data => `${SERVER_NODEJS_DIR}src/migrations/${data.nodejsConstraintsMigration.fileName}.ts`,
      templates: ['src/migrations/_entityConstraintsMigration_.ts'],
    },
  ],
};
