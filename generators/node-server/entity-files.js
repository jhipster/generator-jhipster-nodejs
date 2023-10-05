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
      renameTo: (data, filepath) => `${SERVER_NODEJS_DIR}${filepath.replace('_entityFileName_', data.entityFileName)}`,
      templates: [
        'src/domain/_entityFileName_.entity.ts',
        'src/module/_entityFileName_.module.ts',
        'src/repository/_entityFileName_.repository.ts',
        'src/service/_entityFileName_.service.ts',
        'src/service/dto/_entityFileName_.dto.ts',
        'src/service/mapper/_entityFileName_.mapper.ts',
        'src/web/rest/_entityFileName_.controller.ts',
        'e2e/_entityFileName_.e2e-spec.ts',
      ],
    },
  ],
};
