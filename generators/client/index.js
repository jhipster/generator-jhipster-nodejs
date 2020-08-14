/* eslint-disable consistent-return */
const chalk = require('chalk');
const ClientGenerator = require('generator-jhipster/generators/client');
// const jhipsterPackagejs = require('generator-jhipster/package.json');
const constants = require('../generator-nodejs-constants');
const writeFiles = require('./files').writeFiles;

module.exports = class extends ClientGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupClientOptions(this, jhContext);

        // This adds support for a `--skip-i18n` flag for unit test
        this.option('skip-i18n', {
            desc: 'skip internationalization',
            type: Boolean,
            defaults: false
        });
    }

    get initializing() {
        const initPhaseFromJHipster = super._initializing();
        const initNodeClientPhaseSteps = {
            // variables to use in templates
            setupCustomClientConsts() {
                this.SERVER_NODEJS_SRC_DIR = constants.SERVER_NODEJS_SRC_DIR;
                // this.packagejs = jhipsterPackagejs;
            }
        };
        return Object.assign(initPhaseFromJHipster, initNodeClientPhaseSteps);
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get default() {
        const defaultPhaseFromJHipster = super._default();
        // disable i18n
        if (this.options['skip-i18n']) {
            defaultPhaseFromJHipster.composeLanguages = {};
        }
        return defaultPhaseFromJHipster;
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const jhipsterNodeClientPhaseSteps = writeFiles();
        return Object.assign(phaseFromJHipster, jhipsterNodeClientPhaseSteps);
    }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
