const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const i18nHomePath = 'src/main/webapp/i18n/it/home.json';

describe('Subgenerator languages of nodejs JHipster blueprint', () => {
    describe('1-test', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/languages')
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/react-blueprint'), dir);
                })
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    skipChecks: true,
                    blueprints: 'nodejs'
                })
                .withGenerators([
                    [
                        require('../generators/languages/index.js'), // eslint-disable-line global-require
                        'jhipster-nodejs:languages',
                        path.join(__dirname, '../generators/languages/index.js')
                    ]
                ])
                .withArguments(['en', 'it'])
                .on('end', done);
        });

        it('app exists with custom generator-jhipster-nodejs i18n home.json', () => {
            // Check no jhipster server properties
            assert.noFile('src/main/resources/i18n/messages_en.properties');
            assert.noFile('src/main/resources/i18n/messages_it.properties');
            assert.noFile('src/main/resources/i18n/messages_es.properties');

            assert.fileContent(i18nHomePath, 'Benvenuto, Node Official Blueprint di JHipster!');
        });
    });
});
