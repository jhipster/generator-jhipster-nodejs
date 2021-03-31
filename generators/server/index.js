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

        this.configOptions = jhContext.configOptions || {};

        // This adds support for a `--skip-i18n` flag for unit test
        this.option('skip-i18n', {
            desc: 'skip internationalization',
            type: Boolean,
            defaults: false
        });
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

                this.baseName = this.configOptions.baseName || this.jhipsterConfig.baseName;
                this.serverPort = this.configOptions.serverPort || this.jhipsterConfig.serverPort;
                this.authenticationType = this.configOptions.authenticationType || this.jhipsterConfig.authenticationType;
                this.databaseType = this.configOptions.databaseType || this.jhipsterConfig.databaseType;
                this.prodDatabaseType = this.configOptions.prodDatabaseType || this.jhipsterConfig.prodDatabaseType;
                this.devDatabaseType = jhipsterNodeConstants.DEV_DATABASE_TYPE_NODEJS;
                if (this.prodDatabaseType === jhipsterNodeConstants.MONGODB_DATABASE_TYPE_NODEJS) {
                    this.devDatabaseType = this.prodDatabaseType;
                }
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

                this.jhipsterConfig.serverPort = this.serverPort;
                this.jhipsterConfig.baseName = this.baseName;
                this.jhipsterConfig.packageName = this.packageName;
                this.jhipsterConfig.databaseType = this.databaseType;
                this.jhipsterConfig.devDatabaseType = this.devDatabaseType;
                this.jhipsterConfig.prodDatabaseType = this.prodDatabaseType;
                this.jhipsterConfig.authenticationType = this.authenticationType;
            }
        };

        // If the prompts need to be overriden then use the code commented out above instead
        // return super._prompting();
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
        return writeFiles();
    }

    get postWriting() {
        return null;
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
