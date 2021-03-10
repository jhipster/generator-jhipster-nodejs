/* eslint-disable consistent-return */
const chalk = require('chalk');
const AppGenerator = require('generator-jhipster/generators/app');
const nodePackagejs = require('../../package.json');
const nodePromptApp = require('./prompts.js');

module.exports = class extends AppGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhContext.jhipsterConfig || {};

        // This adds support for a `--skip-i18n` flag for unit test
        this.option('skip-i18n', {
            desc: 'skip internationalization',
            type: Boolean,
            defaults: false
        });
    }

    get initializing() {
        const initPhaseFromJHipster = this._initializing();

        const nodeInitAppPhaseSteps = {
            /* eslint-disable */
            displayLogo() {
                this.log('\n');
                this.log(
                    `${chalk.yellow(' ███╗   ██╗')}${chalk.green(' ██╗   ██╗ ████████╗ ███████╗   ██████╗ ████████╗ ████████╗ ███████╗')}`
                );
                this.log(
                    `${chalk.yellow(' ████╗  ██║')}${chalk.green(' ██║   ██║ ╚══██╔══╝ ██╔═══██╗ ██╔════╝ ╚══██╔══╝ ██╔═════╝ ██╔═══██╗')}`
                );
                this.log(
                    `${chalk.yellow(' ██╔██╗ ██║')}${chalk.green(' ████████║    ██║    ███████╔╝ ╚█████╗     ██║    ██████╗   ███████╔╝')}`
                );
                this.log(
                    `${chalk.yellow(' ██║╚██╗██║')}${chalk.green(' ██╔═══██║    ██║    ██╔════╝   ╚═══██╗    ██║    ██╔═══╝   ██╔══██║')}`
                );
                this.log(
                    `${chalk.yellow(' ██║ ╚████║')}${chalk.green(' ██║   ██║ ████████╗ ██║       ██████╔╝    ██║    ████████╗ ██║  ╚██╗')}`
                );
                this.log(
                    `${chalk.yellow(' ╚═╝  ╚═══╝')}${chalk.green(
                        ' ╚═╝   ╚═╝ ╚═══════╝ ╚═╝       ╚═════╝     ╚═╝    ╚═══════╝ ╚═╝   ╚═╝'
                    )}\n`
                );
                this.log(chalk.white.bold('                            https://www.jhipster.tech\n'));
                this.log(
                    chalk.white('Welcome to NHipster (Jhipster NodeJS Official Blueprint) ') + chalk.yellow(`v${nodePackagejs.version}`)
                );
                this.log(chalk.white('This blueprint generates your backend in NodeJS with NestJS framework'));

                this.log(
                    chalk.green(
                        ' _______________________________________________________________________________________________________________\n'
                    )
                );
                this.log(
                    chalk.white(
                        `  For any questions or improvements refer to the stream lead at ${chalk.yellow(
                            'https://github.com/amanganiello90'
                        )}`
                    )
                );
                this.log(
                    chalk.white(
                        `  If you find NHipster useful, support and star the project at ${chalk.yellow(
                            'https://github.com/jhipster/generator-jhipster-nodejs'
                        )}`
                    )
                );
                this.log(
                    chalk.green(
                        ' _______________________________________________________________________________________________________________\n'
                    )
                );
                this.log(chalk.green.bold(' This NodeJS blueprint use these following configurations:\n'));
                this.log(chalk.green.bold(' 1. NestJS Framework with swagger doc\n'));
                this.log(chalk.green.bold(' 2. JWT or OAuth2 Passport security authentication\n'));
                this.log(chalk.green.bold(' 3. TypeORM usage with SQLite development database and versioning/migration\n'));
                this.log(
                    chalk.green.bold(' 4. Initial load data seed with users (using auth roles) integrated with the angular/react client\n')
                );
                this.log(chalk.green.bold(' 5. Eureka JS client registry\n'));
            },
            /* eslint-enable */
            // remove jhipster standard java requirement not used in this blueprint
            validateJava() {},

            customI18nSettings() {
                if (this.options['skip-i18n']) {
                    this.enableTranslation = false;
                    this.skipI18n = true;
                }
            }
        };

        return { ...initPhaseFromJHipster, ...nodeInitAppPhaseSteps };
    }

    get prompting() {
        const promptPhaseFromJHipster = super._prompting();
        return { ...promptPhaseFromJHipster, ...nodePromptApp };
    }

    get configuring() {
        const configuringPhaseFromJHipster = super._configuring();

        /* const jhipsterConfigureAppPhaseSteps = {
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
            }
        }; */

        return configuringPhaseFromJHipster;
        // return { ...configuringPhaseFromJHipster, ...jhipsterConfigureAppPhaseSteps };
    }

    get composing() {
        const defaultPhaseFromJHipster = super._composing();
        const jhipsterConfigureAppPhaseSteps = {
            askForTestOpts: {}
        };

        return { ...defaultPhaseFromJHipster, ...jhipsterConfigureAppPhaseSteps };
    }

    get loading() {
        return this._loading();
    }

    get preparing() {
        return this._preparing();
    }

    get default() {
        const defaultPhaseFromJHipster = super._default();
        const jhipsterConfigureAppPhaseSteps = {
            customTestSettings() {
                if (!this.skipClient) {
                    this.testFrameworks = ['protractor'];
                    this.protractorTests = true;
                } else {
                    this.testFrameworks = [];
                    this.protractorTests = false;
                }
            }
        };

        return { ...defaultPhaseFromJHipster, ...jhipsterConfigureAppPhaseSteps };
    }

    get writing() {
        const writingPhaseFromJHipster = super._writing();

        /* const jhipsterWritingAppPhaseSteps = {
            regenerateEntities() {
                if (this.withEntities) {
                    const options = this.options;
                    const configOptions = this.configOptions;
                    this.getExistingEntities().forEach(entity => {
                        this.composeWith(require.resolve('../entity'), {
                            ...options,
                            configOptions,
                            regenerate: true,
                            'skip-install': true,
                            debug: this.isDebugEnabled,
                            arguments: [entity.name]
                        });
                    });
                }
            }
        }; */

        return writingPhaseFromJHipster;
        // return { ...writingPhaseFromJHipster, ...jhipsterWritingAppPhaseSteps };
    }

    get postWriting() {
        return this._postWriting();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
