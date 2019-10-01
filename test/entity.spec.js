const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('../generators/generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;

describe('Subgenerator entity of nodejs JHipster blueprint', () => {
    describe('Sample test', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/entity')
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/ngx-blueprint'), dir);
                    fse.copySync(path.join(__dirname, '../test/templates/server'), `${dir}/server`);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'nodejs',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../generators/entity/index.js'), // eslint-disable-line global-require
                        'jhipster-nodejs:entity',
                        path.join(__dirname, '../generators/entity/index.js')
                    ],
                    [
                        require('../generators/entity-server/index.js'), // eslint-disable-line global-require
                        'jhipster-nodejs:entity-server',
                        path.join(__dirname, '../generators/entity-server/index.js')
                    ]
                ])
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'no',
                    service: 'no',
                    pagination: 'infinite-scroll'
                })
                .on('end', done);
        });

        it('does creates entity files', () => {
            // Adds your tests here
            assert.file('.jhipster/Foo.json');
            assert.file(`${SERVER_NODEJS_DIR}src/domain/foo.entity.ts`);
        });
    });
});
