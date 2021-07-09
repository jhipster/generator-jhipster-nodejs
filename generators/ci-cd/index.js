/* eslint-disable consistent-return */
const chalk = require('chalk');
const CiCdGenerator = require('generator-jhipster/generators/ci-cd');

module.exports = class extends CiCdGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhContext.configOptions || {};
    }

    get initializing() {
        const initPhaseFromJHipster = super._initializing();
        const initNodeCiCdPhaseSteps = {
            sayHello() {
                this.log(chalk.white('🚀 Welcome to the NHipster CI/CD custom Sub-Generator 🚀'));
            }
        };
        return { ...initPhaseFromJHipster, ...initNodeCiCdPhaseSteps };
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get loading() {
        return super._loading();
    }

    get writing() {
        return {
            customWriting() {
                if (this.pipeline === 'jenkins') {
                    this.template('jenkins/Jenkinsfile.ejs', 'Jenkinsfile');
                    this.template('jenkins/jenkins.yml.ejs', `${this.DOCKER_DIR}jenkins.yml`);
                    this.template('jenkins/idea.gdsl', `${this.SERVER_MAIN_RES_DIR}idea.gdsl`);
                }
                if (this.pipeline === 'gitlab') {
                    this.template('.gitlab-ci.yml.ejs', '.gitlab-ci.yml');
                }
                if (this.pipeline === 'circle') {
                    this.template('circle.yml.ejs', 'circle.yml');
                }
                if (this.pipeline === 'travis') {
                    this.template('travis.yml.ejs', '.travis.yml');
                }
                if (this.pipeline === 'azure') {
                    this.template('azure-pipelines.yml.ejs', 'azure-pipelines.yml');
                }
                if (this.pipeline === 'github') {
                    this.template('github-ci.yml.ejs', '.github/workflows/github-ci.yml');
                }

                if (this.cicdIntegrations.includes('publishDocker')) {
                    this.template('docker-registry.yml.ejs', `${this.DOCKER_DIR}docker-registry.yml`);
                }
            }
        };
    }
};
