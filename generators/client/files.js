const clientFiles = {
    common: [
        {
            condition: generator => generator.clientFramework === 'angularX',
            templates: [
                { file: 'angular/tsconfig-aot.json', renameTo: () => 'tsconfig-aot.json' },
                { file: 'angular/tsconfig.e2e.json', renameTo: () => 'tsconfig.e2e.json' },
                { file: 'angular/tsconfig.json', renameTo: () => 'tsconfig.json' }
            ]
        },
        {
            condition: generator => generator.clientFramework === 'react',
            templates: [
                { file: 'react/tsconfig.test.json', renameTo: () => 'tsconfig.test.json' },
                { file: 'react/tsconfig.e2e.json', renameTo: () => 'tsconfig.e2e.json' },
                { file: 'react/tsconfig.json', renameTo: () => 'tsconfig.json' }
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
