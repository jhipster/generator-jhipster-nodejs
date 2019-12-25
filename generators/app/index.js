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
        const initPhaseFromJHipster = this._initializing();

        const jhipsterInitAppPhaseSteps = {
            displayLogo() {}
        };

        return Object.assign(initPhaseFromJHipster, jhipsterInitAppPhaseSteps);
    }

    get prompting() {
        // If the prompts need to be overriden then use the code commented out above instead
        return super._prompting();
    }

    get configuring() {
        const configuringPhaseFromJHipster = super._configuring();

        const jhipsterConfigureAppPhaseSteps = {
            composeServer() {
                if (this.skipServer) return;
                const options = this.options;
                const configOptions = this.configOptions;

                this.composeWith(require.resolve('../server'), {
                    ...options,
                    configOptions,
                    'client-hook': !this.skipClient,
                    debug: this.isDebugEnabled
                });
            },

            composeClient() {
                if (this.skipClient) return;
                const options = this.options;
                const configOptions = this.configOptions;

                this.composeWith(require.resolve('../client'), {
                    ...options,
                    configOptions,
                    debug: this.isDebugEnabled
                });
            },

            composeCommon() {
                const options = this.options;
                const configOptions = this.configOptions;

                this.composeWith(require.resolve('../common'), {
                    ...options,
                    'client-hook': !this.skipClient,
                    configOptions,
                    debug: this.isDebugEnabled
                });
            },

            askFori18n: {}
        };

        return Object.assign(configuringPhaseFromJHipster, jhipsterConfigureAppPhaseSteps);
    }

    get default() {
        const defaultPhaseFromJHipster = super._default();
        const jhipsterConfigureAppPhaseSteps = {
            askForTestOpts: {},
            askForMoreModules: {}
        };

        return Object.assign(defaultPhaseFromJHipster, jhipsterConfigureAppPhaseSteps);
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
