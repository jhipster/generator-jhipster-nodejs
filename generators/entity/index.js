/* eslint-disable consistent-return */
const chalk = require('chalk');
const EntityGenerator = require('generator-jhipster/generators/entity');

module.exports = class extends EntityGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupEntityOptions(this, jhContext, this);
    }

    get initializing() {
        return super._initializing();
    }

    get prompting() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._prompting();
    }

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get writing() {
        return {
            composeServer() {
                const context = this.context;
                if (context.skipServer) return;
                const configOptions = this.configOptions;

                this.composeWith(require.resolve('../entity-server'), {
                    context,
                    configOptions,
                    force: context.options.force,
                    debug: context.isDebugEnabled
                });
            },

            composeClient() {
                const context = this.context;
                if (context.skipClient) return;
                const configOptions = this.configOptions;

                this.composeWith(require.resolve('../entity-client'), {
                    context,
                    configOptions,
                    'skip-install': context.options['skip-install'],
                    force: context.options.force,
                    debug: context.isDebugEnabled
                });
            },

            composeI18n() {
                const context = this.context;
                if (context.skipClient) return;
                const configOptions = this.configOptions;
                this.composeWith(require.resolve('../entity-i18n'), {
                    context,
                    configOptions,
                    'skip-install': context.options['skip-install'],
                    force: context.options.force,
                    debug: context.isDebugEnabled
                });
            }
        };
    }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }
};
