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
            'from-cli': true,
            skipInstall: true,
            blueprint: 'nodejs',
            skipChecks: true
        })
        .withGenerators([
            [
                require('../generators/server/index.js'), // eslint-disable-line global-require
                'jhipster-nodejs:server',
                path.join(__dirname, '../generators/server/index.js')
            ]
        ]);
}

const commonPrompt = {
    baseName: 'sampleMysql',
    applicationType: 'monolith',
    prodDatabaseType: 'mysql',
    enableTranslation: true,
    nativeLanguage: 'en',
    languages: ['fr', 'de'],
    rememberMeKey: '2bb60a80889aa6e6767e9ccd8714982681152aa5'
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
            assert.file(`${SERVER_NODEJS_DIR}src/app.module.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/web/rest/user.jwt.controller.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/service/dto/user-login.dto.ts`);
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
            assert.file(`${SERVER_NODEJS_DIR}src/app.module.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/web/rest/user.oauth2.controller.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/security/passport.oauth2.strategy.ts`);
            assert.noFile(`${SERVER_NODEJS_DIR}src/security/payload.interface.ts`);
        });
    });
});
