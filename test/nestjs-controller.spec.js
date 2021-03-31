const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('../generators/generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;

describe('Subgenerator nestjs-controller of nodejs JHipster blueprint', () => {
    describe('1-test', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/spring-controller')
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
                        require('../generators/spring-controller/index.js'), // eslint-disable-line global-require
                        'jhipster-nodejs:spring-controller',
                        path.join(__dirname, '../generators/spring-controller/index.js')
                    ]
                ])
                .withArguments(['foo'])
                .withPrompts({
                    actionAdd: false
                })
                .on('end', done);
        });

        it('app exists with foo controller ts file', () => {
            // Adds your tests here
            assert.file(`${SERVER_NODEJS_DIR}src/web/rest/foo.controller.ts`);

            const testControllerPath = `${SERVER_NODEJS_DIR}test/web/rest/foo.controller.spec.ts`;
            assert.file(testControllerPath);
            assert.fileContent(testControllerPath, 'FooController');
        });
    });
});
