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
                    file: 'src/web/rest/resource.controller.ts',
                    renameTo: generator => `src/web/rest/${generator.controllerFileName}.controller.ts`
                },
                {
                    file: 'test/web/rest/resource.controller.spec.ts',
                    renameTo: generator => `test/web/rest/${generator.controllerFileName}.controller.spec.ts`
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
        customControllerServerFiles() {
            if (this.skipServer) return;

            this.writeFilesToDisk(serverFiles, this, false);

            utils.addControllerToAppModuleImport(this, this.controllerClass, this.controllerFileName);
            utils.addControllerToAppModule(this, this.controllerClass);
        }
    };
}
