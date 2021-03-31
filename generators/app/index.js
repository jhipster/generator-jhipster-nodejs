/* eslint-disable consistent-return */
const chalk = require('chalk');
const AppGenerator = require('generator-jhipster/generators/app');
const nodePackagejs = require('../../package.json');

module.exports = class extends AppGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhContext.configOptions || {};

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
            validateJava() {}
        };

        return { ...initPhaseFromJHipster, ...nodeInitAppPhaseSteps };
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        const configuringPhaseFromJHipster = super._configuring();

        const jhipsterConfigureAppPhaseSteps = {
            customI18n() {
                if (this.options['skip-i18n']) {
                    this.configOptions.enableTranslation = false;
                    this.configOptions.skipI18n = true;
                }
            }
        };

        return { ...configuringPhaseFromJHipster, ...jhipsterConfigureAppPhaseSteps };
    }

    get composing() {
        const composingPhaseFromJHipster = super._composing();
        composingPhaseFromJHipster.askForTestOpts = {};
        return composingPhaseFromJHipster;
    }

    get loading() {
        return super._loading();
    }

    get preparing() {
        return this._preparing();
    }

    get default() {
        return super._default();
    }

    get writing() {
        return super._writing();
    }

    get postWriting() {
        return super._postWriting();
    }

    get install() {
        const installPhaseFromJHipster = super._install();

        const nodeServerInstall = {
            /* istanbul ignore next */
            jhipsterNodeServerInstall() {
                if (this.skipServer) return;
                const logMsg = `To install your server dependencies manually, run: cd server && ${chalk.yellow.bold('npm install')}`;

                if (this.options.skipInstall) {
                    this.log(logMsg);
                } else {
                    try {
                        this.log(chalk.bold('\nInstalling server dependencies using npm'));
                        this.spawnCommandSync('npm', ['install'], { cwd: `${process.cwd()}/server` });
                    } catch (e) {
                        this.warning('Install of server dependencies failed!');
                        this.log(logMsg);
                    }
                }
            }
        };
        return { ...installPhaseFromJHipster, ...nodeServerInstall };
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
