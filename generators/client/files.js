const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

const ANGULAR_DIR = jhipsterConstants.ANGULAR_DIR;

const clientFiles = {
    common: [
        {
            condition: generator => generator.clientFramework === 'angularX',
            templates: [
                { file: 'angular/tsconfig-aot.json', renameTo: () => 'tsconfig-aot.json' },
                { file: 'angular/tsconfig.json', renameTo: () => 'tsconfig.json' }
            ]
        },
        {
            condition: generator => generator.clientFramework === 'react',
            templates: [{ file: 'react/tsconfig.json', renameTo: () => 'tsconfig.json' }]
        }
    ],
    angularMain: [
        {
            condition: generator => generator.clientFramework === 'angularX',
            templates: [
                {
                    file: 'angular/home/home.component.html',
                    method: 'processHtml',
                    renameTo: () => `${ANGULAR_DIR}/home/home.component.html`
                }
            ]
        }
    ]
};

function writeFiles() {
    return {
        overrideFiles() {
            this.writeFilesToDisk(clientFiles, this, false);
        }
    };
}

module.exports = {
    writeFiles
};
