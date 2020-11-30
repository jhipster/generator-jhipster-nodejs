// const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

// const TEST_DIR = jhipsterConstants.CLIENT_TEST_SRC_DIR;

const entityClientFiles = {
    testE2E: [
        /*
        {
            condition: generator => generator.clientFramework === 'react',
            templates: [
                {
                    file: 'react/test/e2e/entities/entity.spec.ts',
                    renameTo: generator => `${TEST_DIR}e2e/entities/${generator.entityFolderName}/${generator.entityFileName}`
                }
            ]
        }
         {
            condition: generator => generator.clientFramework === 'angularX',
            templates: [
                {
                    file: 'angular/test/e2e/entities/entity.spec.ts',
                    renameTo: generator => `${TEST_DIR}e2e/entities/${generator.entityFolderName}/${generator.entityFileName}`
                }
            ]
        } */
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
