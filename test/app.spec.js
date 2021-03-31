const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('../generators/generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;
const i18nHomePath = 'src/main/webapp/i18n/it/home.json';

const prompt = {
    baseName: 'sampleMysql',
    applicationType: 'monolith',
    authenticationType: 'jwt',
    prodDatabaseType: 'mysql',
    clientFramework: 'angularX',
    clientTheme: 'none'
};

const allSubgenerators = [
    [
        require('../generators/app/index.js'), // eslint-disable-line global-require
        'jhipster-nodejs:app',
        path.join(__dirname, '../generators/app/index.js')
    ],
    [
        require('../generators/server/index.js'), // eslint-disable-line global-require
        'jhipster-nodejs:server',
        path.join(__dirname, '../generators/server/index.js')
    ],
    [
        require('../generators/client/index.js'), // eslint-disable-line global-require
        'jhipster-nodejs:client',
        path.join(__dirname, '../generators/client/index.js')
    ],
    [
        require('../generators/common/index.js'), // eslint-disable-line global-require
        'jhipster-nodejs:common',
        path.join(__dirname, '../generators/common/index.js')
    ]
];

function commonAssertions() {
    // assertion for client subgenerator
    assert.fileContent('package.json', '"start:app": "npm run build && cd server && npm run start"');

    // assertion for common subgenerator
    assert.fileContent('README.md', 'https://github.com/jhipster/generator-jhipster-nodejs');
}

describe('Main app generator of nodejs JHipster blueprint', () => {
    describe('1-test full app', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/app')
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    skipChecks: true,
                    blueprints: 'nodejs',
                    'skip-i18n': true
                })
                .withGenerators(allSubgenerators)
                .withPrompts({
                    prompt
                })
                .on('end', done);
        });

        it('app exists with server, client and common nodejs subgenerators', () => {
            commonAssertions();
            // assertion for server subgenerator
            assert.file(`${SERVER_NODEJS_DIR}src/app.module.ts`);

            // assertion for i18n disabled for it
            assert.noFile('src/main/resources/i18n/messages_it.properties');
            assert.noFile(i18nHomePath);
        });
    });

    describe('2-test app skip server', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/app')
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    blueprints: 'nodejs',
                    skipServer: true,
                    db: 'sql',
                    auth: 'jwt',
                    skipChecks: true,
                    'skip-i18n': true
                })
                .withGenerators(allSubgenerators)
                .withPrompts({
                    prompt
                })
                .on('end', done);
        });

        it('app exists without server', () => {
            commonAssertions();
            // assertion for i18n disabled for it
            assert.noFile('src/main/resources/i18n/messages_en.properties');
            assert.noFile(i18nHomePath);
        });
    });

    describe('3-test app regeneration', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/app')
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/react-blueprint'), dir);
                })
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    blueprints: 'nodejs',
                    skipChecks: true
                })
                .withGenerators(allSubgenerators)
                .withPrompts({
                    actionAdd: false
                })
                .on('end', done);
        });

        it('app regenerated exists with server, client and common nodejs', () => {
            commonAssertions();
            // assertion for server subgenerator
            assert.file(`${SERVER_NODEJS_DIR}src/app.module.ts`);

            // assertion for i18n enabled for it
            assert.file(i18nHomePath);
        });
    });
});
