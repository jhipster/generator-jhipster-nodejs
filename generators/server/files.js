module.exports = {
    writeFiles
};

function writeFiles() {
    this.copy('_dummy-server.txt', 'dummy-server.txt');
}
