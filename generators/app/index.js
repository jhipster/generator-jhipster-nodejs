/* eslint-disable consistent-return */
const chalk = require('chalk');
const AppGenerator = require('generator-jhipster/generators/app');

module.exports = class extends AppGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhContext.configOptions || {};
    }

    get initializing() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return this._initializing();
    }

    get prompting() {
        // If the prompts need to be overriden then use the code commented out above instead
        return super._prompting();
    }

    get configuring() {
        const configuringPhaseFromJHipster = super._configuring();
        /*
        configuringPhaseFromJHipster.askFori18n = {};
        */
        return configuringPhaseFromJHipster;
    }

    get default() {
        const defaultPhaseFromJHipster = super._default();
        /* defaultPhaseFromJHipster.askForTestOpts = {};
        defaultPhaseFromJHipster.askForMoreModules = {};
        */
        return defaultPhaseFromJHipster;
    }

    get writing() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._writing();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
