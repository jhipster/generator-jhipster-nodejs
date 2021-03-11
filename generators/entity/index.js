/* eslint-disable consistent-return */
const chalk = require('chalk');
const EntityGenerator = require('generator-jhipster/generators/entity');

module.exports = class extends EntityGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhContext.jhipsterConfig || {};
        this.configOptions.skipDbChangelog = true;
        this.options.skipDbChangelog = true;
    }

    get initializing() {
        return super._initializing();
    }

    get prompting() {
        return this._prompting();
    }

    get configuring() {
        return this._configuring();
    }

    get composing() {
        return this._composing();
    }

    get loading() {
        return this._loading();
    }

    get preparing() {
        return this._preparing();
    }

    get preparingRelationships() {
        return this._preparingRelationships();
    }

    get writing() {
        return this._writing();
    }

    /* get writing() {
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

                context.testFrameworks = ['protractor'];
                context.protractorTests = true;
                const configOptions = this.configOptions;

                this.composeWith(require.resolve('generator-jhipster/generators/entity-client'), {
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
                this.composeWith(require.resolve('generator-jhipster/generators/entity-i18n'), {
                    context,
                    configOptions,
                    'skip-install': context.options['skip-install'],
                    force: context.options.force,
                    debug: context.isDebugEnabled
                });
            }
        };
    } */

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }
};
