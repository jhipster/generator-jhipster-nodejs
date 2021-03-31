const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const constants = require('../generators/generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;

describe('Subgenerator nestjs-service of nodejs JHipster blueprint', () => {
    describe('1-test', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/spring-service')
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/react-blueprint'), dir);
                    fse.copySync(path.join(__dirname, '../test/templates/server'), `${dir}/server`);
                })
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    blueprints: 'nodejs',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../generators/spring-service/index.js'), // eslint-disable-line global-require
                        'jhipster-nodejs:spring-service',
                        path.join(__dirname, '../generators/spring-service/index.js')
                    ]
                ])
                .withArguments(['bar'])
                .withPrompts({
                    useInterface: false
                })
                .on('end', done);
        });

        it('app exists with bar service ts file', () => {
            // Adds your tests here
            assert.file(`${SERVER_NODEJS_DIR}src/service/bar.service.ts`);

            const testServicePath = `${SERVER_NODEJS_DIR}test/service/bar.service.spec.ts`;
            assert.file(testServicePath);
            assert.fileContent(testServicePath, 'BarService');
        });
    });
});
