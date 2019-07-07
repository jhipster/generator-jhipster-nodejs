module.exports = {
    writeFiles
};

const serverFiles = {
    common: [
        {
            templates: ['package.json', 'tsconfig.json']
        }
    ]
};

function writeFiles() {
    this.copy('_dummy-server.txt', 'dummy-server.txt');
    this.writeFilesToDisk(serverFiles, this, false);
}
