const path = require('path');
const { logger } = require('generator-jhipster/cli/utils');
const fse = require('fs-extra');

module.exports = {
    writeFiles
};

function writeFiles() {
    // TODO: Implement basic code for file generation.
    fse.ensureLink(
        path.resolve(__dirname, 'templates', '_dummy-server.txt'),
        path.resolve(process.cwd(), 'src/main/server/', '_dummy-server.txt')
    ).catch(err => logger.error(err));
}
