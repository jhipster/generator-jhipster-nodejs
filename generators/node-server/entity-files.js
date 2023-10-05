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
      templates: [
        {
          file: 'src/domain/entity.ts',
          renameTo: generator => `src/domain/${generator.entityFileName}.entity.ts`,
        },
        {
          file: 'src/module/entity.module.ts',
          renameTo: generator => `src/module/${generator.entityFileName}.module.ts`,
        },
        {
          file: 'src/repository/entity.repository.ts',
          renameTo: generator => `src/repository/${generator.entityFileName}.repository.ts`,
        },
        {
          file: 'src/service/entity.service.ts',
          renameTo: generator => `src/service/${generator.entityFileName}.service.ts`,
        },
        {
          file: 'src/service/dto/entity.dto.ts',
          renameTo: generator => `src/service/dto/${generator.entityFileName}.dto.ts`,
        },
        {
          file: 'src/service/mapper/entity.mapper.ts',
          renameTo: generator => `src/service/mapper/${generator.entityFileName}.mapper.ts`,
        },
        {
          file: 'src/web/rest/entity.controller.ts',
          renameTo: generator => `src/web/rest/${generator.entityFileName}.controller.ts`,
        },
        {
          file: 'e2e/entity.e2e-spec.ts',
          renameTo: generator => `e2e/${generator.entityFileName}.e2e-spec.ts`,
        },
      ],
    },
  ],
};
