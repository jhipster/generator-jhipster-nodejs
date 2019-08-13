/* eslint-disable consistent-return */
const chalk = require('chalk');
const ServerGenerator = require('generator-jhipster/generators/server');
const constants = require('generator-jhipster/generators/generator-constants');
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
        /**
         * Any method beginning with _ can be reused from the superclass `ClientGenerator`
         *
         * There are multiple ways to customize a phase from JHipster.
         *
         * 1. Let JHipster handle a phase, blueprint doesnt override anything.
         * ```
         *      return super._initializing();
         * ```
         *
         * 2. Override the entire phase, this is when the blueprint takes control of a phase
         * ```
         *      return {
         *          myCustomInitPhaseStep() {
         *              // Do all your stuff here
         *          },
         *          myAnotherCustomInitPhaseStep(){
         *              // Do all your stuff here
         *          }
         *      };
         * ```
         *
         * 3. Partially override a phase, this is when the blueprint gets the phase from JHipster and customizes it.
         */
        const phaseFromJHipster = super._initializing();
        const myCustomPhaseSteps = {
            displayLogo() {
                // override the displayLogo method from the _initializing phase of JHipster
            },
            mySetupServerconsts() {
                this.packageName = 'com.example.node';
                this.buildTool = 'maven';
                this.enableHibernateCache = false;
                this.enableSwaggerCodegen = false;
                this.databaseType = 'mongodb';
                this.devDatabaseType = 'mongodb';
                this.prodDatabaseType = 'mongodb';
                this.skipUserManagement = false;
            }
        };
        return Object.assign(phaseFromJHipster, myCustomPhaseSteps);

        // Here we are not overriding this phase and hence its being handled by JHipster

        // return super._initializing();
    }

    get prompting() {
        // The prompting phase is being overriden so that we can ask our own questions
        return {
            askForMainServerSideOpts: prompts.askForMainServerSideOpts,
            setSharedConfigOptions() {
                this.configOptions.serverPort = this.serverPort;
                this.configOptions.baseName = this.baseName;
                this.configOptions.serverPackageManager = this.serverPackageManager;
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
                // Make dist dir available in templates
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);
                this.CLIENT_DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.configOptions.buildTool) + constants.CLIENT_DIST_DIR;
            }
        };

        // If the prompts need to be overriden then use the code commented out above instead
        // return super._prompting();
    }

    get configuring() {
        const phaseFromJHipster = super._configuring();
        const myCustomPhaseSteps = {
            mySaveConfig() {
                const config = {
                    serverPackageManager: this.serverPackageManager,
                    baseName: this.baseName
                };
                this.config.set(config);
            }
        };
        return Object.assign(phaseFromJHipster, myCustomPhaseSteps);

        // Here we are not overriding this phase and hence its being handled by JHipster
        // return super._configuring();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        // The writing phase is being overriden so that we can write our own templates as well.
        // If the templates doesnt need to be overrriden then just return `super._writing()` here
        const phaseFromJHipster = super._writing();
        const customPhaseSteps = writeFiles();
        return Object.assign(phaseFromJHipster, customPhaseSteps);
    }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
