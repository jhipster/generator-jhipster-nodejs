const clientFiles = {
    common: [
        {
            condition: generator => generator.clientFramework === 'angularX',
            templates: [
                { file: 'angular/webpack/webpack.dev.js', renameTo: () => 'webpack/webpack.dev.js' },
                { file: 'angular/webpack/webpack.prod.js', renameTo: () => 'webpack/webpack.prod.js' }
            ]
        },
        {
            condition: generator => generator.clientFramework === 'react',
            templates: [{ file: 'react/webpack/webpack.common.js', renameTo: () => 'webpack/webpack.common.js' }]
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
