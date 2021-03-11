/* eslint-disable consistent-return */
const chalk = require('chalk');
const ServerGenerator = require('generator-jhipster/generators/server');
const jhipsterNodeConstants = require('../generator-nodejs-constants');
const writeFiles = require('./files').writeFiles;
const prompts = require('./prompts');

module.exports = class extends ServerGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhContext.jhipsterConfig || {};
    }

    get initializing() {
        const initPhaseFromJHipster = super._initializing();
        const jhipsterInitNodePhaseSteps = {
            setupNodeServerconsts() {
                this.packageName = jhipsterNodeConstants.PACKAGE_NAME_NODEJS;
                this.cacheProvider = jhipsterNodeConstants.CACHE_PROVIDER_NODEJS;
                this.enableHibernateCache = jhipsterNodeConstants.ENABLE_HIBERNATE_CACHE_NODEJS;
                this.websocket = jhipsterNodeConstants.WEB_SOCKET_NODEJS;
                this.searchEngine = jhipsterNodeConstants.SEARCH_ENGINE_NODEJS;
                this.messageBroker = jhipsterNodeConstants.MESSAGE_BROKER_NODEJS;
                this.serviceDiscoveryType = jhipsterNodeConstants.SERVICE_DISCOVERY_TYPE_NODEJS;
                this.buildTool = jhipsterNodeConstants.BUILD_TOOL_NODEJS;
                this.enableSwaggerCodegen = jhipsterNodeConstants.ENABLE_SWAGGER_CODEGEN_NODEJS;

                this.baseName = this.configOptions.baseName;
                this.databaseType = this.configOptions.databaseType;
                this.devDatabaseType = this.configOptions.devDatabaseType;
                this.prodDatabaseType = this.configOptions.prodDatabaseType;
                this.serverPort = this.configOptions.serverPort;
                this.authenticationType = this.configOptions.authenticationType;
            }
        };

        return { ...initPhaseFromJHipster, ...jhipsterInitNodePhaseSteps };

        //  return initPhaseFromJHipster;
    }

    get prompting() {
        //  The prompting phase is being overriden so that we can ask our own questions
        return {
            askForModuleName: prompts.askForModuleName,
            askForServerSideOpts: prompts.askForServerSideOpts,
            askForDatabaseType: prompts.askForDatabaseType,
            setSharedNodeConfigOptions() {
                this.configOptions.serverPort = this.serverPort;
                this.configOptions.baseName = this.baseName;
                this.configOptions.packageName = this.packageName;
                this.configOptions.cacheProvider = this.cacheProvider;
                this.configOptions.enableHibernateCache = this.enableHibernateCache;
                this.configOptions.websocket = this.websocket;
                this.configOptions.databaseType = this.databaseType;
                this.configOptions.devDatabaseType = this.devDatabaseType;
                this.configOptions.prodDatabaseType = this.prodDatabaseType;
                this.configOptions.searchEngine = this.searchEngine;
                this.configOptions.messageBroker = this.messageBroker;
                this.configOptions.serviceDiscoveryType = this.serviceDiscoveryType;
                this.configOptions.buildTool = this.buildTool;
                this.configOptions.enableSwaggerCodegen = this.enableSwaggerCodegen;
                this.configOptions.authenticationType = this.authenticationType;
                this.configOptions.testFrameworks = [];
            }
        };

        // If the prompts need to be overriden then use the code commented out above instead
        // return super._prompting();
    }

    get configuring() {
        return super._configuring();
    }

    get composing() {
        return this._composing();
    }

    get loading() {
        const confPhaseFromJHipster = super._loading();
        const jhipsterConfigNodeSteps = {
            setDockerDbPortValue() {
                if (this.prodDatabaseType === 'mysql') {
                    this.dbPortValue = 3307;
                } else if (this.prodDatabaseType === 'mssql') {
                    this.dbPortValue = 1434;
                } else if (this.prodDatabaseType === 'postgresql') {
                    this.dbPortValue = 5433;
                } else if (this.prodDatabaseType === 'mongodb') {
                    this.dbPortValue = 27018;
                } else if (this.prodDatabaseType === 'oracle') {
                    this.dbPortValue = 1521;
                }
            }
        };

        return { ...confPhaseFromJHipster, ...jhipsterConfigNodeSteps };
    }

    get preparing() {
        return this._preparing();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        // The writing phase is being overriden so that we can write our own templates as well.
        return writeFiles();
    }

    get postWriting() {
        return null;
    }

    get install() {
        const installPhaseFromJHipster = super._install();
        const jhipsterInstallNodeSteps = {
            /* istanbul ignore next */
            jhipsterNodeServerInstall() {
                if (this.skipServer) return;
                const logMsg = `To install your server dependencies manually, run: cd server && ${chalk.yellow.bold(
                    `${this.clientPackageManager} install`
                )}`;

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

        return { ...installPhaseFromJHipster, ...jhipsterInstallNodeSteps };

        // Here we are not overriding this phase and hence its being handled by JHipster
        // return super._install();
    }

    get end() {
        return {
            jhipsterNodeEnd() {
                this.log(chalk.green.bold('\nServer application generated successfully.\n'));

                const executable = `${this.clientPackageManager} run start:app`;

                const READMES = 'README.md and server/README.md';

                this.log(
                    chalk.green(
                        `Run your application :\n ${chalk.yellow.bold(
                            `${executable}`
                        )}\nOtherwise, run the npm scripts explained under ${chalk.yellow.bold(READMES)}`
                    )
                );
            }
        };
        // Here we are not overriding this phase and hence its being handled by JHipster
        // return super._end();
    }
};
