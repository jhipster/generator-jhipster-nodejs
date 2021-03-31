const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('Subgenerator common of nodejs JHipster blueprint', () => {
    describe('1-test', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/common')
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/react-blueprint'), dir);
                })
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    blueprints: 'nodejs',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../generators/common/index.js'), // eslint-disable-line global-require
                        'jhipster-nodejs:common',
                        path.join(__dirname, '../generators/common/index.js')
                    ]
                ])
                .withPrompts({
                    actionAdd: false
                })
                .on('end', done);
        });

        it('app exists with custom generator-jhipster-nodejs string in the README.md', () => {
            // Adds your tests here
            assert.fileContent('README.md', 'https://github.com/jhipster/generator-jhipster-nodejs');
        });
    });
});
