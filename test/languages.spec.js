const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('generator-jhipster/generators/generator-constants');

// const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

describe('JHipster generator languages', () => {
    context('Creates default i18n files', () => {
        constants.LANGUAGES.forEach(language => {
            describe(`for ${language.name}`, () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/languages'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                        })
                        .withOptions({
                            'skip-install': true
                        })
                        .withPrompts({
                            languages: [language.value]
                        })
                        .on('end', done);
                });

                it('creates expected files', () => {
                    assert.file([
                        `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/home.json`,
                        `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`
                    ]);
                });
                it('contains 3 needles in global.json', () => {
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`,
                        '"jhipster-needle-menu-add-element": "NHipster will add additional menu entries here (do not translate!)"'
                    );
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`,
                        '"jhipster-needle-menu-add-entry": "NHipster will add additional entities here (do not translate!)"'
                    );
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`,
                        '"jhipster-needle-menu-add-admin-element": "JHipster will add additional menu entries here (do not translate!)"'
                    );
                });
            });
        });
    });
});
