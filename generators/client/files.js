const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

const ANGULAR_DIR = jhipsterConstants.ANGULAR_DIR;
const REACT_DIR = jhipsterConstants.REACT_DIR;

const clientFiles = {
    common: [
        {
            condition: generator => generator.clientFramework === 'angularX',
            templates: [
                { file: 'angular/tsconfig-aot.json', renameTo: () => 'tsconfig-aot.json' },
                { file: 'angular/tsconfig.json', renameTo: () => 'tsconfig.json' },
                { file: 'angular/package.json', renameTo: () => 'package.json' },
                { file: 'angular/eslintignore', renameTo: () => '.eslintignore' }
            ]
        },
        {
            condition: generator => generator.clientFramework === 'react',
            templates: [
                { file: 'react/tsconfig.json', renameTo: () => 'tsconfig.json' },
                { file: 'react/package.json', renameTo: () => 'package.json' },
                { file: 'react/eslintrc.json', renameTo: () => '.eslintrc.json' },
                { file: 'react/eslintignore', renameTo: () => '.eslintignore' }
            ]
        }
    ],
    angularMain: [
        {
            condition: generator => generator.clientFramework === 'angularX',
            templates: [
                {
                    file: 'angular/home/home.component.html',
                    method: 'processHtml',
                    renameTo: () => `${ANGULAR_DIR}home/home.component.html`
                }
            ]
        }
    ],
    reactMain: [
        {
            condition: generator => generator.clientFramework === 'react',
            templates: [
                {
                    file: 'react/home/home.tsx',
                    method: 'processJsx',
                    renameTo: () => `${REACT_DIR}modules/home/home.tsx`
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
