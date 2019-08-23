const clientFiles = {
    common: [
        {
            condition: generator => generator.clientFramework === 'angularX',
            templates: ['angular/webpack/webpack.dev.js', 'angular/webpack/webpack.prod.js']
        },
        {
            condition: generator => generator.clientFramework === 'react',
            templates: ['react/webpack/webpack.common.js']
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
