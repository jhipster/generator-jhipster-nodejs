const constants = require('../generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;
// const utils = require('../utils');

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
                    renameTo: generator => `src/services/${generator.controllerFileName}.service.ts`
                },
                {
                    file: 'test/services/resource.service.spec.ts',
                    renameTo: generator => `test/services/${generator.controllerFileName}.service.spec.ts`
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

            //  utils.addControllerToAppModuleImport(this, this.controllerClass, this.controllerFileName);
            //  utils.addControllerToAppModule(this, this.controllerClass);
        }
    };
}
