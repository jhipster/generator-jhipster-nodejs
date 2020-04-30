function writeFiles(languages) {
    let clientFiles = {
        common: []
    };
    languages.forEach(language => {
        clientFiles.common.push({
            condition: generator => true,
            templates: [
                `src/main/webapp/i18n/${language}/global.json`,
                {
                    file: `src/main/webapp/i18n/${language}/home.json`,
                    renameTo: () => `src/main/webapp/i18n/${language}/home.json`,
                    noEjs: true
                }
            ]
        });
    });
    console.info(languages[0]);
    return {
        overrideFiles() {
            this.writeFilesToDisk(clientFiles, this, false);
        }
    };
}

module.exports = {
    writeFiles
};
