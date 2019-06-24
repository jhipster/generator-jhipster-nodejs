module.exports = {
    writeFiles
};

function writeFiles() {
    this.copy('_dummy-client.txt', 'dummy-client.txt');
}
