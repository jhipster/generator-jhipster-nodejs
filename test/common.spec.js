const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('Subgenerator common of nodejs JHipster blueprint', () => {
    describe('Sample test', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/common')
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/ngx-blueprint'), dir);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'nodejs',
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

        it('it works', () => {
            // Adds your tests here
            assert.textEqual('Write your own tests!', 'Write your own tests!');
        });
    });
});
