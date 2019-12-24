/* eslint-disable consistent-return */
const chalk = require('chalk');
const _ = require('lodash');
const SpringControllerGenerator = require('generator-jhipster/generators/spring-controller');
const writeFiles = require('./files').writeFiles;

module.exports = class extends SpringControllerGenerator {
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
        const initNodeControllerPhaseSteps = {
            // variables to use in templates
            setupCustomNodeConsts() {
                this.controllerFileName = this.name;
                this.controllerClass = _.upperFirst(this.name);
            }
        };
        return Object.assign(initPhaseFromJHipster, initNodeControllerPhaseSteps);

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
