/* eslint-disable consistent-return */
const chalk = require('chalk');
const ServerGenerator = require('generator-jhipster/generators/server');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const os = require('os');
const jhipsterNodeConstants = require('../generator-nodejs-constants');
const packagejs = require('../../package.json');
const writeFiles = require('./files').writeFiles;
const prompts = require('./prompts');

module.exports = class extends ServerGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint nodejs')}`);
        }

        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupServerOptions(this, jhContext);
    }

    get initializing() {
        const initPhaseFromJHipster = super._initializing();
        const jhipsterInitNodePhaseSteps = {
            /* eslint-disable */
            displayNHipsterLogo() {
                this.log('\n');
                this.log(`${chalk.yellow(' ███╗   ██╗')}${chalk.green(' ██╗   ██╗ ████████╗ ███████╗   ██████╗ ████████╗ ████████╗ ███████╗')}`);
                this.log(`${chalk.yellow(' ████╗  ██║')}${chalk.green(' ██║   ██║ ╚══██╔══╝ ██╔═══██╗ ██╔════╝ ╚══██╔══╝ ██╔═════╝ ██╔═══██╗')}`);
                this.log(`${chalk.yellow(' ██╔██╗ ██║')}${chalk.green(' ████████║    ██║    ███████╔╝ ╚█████╗     ██║    ██████╗   ███████╔╝')}`);
                this.log(`${chalk.yellow(' ██║╚██╗██║')}${chalk.green(' ██╔═══██║    ██║    ██╔════╝   ╚═══██╗    ██║    ██╔═══╝   ██╔══██║')}`);
                this.log(`${chalk.yellow(' ██║ ╚████║')}${chalk.green(' ██║   ██║ ████████╗ ██║       ██████╔╝    ██║    ████████╗ ██║  ╚██╗')}`);
                this.log(`${chalk.yellow(' ╚═╝  ╚═══╝')}${chalk.green(' ╚═╝   ╚═╝ ╚═══════╝ ╚═╝       ╚═════╝     ╚═╝    ╚═══════╝ ╚═╝   ╚═╝')}\n`);
                this.log(chalk.white.bold('                            https://www.jhipster.tech\n'));
                this.log(chalk.white('Welcome to NHipster (Jhipster NodeJS Official Blueprint) ') + chalk.yellow(`v${packagejs.version}`));
                this.log(chalk.white('This blueprint generates your backend in NodeJS with NestJS framework'));

                this.log(
                    chalk.green(
                        ' _______________________________________________________________________________________________________________\n'
                    )
                );
                this.log(
                    chalk.white(
                        `  For any questions or improvements refer to the stream lead at ${chalk.yellow('https://github.com/amanganiello90')}`
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
            }

        };
        /* eslint-enable */
        return Object.assign(initPhaseFromJHipster, jhipsterInitNodePhaseSteps);

        //  return initPhaseFromJHipster;
    }

    get prompting() {
        //  The prompting phase is being overriden so that we can ask our own questions
        return {
            askForMainServerSideOpts: prompts.askForMainServerSideOpts,
            setSharedNodeConfigOptions() {
                this.configOptions.serverPort = this.serverPort;
                this.configOptions.baseName = this.baseName;
                this.configOptions.mongoProdDatabase = this.mongoProdDatabase;
                this.configOptions.packageName = jhipsterNodeConstants.PACKAGE_NAME_NODEJS;
                this.configOptions.cacheProvider = jhipsterNodeConstants.CACHE_PROVIDER_NODEJS;
                this.configOptions.enableHibernateCache = jhipsterNodeConstants.ENABLE_HIBERNATE_CACHE_NODEJS;
                this.configOptions.websocket = jhipsterNodeConstants.WEB_SOCKET_NODEJS;
                this.configOptions.databaseType = jhipsterNodeConstants.DATABASE_TYPE_NODEJS;
                this.configOptions.devDatabaseType = jhipsterNodeConstants.DEV_DATABASE_TYPE_NODEJS;
                this.configOptions.prodDatabaseType = jhipsterNodeConstants.PROD_DATABASE_TYPE_NODEJS;
                this.configOptions.searchEngine = jhipsterNodeConstants.SEARCH_ENGINE_NODEJS;
                this.configOptions.messageBroker = jhipsterNodeConstants.MESSAGE_BROKER_NODEJS;
                this.configOptions.serviceDiscoveryType = jhipsterNodeConstants.SERVICE_DISCOVERY_TYPE_NODEJS;
                this.configOptions.buildTool = jhipsterNodeConstants.BUILD_TOOL_NODEJS;
                this.configOptions.enableSwaggerCodegen = jhipsterNodeConstants.ENABLE_SWAGGER_CODEGEN_NODEJS;
                this.configOptions.authenticationType = jhipsterNodeConstants.AUTHENTICATION_TYPE_NODEJS;
                // Make dist dir available in templates
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.configOptions.buildTool);
                this.CLIENT_DIST_DIR =
                    this.getResourceBuildDirectoryForBuildTool(this.configOptions.buildTool) + jhipsterConstants.CLIENT_DIST_DIR;
            }
        };

        // If the prompts need to be overriden then use the code commented out above instead
        // return super._prompting();
    }

    get configuring() {
        const confPhaseFromJHipster = super._configuring();
        /* const jhipsterConfigNodeSteps = {
            jhipsterNodeSaveConfig() {
                const config = {
                    serverPackageManager: this.serverPackageManager,
                    baseName: this.baseName
                };
                this.config.set(config);
            }
        };
        return Object.assign(phaseFromJHipster, jhipsterConfigNodeSteps);
        */
        // Here we are not overriding this phase and hence its being handled by JHipster
        return confPhaseFromJHipster;
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        // The writing phase is being overriden so that we can write our own templates as well.
        return writeFiles();
    }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }

    get end() {
        return {
            jhipsterNodeEnd() {
                this.log(chalk.green.bold('\nServer application generated successfully.\n'));

                const executable = 'mvnw clean package -Pdev';

                let logMsgComment = '';
                if (os.platform() === 'win32') {
                    logMsgComment = ` (${chalk.yellow.bold(executable)} if using Windows Command Prompt)`;
                }
                this.log(chalk.green(`Run your Spring Boot application:\n${chalk.yellow.bold(`./${executable}`)}${logMsgComment}`));
            }
        };
        // Here we are not overriding this phase and hence its being handled by JHipster
        // return super._end();
    }
};
