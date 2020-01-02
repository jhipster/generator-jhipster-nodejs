const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

// initial precondition for all tests
function getPreCondition() {
    return helpers
        .run('generator-jhipster/generators/client')
        .withOptions({
            'from-cli': true,
            skipInstall: true,
            skipServer: true,
            blueprints: 'nodejs',
            skipChecks: true
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
    authenticationType: 'jwt',
    prodDatabaseType: 'mysql',
    enableTranslation: true,
    nativeLanguage: 'en',
    languages: ['fr', 'de'],
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

        it('angular app exists with custom package.json scripts', () => {
            // Adds your tests here
            assert.fileContent('package.json', '"start:app": "npm run build && cd server && npm run start"');
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

        it('react app exists with custom eslint rules', () => {
            // Adds your tests here
            assert.fileContent('.eslintrc.json', '"prefer-promise-reject-errors": "off"');
        });
    });
});
