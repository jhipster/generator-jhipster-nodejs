const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('Subgenerator ci-cd of nodejs JHipster blueprint', () => {
    describe('1-github test', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/ci-cd')
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/ngx-blueprint'), dir);
                })
                .withOptions({ skipChecks: true })
                .withGenerators([
                    [
                        require('../generators/ci-cd/index.js'), // eslint-disable-line global-require
                        'jhipster-nodejs:ci-cd',
                        path.join(__dirname, '../generators/ci-cd/index.js')
                    ]
                ])
                .withPrompts({
                    pipeline: 'github',
                    cicdIntegrations: [],
                    dockerImage: 'jhipster-publish-docker',
                    sonarUrl: 'http://sonar.com:9000'
                })
                .on('end', done);
        });

        it('app exists with custom github-ci.yml file', () => {
            // Adds your tests here
            assert.fileContent('.github/workflows/github-ci.yml', 'NHipster');
            assert.noFile('.travis.yml');
            assert.noFile('.gitlab-ci.yml');
            assert.noFile('circle.yml');
            assert.noFile('azure-pipelines.yml');
            assert.noFile('Jenkinsfile.yml');
        });
    });
});
