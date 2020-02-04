const _ = require('lodash');
const constants = require('../generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;
const utils = require('../utils');

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = {
    server: [
        {
            path: SERVER_NODEJS_DIR,
            templates: [
                {
                    file: 'src/domain/entity.ts',
                    renameTo: generator => `src/domain/${generator.entityFileName}.entity.ts`
                },
                {
                    file: 'src/module/entity.module.ts',
                    renameTo: generator => `src/module/${generator.entityFileName}.module.ts`
                },
                {
                    file: 'src/repository/entity.repository.ts',
                    renameTo: generator => `src/repository/${generator.entityFileName}.repository.ts`
                },
                {
                    file: 'src/service/entity.service.ts',
                    renameTo: generator => `src/service/${generator.entityFileName}.service.ts`
                },
                {
                    file: 'src/web/rest/entity.controller.ts',
                    renameTo: generator => `src/web/rest/${generator.entityFileName}.controller.ts`
                },
                {
                    file: 'e2e/entity.e2e-spec.ts',
                    renameTo: generator => `e2e/${generator.entityFileName}.e2e-spec.ts`
                }
            ]
        }
    ]
};

module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        customEntityServerFiles() {
            if (this.skipServer) return;

            this.writeFilesToDisk(serverFiles, this, false);

            this.fields.forEach(field => {
                if (field.fieldIsEnum === true) {
                    const enumFileName = _.kebabCase(field.fieldType);
                    const enumInfo = utils.buildEnumInfo(field, this.angularAppName, this.packageName, this.clientRootFolder);
                    this.template(
                        `${SERVER_NODEJS_DIR}src/domain/enumeration/Enum.ts.ejs`,
                        `${SERVER_NODEJS_DIR}src/domain/enumeration/${enumFileName}.ts`,
                        this,
                        {},
                        enumInfo
                    );
                }
            });

            utils.addEntityToAppModuleImport(this, this.entityClass, this.entityFileName);
            utils.addEntityToAppModule(this, this.entityClass);
        }
    };
}
