const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

const REACT_DIR = jhipsterConstants.REACT_DIR;
const ANGULAR_DIR = jhipsterConstants.ANGULAR_DIR;
const VUE_DIR = jhipsterConstants.VUE_DIR;

// initial precondition for all tests
function getPreCondition() {
    return helpers
        .run('generator-jhipster/generators/client')
        .withOptions({
            fromCli: true,
            skipInstall: true,
            skipServer: true,
            blueprints: 'nodejs',
            'skip-i18n': true,
            skipChecks: true,
            auth: 'jwt',
            db: 'mysql'
        })
        .withGenerators([
            [
                require('../generators/client/index.js'), // eslint-disable-line global-require
                'jhipster-nodejs:client',
                path.join(__dirname, '../generators/client/index.js')
            ]
        ]);
}

const commonPrompt = {
    baseName: 'sampleMysql',
    applicationType: 'monolith',
    clientTheme: 'none'
};

describe('Subgenerator client of nodejs JHipster blueprint', () => {
    describe('1-angular test', () => {
        before(done => {
            getPreCondition()
                .withPrompts({
                    commonPrompt,
                    clientFramework: 'angularX'
                })
                .on('end', done);
        });

        it('angular app exists with custom package.json scripts and home', () => {
            // Adds your tests here
            assert.fileContent('package.json', '"start:app": "npm run build && cd server && npm run start"');
            assert.fileContent('package.json', '"build:app": "npm run build && cd server && npm run build"');
            assert.fileContent(`${ANGULAR_DIR}home/home.component.html`, 'generator-jhipster-nodejs');
        });
    });

    describe('2-react test', () => {
        before(done => {
            getPreCondition()
                .withPrompts({
                    commonPrompt,
                    clientFramework: 'react'
                })
                .on('end', done);
        });

        it('react app exists with custom package.json scripts and home', () => {
            // Adds your tests here
            assert.fileContent('package.json', '"start:app": "npm run build && cd server && npm run start"');
            assert.fileContent('package.json', '"build:app": "npm run build && cd server && npm run build"');
            assert.fileContent(`${REACT_DIR}modules/home/home.tsx`, 'generator-jhipster-nodejs');
        });
    });

    describe('3-vue test', () => {
        before(done => {
            getPreCondition()
                .withPrompts({
                    commonPrompt,
                    clientFramework: 'vue'
                })
                .on('end', done);
        });

        it('vue app exists with custom package.json scripts and home', () => {
            // Adds your tests here
            assert.fileContent('package.json', '"start:app": "npm run build && cd server && npm run start"');
            assert.fileContent('package.json', '"build:app": "npm run build && cd server && npm run build"');
            assert.fileContent(`${VUE_DIR}core/home/home.vue`, 'generator-jhipster-nodejs');
        });
    });
});
