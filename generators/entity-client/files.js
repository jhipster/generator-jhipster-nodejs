const constants = require('generator-jhipster/generators/generator-constants');

const entityClientFiles = {
    react: [
        {
            condition: generator => !generator.embedded && generator.clientFramework === 'react',
            templates: [
                {
                    file: `react/${constants.REACT_DIR}entities/entity.tsx`,
                    method: 'processJsx',
                    renameTo: generator => `${constants.REACT_DIR}entities/${generator.entityFolderName}/${generator.entityFileName}.tsx`
                }
            ]
        }
    ]
};

function writeFiles() {
    return {
        overrideFiles() {
            this.writeFilesToDisk(entityClientFiles, this, false);
        }
    };
}

module.exports = {
    writeFiles
};
