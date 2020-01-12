/* eslint-disable consistent-return */
const chalk = require('chalk');
const _ = require('lodash');
const SpringServiceGenerator = require('generator-jhipster/generators/spring-service');
const writeFiles = require('./files').writeFiles;

module.exports = class extends SpringServiceGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhContext.configOptions || {};
    }

    get initializing() {
        const initPhaseFromJHipster = super._initializing();
        const initNodeServicePhaseSteps = {
            // variables to use in templates
            setupCustomNodeConsts() {
                this.serviceFileName = this.name;
                this.serviceClass = _.upperFirst(this.name);
            }
        };
        return Object.assign(initPhaseFromJHipster, initNodeServicePhaseSteps);

        // Here we are not overriding this phase and hence its being handled by JHipster
        // return super._initializing();
    }

    get prompting() {
        return null;
        // Here we are not overriding this phase and hence its being handled by JHipster
        // return super._prompting();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        return writeFiles();
    }
};
