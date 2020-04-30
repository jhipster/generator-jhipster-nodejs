const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('generator-jhipster/generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

describe('Subgenerator languages of nodejs JHipster blueprint', () => {
    context('Creates default i18n files', () => {
        constants.LANGUAGES.forEach(language => {
            describe(`for ${language.name}`, () => {
                before(done => {
                    helpers
                        .run('generator-jhipster/generators/languages')
                        .withOptions({
                            'from-cli': true,
                            skipInstall: true,
                            blueprints: 'nodejs',
                            skipChecks: true,
                            regenerate: true,
                            force: true,
                            enableTranslation: true,
                            nativeLanguage: 'en',
                            languages: [language.value],
                            skipClient: false
                        })
                        .withGenerators([
                            [
                                require('../generators/languages/index.js'), // eslint-disable-line global-require
                                'jhipster-nodejs:languages',
                                path.join(__dirname, '../generators/languages/index.js')
                            ]
                        ])
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
                it('contains 1 needles in home.json', () => {
                    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/home.json`, 'NHipster');
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
                        '"jhipster-needle-menu-add-admin-element": "NHipster will add additional menu entries here (do not translate!)"'
                    );
                });
            });
        });
    });
});
