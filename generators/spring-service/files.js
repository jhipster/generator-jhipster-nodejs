const constants = require('../generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;

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
                    file: 'src/service/README.md'
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
        writeSameFiles() {
            this.writeFilesToDisk(serverFiles, this, false);
        }
    };
}
