/* eslint-disable consistent-return */
const chalk = require('chalk');
const ClientGenerator = require('generator-jhipster/generators/client');
const constants = require('../generator-nodejs-constants');
const writeFiles = require('./files').writeFiles;

module.exports = class extends ClientGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

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
            }
        };
        return { ...initPhaseFromJHipster, ...initNodeClientPhaseSteps };
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        return super._configuring();
    }

    get composing() {
        const defaultPhaseFromJHipster = super._composing();
        // disable i18n
        if (this.options['skip-i18n']) {
            defaultPhaseFromJHipster.composeLanguages = {};
        }
        return defaultPhaseFromJHipster;
    }

    get loading() {
        return this._loading();
    }

    get preparing() {
        return this._preparing();
    }

    get default() {
        const defaultPhaseFromJHipster = super._default();
        const defaultNodeClientPhaseSteps = {
            // variables to use in templates
            setupCustomClientConsts() {
                this.protractorTests = true;
            }
        };
        return { ...defaultPhaseFromJHipster, ...defaultNodeClientPhaseSteps };
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const jhipsterNodeClientPhaseSteps = writeFiles();
        return { ...phaseFromJHipster, ...jhipsterNodeClientPhaseSteps };
    }

    get postWriting() {
        // you can use this phase to overwrite package.json
        return this._postWriting();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
