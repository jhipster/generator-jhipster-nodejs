const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('../generators/generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;

// initial precondition for all tests
function getPreCondition() {
    return helpers
        .run('generator-jhipster/generators/server')
        .withOptions({
            fromCli: true,
            skipInstall: true,
            blueprints: 'nodejs',
            skipChecks: true,
            'skip-i18n': true
        })
        .withGenerators([
            [
                require('../generators/server/index.js'), // eslint-disable-line global-require
                'jhipster-nodejs:server',
                path.join(__dirname, '../generators/server/index.js')
            ]
        ]);
}

function commonAssertion() {
    assert.file(`${SERVER_NODEJS_DIR}src/app.module.ts`);
    assert.file(`${SERVER_NODEJS_DIR}e2e/app.e2e-spec.ts`);
    assert.file(`${SERVER_NODEJS_DIR}e2e/user.e2e-spec.ts`);
    assert.file(`${SERVER_NODEJS_DIR}e2e/jest.e2e.config.json`);
    assert.file(`${SERVER_NODEJS_DIR}e2e/setup.test.js`);
    assert.file('src/main/docker/app.yml');
    assert.file('src/main/docker/mysql.yml');
    assert.noFile('src/main/docker/mongodb.yml');
    assert.noFile('src/main/docker/mssql.yml');
    assert.noFile('src/main/docker/postgresql.yml');
    assert.noFile('src/main/resources/i18n/messages_en.properties');
    assert.file(`${SERVER_NODEJS_DIR}src/service/dto/user.dto.ts`);
    assert.file(`${SERVER_NODEJS_DIR}src/service/dto/base.dto.ts`);
    assert.file(`${SERVER_NODEJS_DIR}src/service/mapper/user.mapper.ts`);
}

const commonPrompt = {
    baseName: 'sampleMysql',
    applicationType: 'monolith',
    prodDatabaseType: 'mysql'
};

describe('Subgenerator server of nodejs JHipster blueprint', () => {
    describe('1-JWT test', () => {
        before(done => {
            getPreCondition()
                .withPrompts({
                    commonPrompt,
                    authenticationType: 'jwt'
                })
                .on('end', done);
        });

        it('app exists with jwt files', () => {
            commonAssertion();
            assert.file(`${SERVER_NODEJS_DIR}e2e/account.e2e-spec.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/web/rest/user.jwt.controller.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/service/dto/user-login.dto.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/service/dto/password-change.dto.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/security/passport.jwt.strategy.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/security/payload.interface.ts`);
            assert.noFile(`${SERVER_NODEJS_DIR}src/web/rest/user.oauth2.controller.ts`);
        });
    });

    describe('2-OAUTH2 test', () => {
        before(done => {
            getPreCondition()
                .withPrompts({
                    commonPrompt,
                    authenticationType: 'oauth2'
                })
                .on('end', done);
        });

        it('app exists with oauth2 files', () => {
            commonAssertion();
            assert.noFile(`${SERVER_NODEJS_DIR}e2e/account.e2e-spec.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/web/rest/user.oauth2.controller.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/security/passport.oauth2.strategy.ts`);
            assert.noFile(`${SERVER_NODEJS_DIR}src/security/payload.interface.ts`);
            assert.noFile(`${SERVER_NODEJS_DIR}src/service/dto/user-login.dto.ts`);
            assert.noFile(`${SERVER_NODEJS_DIR}src/service/dto/password-change.dto.ts`);
        });
    });

    describe('3-Database mssql test', () => {
        before(done => {
            getPreCondition()
                .withPrompts({
                    baseName: 'sampleMSsql',
                    applicationType: 'monolith',
                    prodDatabaseType: 'mssql',
                    authenticationType: 'jwt'
                })
                .on('end', done);
        });

        it('app exists with docker mssql.yml', () => {
            assert.noFile('src/main/docker/mysql.yml');
            assert.noFile('src/main/docker/postgresql.yml');
            assert.file('src/main/docker/mssql.yml');
            assert.noFile('src/main/docker/mongodb.yml');
        });
    });

    describe('4-Database postgresql test', () => {
        before(done => {
            getPreCondition()
                .withPrompts({
                    baseName: 'samplePostgresql',
                    applicationType: 'monolith',
                    prodDatabaseType: 'postgresql',
                    authenticationType: 'jwt'
                })
                .on('end', done);
        });

        it('app exists with docker postgresql.yml', () => {
            assert.noFile('src/main/docker/mysql.yml');
            assert.file('src/main/docker/postgresql.yml');
            assert.noFile('src/main/docker/mssql.yml');
            assert.noFile('src/main/docker/mongodb.yml');
        });
    });

    describe('5-Database mongodb test', () => {
        before(done => {
            getPreCondition()
                .withPrompts({
                    baseName: 'sampleMongodb',
                    applicationType: 'monolith',
                    prodDatabaseType: 'mongodb',
                    authenticationType: 'jwt'
                })
                .on('end', done);
        });

        it('app exists with docker postgresql.yml', () => {
            assert.file('src/main/docker/mongodb.yml');
            assert.noFile('src/main/docker/mysql.yml');
            assert.noFile('src/main/docker/postgresql.yml');
            assert.noFile('src/main/docker/mssql.yml');
        });
    });
});
