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
                    file: 'src/service/resource.service.ts',
                    renameTo: generator => `src/service/${generator.serviceFileName}.service.ts`
                },
                {
                    file: 'test/service/resource.service.spec.ts',
                    renameTo: generator => `test/service/${generator.serviceFileName}.service.spec.ts`
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
        customServiceServerFiles() {
            if (this.skipServer) return;

            this.writeFilesToDisk(serverFiles, this, false);

            utils.addServiceToAppModuleImport(this, this.serviceClass, this.serviceFileName);
            utils.addServiceToAppModule(this, this.serviceClass);
        }
    };
}
