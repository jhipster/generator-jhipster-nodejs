/* eslint-disable consistent-return */
const chalk = require('chalk');
const CommonGenerator = require('generator-jhipster/generators/common');
const constants = require('../generator-nodejs-constants');
const writeFiles = require('./files').writeFiles;

module.exports = class extends CommonGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupServerOptions(this, jhContext);
        jhContext.setupClientOptions(this, jhContext);
    }

    get initializing() {
        const initPhaseFromJHipster = super._initializing();
        const initNodeCommonPhaseSteps = {
            // variables to use in templates
            setupCustomNodeConsts() {
                this.SERVER_NODEJS_SRC_DIR = constants.SERVER_NODEJS_SRC_DIR;
            }
        };
        return Object.assign(initPhaseFromJHipster, initNodeCommonPhaseSteps);

        // Here we are not overriding this phase and hence its being handled by JHipster
        // return super._initializing();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const jhipsterNodeCommonPhaseSteps = writeFiles();
        return Object.assign(phaseFromJHipster, jhipsterNodeCommonPhaseSteps);
    }
};
