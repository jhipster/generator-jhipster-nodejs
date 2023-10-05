const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

// initial precondition for all tests
function runTestType(pipeline, done) {
    return helpers
        .run('generator-jhipster/generators/ci-cd')
        .inTmpDir(dir => {
            fse.copySync(path.join(__dirname, '../test/templates/react-blueprint'), dir);
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
            pipeline,
            cicdIntegrations: ['publishDocker'],
            dockerImage: 'jhipster-publish-docker',
            sonarUrl: 'http://sonar.com:9000'
        })
        .on('end', done);
}

describe('Subgenerator ci-cd of nodejs JHipster blueprint', () => {
    describe('1-github test', () => {
        before(done => {
            runTestType('github', done);
        });

        it('app exists with custom github-ci.yml file', () => {
            // Adds your tests here
            assert.fileContent('.github/workflows/github-ci.yml', 'NHipster');
            assert.noFile('.travis.yml');
            assert.noFile('.gitlab-ci.yml');
            assert.noFile('circle.yml');
            assert.noFile('azure-pipelines.yml');
            assert.noFile('Jenkinsfile');
        });
    });
    describe('2-gitlab test', () => {
        before(done => {
            runTestType('gitlab', done);
        });

        it('app exists with custom .gitlab-ci.yml file', () => {
            // Adds your tests here
            assert.fileContent('.gitlab-ci.yml', 'NHipster');
            assert.noFile('.github/workflows/github-ci.yml');
            assert.noFile('.travis.yml');
            assert.noFile('circle.yml');
            assert.noFile('azure-pipelines.yml');
            assert.noFile('Jenkinsfile');
        });
    });
    describe('3-circle test', () => {
        before(done => {
            runTestType('circle', done);
        });

        it('app exists with custom circle.yml file', () => {
            // Adds your tests here
            assert.fileContent('circle.yml', 'NHipster');
            assert.noFile('.gitlab-ci.yml');
            assert.noFile('.github/workflows/github-ci.yml');
            assert.noFile('.travis.yml');
            assert.noFile('azure-pipelines.yml');
            assert.noFile('Jenkinsfile');
        });
    });
    describe('4-travis test', () => {
        before(done => {
            runTestType('travis', done);
        });

        it('app exists with custom .travis.yml file', () => {
            // Adds your tests here
            assert.fileContent('.travis.yml', 'NHipster');
            assert.noFile('.gitlab-ci.yml');
            assert.noFile('.github/workflows/github-ci.yml');
            assert.noFile('circle.yml');
            assert.noFile('azure-pipelines.yml');
            assert.noFile('Jenkinsfile');
        });
    });
    describe('5-azure test', () => {
        before(done => {
            runTestType('azure', done);
        });

        it('app exists with custom azure-pipelines.yml file', () => {
            // Adds your tests here
            assert.fileContent('azure-pipelines.yml', 'NHipster');
            assert.noFile('.github/workflows/github-ci.yml');
            assert.noFile('.travis.yml');
            assert.noFile('circle.yml');
            assert.noFile('.gitlab-ci.yml');
            assert.noFile('Jenkinsfile');
        });
    });
    describe('6-jenkins test', () => {
        before(done => {
            runTestType('jenkins', done);
        });

        it('app exists with custom Jenkinsfile file', () => {
            // Adds your tests here
            assert.fileContent('Jenkinsfile', 'NHipster');
            assert.noFile('.github/workflows/github-ci.yml');
            assert.noFile('.travis.yml');
            assert.noFile('circle.yml');
            assert.noFile('.gitlab-ci.yml');
            assert.noFile('azure-pipelines.yml');
        });
    });
});
