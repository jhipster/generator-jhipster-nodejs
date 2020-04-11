const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('../generators/generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;

const prompt = {
    baseName: 'sampleMysql',
    applicationType: 'monolith',
    authenticationType: 'jwt',
    prodDatabaseType: 'mysql',
    clientFramework: 'angularX',
    clientTheme: 'none'
};

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
                    'from-cli': true,
                    skipInstall: true,
                    blueprints: 'nodejs',
                    skipChecks: true
                })
                .withArguments({
                    languages: ['en', 'vi']
                })
                .withGenerators([
                    [
                        require('../generators/app/index.js'), // eslint-disable-line global-require
                        'jhipster-nodejs:app',
                        path.join(__dirname, '../generators/app/index.js')
                    ]
                ])
                .withPrompts({
                    prompt
                })
                .on('end', done);
        });

        it('app exists with server, client and common nodejs subgenerators', () => {
            commonAssertions();
            // assertion for server subgenerator
            assert.file(`${SERVER_NODEJS_DIR}src/app.module.ts`);
        });
    });

    describe('2-test app skip server', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/app')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprints: 'nodejs',
                    skipServer: true,
                    db: 'sql',
                    auth: 'jwt',
                    skipChecks: true
                })
                .withArguments({
                    languages: ['en', 'vi']
                })
                .withGenerators([
                    [
                        require('../generators/app/index.js'), // eslint-disable-line global-require
                        'jhipster-nodejs:app',
                        path.join(__dirname, '../generators/app/index.js')
                    ]
                ])
                .withPrompts({
                    prompt
                })
                .on('end', done);
        });

        it('app exists without server', () => {
            commonAssertions();
        });
    });

    describe('3-test app regeneration', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/app')
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/ngx-blueprint'), dir);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprints: 'nodejs',
                    skipChecks: true
                })
                .withArguments({
                    languages: ['en', 'vi']
                })
                .withGenerators([
                    [
                        require('../generators/app/index.js'), // eslint-disable-line global-require
                        'jhipster-nodejs:app',
                        path.join(__dirname, '../generators/app/index.js')
                    ]
                ])
                .withPrompts({
                    actionAdd: false
                })
                .on('end', done);
        });

        it('app regenerated exists with server, client and common nodejs', () => {
            commonAssertions();
            // assertion for server subgenerator
            assert.file(`${SERVER_NODEJS_DIR}src/app.module.ts`);
        });
    });
});
